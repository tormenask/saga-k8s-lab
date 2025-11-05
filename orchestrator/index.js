const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

// URLs de los microservicios
const SERVICES = {
    order: 'http://order_service:6001',
    payment: 'http://payment_service:6002',
    delivery: 'http://delivery_service:6003',
    notification: 'http://notification_service:6004'
};

// Función para manejar peticiones seguras
const callService = async (url, method = 'post', data = {}) => {
    try {
        const res = await axios({ method, url, data });
        return { success: true, data: res.data };
    } catch (error) {
        console.error(`Error calling ${url}:`, error.response?.data || error.message);
        return { success: false, error: error.response?.data || error.message };
    }
};

// Endpoint principal del orquestador
app.post('/start-delivery', async (req, res) => {
    const { user, amount } = req.body;

    // Crear orden (✅ corregido)
    // Crear orden
    const orderRes = await callService(`${SERVICES.order}/create`, 'post', { user });
    if (!orderRes.success) {
        return res.status(500).json({ message: 'Order creation failed' });
    }
    const orderId = orderRes.data.order_id;
    

    // Procesar pago
    const paymentRes = await callService(`${SERVICES.payment}/pay`, 'post', { orderId, amount });
    if (!paymentRes.success) {
        console.log(`💸 Payment failed. Starting compensation...`);
        await callService(`${SERVICES.order}/cancel`, 'post', { order_id: orderId });
        return res.status(500).json({ message: 'Payment failed', step: 'payment' });
    }

    // Asignar entrega
    const deliveryRes = await callService(`${SERVICES.delivery}/assign`, 'post', {
        user,
        package: `Pedido #${orderId}`,
        driver: 'juan'
    });
    if (!deliveryRes.success) {
        console.log(`📦 Delivery assignment failed. Starting compensation...`);
        await callService(`${SERVICES.payment}/cancel`, 'post', { orderId });
        await callService(`${SERVICES.order}/cancel`, 'post', { order_id: orderId });
        return res.status(500).json({ message: 'Delivery failed', step: 'delivery' });
    }

    // Enviar notificación
    const notifyRes = await callService(`${SERVICES.notification}/notify`, 'post', {
        user,
        order_id: orderId,
        message: `Tu pedido #${orderId} fue confirmado y será entregado pronto.`
    });
    if (!notifyRes.success) {
        console.log(`🔔 Notification failed (non-critical). Saga completed with warnings.`);
    }

    console.log(`✅ Saga completed successfully for order ${orderId}`);
    res.status(200).json({ message: 'Delivery workflow completed successfully', orderId });
});

app.listen(6000, () => console.log('🧩 Orchestrator running on port 6000'));
