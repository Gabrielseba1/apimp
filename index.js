require('dotenv').config();
const express = require('express');
const mercadopago = require('mercadopago');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;


if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
  throw new Error('MERCADOPAGO_ACCESS_TOKEN não está definida');
}

mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
});

app.use(bodyParser.json());


console.log('API de pagamento está rodando com sucesso');

app.post('/gerar-pagamento', async (req, res) => {
  console.log('Recebido POST /gerar-pagamento com body:', req.body);
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
    console.log('Preferência de pagamento criada com sucesso:', response.body);
    res.json({ id: response.body.id, init_point: response.body.init_point });
  } catch (error) {
    console.error('Erro ao criar preferência de pagamento:', error);
    res.status(500).send(`Erro ao criar preferência de pagamento: ${error.message}`);
  }
});


app.get('/status-pagamento/:id', async (req, res) => {
  const paymentId = req.params.id;
  console.log('Recebido GET /status-pagamento/:id com ID:', paymentId);

  try {
    const payment = await mercadopago.payment.findById(paymentId);
    console.log('Status do pagamento:', payment.body.status);
    res.json({ status: payment.body.status });
  } catch (error) {
    console.error('Erro ao verificar status do pagamento:', error);
    res.status(500).send(`Erro ao verificar status do pagamento: ${error.message}`);
  }
});

app.get('/success', (req, res) => {
  console.log('Recebido GET /success');
  res.send('Pagamento realizado com sucesso!');
});

app.get('/failure', (req, res) => {
  console.log('Recebido GET /failure');
  res.send('Falha no pagamento.');
});

app.get('/pending', (req, res) => {
  console.log('Recebido GET /pending');
  res.send('Pagamento pendente.');
});

app.listen(port, () => {
  console.log(`API rodando na porta ${port}`);
});
