require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use('/api', paymentRoutes);


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

app.listen(port, () => {
  console.log(`API rodando na porta ${port}`);
});
