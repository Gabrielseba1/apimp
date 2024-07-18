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
    payment_methods: {
      excluded_payment_types: [
        { id: 'ticket' }
      ],
      installments: 1
    }
  };

  try {
    const response = await mercadopago.preferences.create(preference);
    res.json({ id: response.body.id, init_point: response.body.init_point });
  } catch (error) {
    res.status(500).send(`Erro ao criar preferência de pagamento: ${error.message}`);
  }
};

exports.statusPagamento = async (req, res) => {
  const paymentId = req.params.id;

  try {
    const payment = await mercadopago.payment.findById(paymentId);
    res.json({ status: payment.body.status });
  } catch (error) {
    res.status(500).send(`Erro ao verificar status do pagamento: ${error.message}`);
  }
};
