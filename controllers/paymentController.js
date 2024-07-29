const mercadopago = require('mercadopago');

mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
});

exports.gerarPagamento = async (req, res) => {
  const { valor } = req.body;

  if (!valor) {
    return res.status(400).send('O valor é obrigatório');
  }

  const preference = {
    items: [
      {
        title: 'Produto de Exemplo',
        unit_price: parseFloat(valor),
        quantity: 1,
      }
    ],
    back_urls: {
      success: `${req.protocol}://${req.get('host')}/success`,
      failure: `${req.protocol}://${req.get('host')}/failure`,
      pending: `${req.protocol}://${req.get('host')}/pending`
    },
    auto_return: 'approved',
    external_reference: `ref-${Date.now()}`,
    payment_methods: {
      excluded_payment_types: [
        { id: 'credit_card' },
        { id: 'ticket' }
      ],
      installments: 1,
      default_payment_method_id: 'pix'
    }
  };

  try {
    const response = await mercadopago.preferences.create(preference);
    const init_point = response.body.init_point;

  
    const payment = await mercadopago.payment.create({
      transaction_amount: parseFloat(valor),
      payment_method_id: 'pix',
      payer: {
        email: 'wedledev@gmail.com.com'  
      }
    });

    const pix_qr_code = payment.body.point_of_interaction.transaction_data.qr_code_base64;
    const pix_copy_paste = payment.body.point_of_interaction.transaction_data.qr_code;

    res.json({
      id: response.body.id,
      init_point: init_point,
      external_reference: preference.external_reference,
      pix_qr_code: pix_qr_code,
      pix_copy_paste: pix_copy_paste
    });
  } catch (error) {
    res.status(500).send(`Erro ao criar preferência de pagamento: ${error.message}`);
  }
};

exports.statusPagamento = async (req, res) => {
  const externalReference = req.params.id;

  try {
    const searchResponse = await mercadopago.payment.search({
      qs: {
        external_reference: externalReference
      }
    });

    if (searchResponse.body.results.length > 0) {
      const paymentStatus = searchResponse.body.results[0].status;
      res.json({ status: paymentStatus });
    } else {
      res.status(404).send('Pagamento não encontrado');
    }
  } catch (error) {
    res.status(500).send(`Erro ao verificar status do pagamento: ${error.message}`);
  }
};
