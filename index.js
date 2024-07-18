require('dotenv').config();
const express = require('express');
const mercadopago = require('mercadopago');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;


mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
});

app.use(bodyParser.json());


app.post('/gerar-pagamento', async (req, res) => {
  const { valor } = req.body;

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
    res.status(500).send(error.message);
  }
});

app.get('/status-pagamento/:id', async (req, res) => {
  const paymentId = req.params.id;

  try {
    const payment = await mercadopago.payment.findById(paymentId);
    res.json({ status: payment.body.status });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get('/success', (req, res) => {
  res.send('Pagamento realizado com sucesso!');
});

app.get('/failure', (req, res) => {
  res.send('Falha no pagamento.');
});

app.get('/pending', (req, res) => {
  res.send('Pagamento pendente.');
});

app.listen(port, () => {
  console.log(`API rodando na porta ${port}`);
});
