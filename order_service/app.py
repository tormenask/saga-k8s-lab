from flask import Flask, request, jsonify
import uuid

app = Flask(__name__)

orders = []

@app.route('/create', methods=['POST'])
def create_order():
    """
    Crea una nueva orden de compra.
    """
    data = request.json
    user = data.get('user')

    if not user:
        return jsonify({"error": "Falta el campo 'user'"}), 400

    order_id = str(uuid.uuid4())
    order = {
        "id": order_id,
        "user": user,
        "status": "CREATED"
    }
    orders.append(order)
    return jsonify({
        "message": f"Orden creada exitosamente para {user}",
        "order_id": order_id
    }), 200


@app.route('/cancel', methods=['POST'])
def cancel_order():
    """
    Cancela una orden existente (compensación del Saga).
    """
    data = request.json
    order_id = data.get('order_id')

    for order in orders:
        if order["id"] == order_id:
            order["status"] = "CANCELLED"
            return jsonify({
                "message": f"Orden {order_id} cancelada exitosamente"
            }), 200

    return jsonify({"message": f"No se encontró la orden {order_id}"}), 404


@app.route('/orders', methods=['GET'])
def get_orders():
    """
    Lista todas las órdenes creadas.
    """
    return jsonify(orders), 200


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=6001)
