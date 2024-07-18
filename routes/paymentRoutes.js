const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.post('/gerar-pagamento', paymentController.gerarPagamento);
router.get('/status-pagamento/:id', paymentController.statusPagamento);


router.get('/success', (req, res) => {
  res.send('Pagamento realizado com sucesso!');
});

router.get('/failure', (req, res) => {
  res.send('Falha no pagamento.');
});

router.get('/pending', (req, res) => {
  res.send('Pagamento pendente.');
});

module.exports = router;
