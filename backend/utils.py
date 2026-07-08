import os
import json
from datetime import datetime

STORAGE_DIR = os.path.join(os.path.dirname(__file__), "storage")
STORAGE_FILE = os.path.join(STORAGE_DIR, "readings.json")

def ensure_storage():
    os.makedirs(STORAGE_DIR, exist_ok=True)
    if not os.path.exists(STORAGE_FILE):
        with open(STORAGE_FILE, "w") as f:
            json.dump([], f)

def save_reading(record):
    ensure_storage()
    with open(STORAGE_FILE, "r") as f:
        data = json.load(f)

    record["timestamp"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    data.append(record)

    with open(STORAGE_FILE, "w") as f:
        json.dump(data, f, indent=4)

def get_recent(limit=100):
    ensure_storage()
    with open(STORAGE_FILE, "r") as f:
        data = json.load(f)
    return data[-limit:]
