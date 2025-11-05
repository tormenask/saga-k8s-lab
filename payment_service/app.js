const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const payments = [];

const randomFailure = (probability = 0.4) => {
    return Math.random() < probability;
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

app.post('/pay', async (req, res) => {
  const { orderId, amount } = req.body;

  //console.log(`[Payment Service] Starting payment for order ${orderId}`);

  const existing = payments.find(p => p.orderId === orderId);
  if (existing) {
    return res.status(400).json({ message: 'Payment already exists' });
  }


  const payment = { orderId, amount, status: 'PROCESSING' };
  payments.push(payment);

  await delay(3000);


  if (payment.status === 'CANCELLED') {
    //console.log(`[Payment Service] Payment for order ${orderId} was cancelled mid-process`);
    return res.status(400).json({ message: 'Payment was cancelled before completion' });
  }

  if (randomFailure()) {
    payment.status = 'FAILED';
    //console.log(`[Payment Service] Payment failed for order ${orderId}`);
    return res.status(500).json({ message: 'Payment processing failed' });
  }

  payment.status = 'PAID';
  //console.log(`[Payment Service] Payment successful for order ${orderId}`);
  res.status(200).json({ message: 'Payment processed successfully' });
});

// Endpoint para cancelar un pago
app.post('/cancel', (req, res) => {
  const { orderId } = req.body;
  const payment = payments.find(p => p.orderId === orderId);

  if (!payment) {
    return res.status(404).json({ message: 'Payment not found' });
  }

  // Solo se permite cancelar si el pago está en "PROCESSING"
  if (payment.status !== 'PROCESSING') {
    return res.status(400).json({
      message: `Cannot cancel payment in status "${payment.status}"`
    });
  }

  payment.status = 'CANCELLED';
  console.log(`[Payment Service] Payment cancelled for order ${orderId}`);
  res.status(200).json({ message: 'Payment cancelled successfully' });
});

// Ver todos los pagos
app.get('/payments', (req, res) => res.json(payments));

app.listen(6002, () => console.log('Payment Service running on port 6002'));