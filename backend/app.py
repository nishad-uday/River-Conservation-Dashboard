from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import os
import webbrowser
import threading
import time

from utils import ensure_storage, save_reading, get_recent

app = Flask(__name__)
CORS(app)

MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "model.pkl")
model = joblib.load(MODEL_PATH)

ensure_storage()

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()
    values = [
        data["pH"],
        data["EC"],
        data["TDS"],
        data["Temperature"],
        data["DissolvedOxygen"],
        data["Moisture"]
    ]

    prob = model.predict_proba([values])[0]
    pred = int(model.predict([values])[0])

    # ---- Rule-based safety check ----
    pH, EC, TDS, Temp, DO, Moisture = values
    if (pH < 6.5 or pH > 8.5) or (TDS > 1000) or (DO < 4) or (EC > 2000) or (Moisture < 10):
        pred = 0  # polluted
        prob = [0.9, 0.1]

    # Add model_result info for frontend compatibility
    result_obj = {"quality": int(pred), "probability": float(prob[pred])}

    # Save reading along with result
    record = data.copy()
    record["model_result"] = result_obj
    save_reading(record)

    print("Saved:", record)
    return jsonify(result_obj)


@app.route("/ingest", methods=["POST"])
def ingest():
    data = request.get_json()
    # Optional: also predict before saving
    values = [
        data["pH"],
        data["EC"],
        data["TDS"],
        data["Temperature"],
        data["DissolvedOxygen"],
        data["Moisture"]
    ]
    pred = int(model.predict([values])[0])
    prob = model.predict_proba([values])[0]
    result_obj = {"quality": int(pred), "probability": float(prob[pred])}

    data["model_result"] = result_obj
    save_reading(data)
    return jsonify({"status": "ok"})


@app.route("/recent", methods=["GET"])
def recent():
    return jsonify(get_recent())


def open_frontend():
    time.sleep(2)
    file = os.path.abspath("../frontend/index.html")
    webbrowser.open("file:///" + file)


if __name__ == "__main__":
    threading.Thread(target=open_frontend).start()
    app.run(host="127.0.0.1", port=5000, debug=False)
