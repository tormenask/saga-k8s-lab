const express = require('express');
const app = express();

app.use(express.json());

// "Base de datos" en memoria para almacenar notificaciones
const notifications = [];

// Endpoint para enviar notificación
app.post('/notify', (req, res) => {
    const { user, message, order_id } = req.body;
    
    const notification = {
        id: notifications.length + 1,
        user: user,
        message: message,
        order_id: order_id,
        timestamp: new Date().toISOString(),
        status: 'sent'
    };
    
    notifications.push(notification);
    
    console.log(`📧 Notification sent to ${user}: ${message}`);
    
    // Simulamos envío de notificación (siempre exitoso)
    res.json({
        status: 'success',
        message: 'Notification delivered successfully',
        notification: notification
    });
});

// Endpoint para obtener historial de notificaciones
app.get('/notifications', (req, res) => {
    res.json({
        total: notifications.length,
        notifications: notifications
    });
});

// Endpoint de salud
app.get('/health', (req, res) => {
    res.json({ 
        status: 'Notification Service is running',
        timestamp: new Date().toISOString()
    });
});

const PORT = process.env.PORT || 6004;
app.listen(PORT, () => {
    console.log(`📧 Notification Service running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/health`);
});