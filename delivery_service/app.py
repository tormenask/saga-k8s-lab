from flask import Flask, request, jsonify

app = Flask(__name__)


deliveries = []


@app.route('/assign', methods=['POST'])
def assign_delivery():
    data = request.json
    user = data.get('user')
    package = data.get('package')
    driver = data.get('driver')

    if not user or not package or not driver:
        return jsonify({"error": "Faltan datos: user, package o driver"}), 400

    
    delivery = {"user": user, "package": package, "driver": driver, "status": "asignada"}
    deliveries.append(delivery)

    return jsonify({
        "message": f"Entrega asignada a {driver} para {user} - Paquete: {package}",
        "delivery": delivery
    }), 200


@app.route('/cancel', methods=['POST'])
def cancel_delivery():
    data = request.json
    user = data.get('user')
    package = data.get('package')

    if not user or not package:
        return jsonify({"error": "Faltan datos: user o package"}), 400


    found = next((d for d in deliveries if d["user"] == user and d["package"] == package), None)
    if found:
        found["status"] = "cancelada"
        return jsonify({"message": f"Entrega de {user} cancelada - Paquete: {package}", "delivery": found}), 200
    else:
        return jsonify({"message": f"No se encontró entrega para {user} - Paquete: {package}"}), 404


@app.route('/deliveries', methods=['GET'])
def list_deliveries():
    return jsonify(deliveries), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=6003)
