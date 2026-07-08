import os, joblib, pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report

BASE = os.path.dirname(__file__)
DATA_CSV = os.path.join(BASE, "data", "water_data_5000.csv")
MODEL_OUT = os.path.join(BASE, "models", "model.pkl")
os.makedirs(os.path.dirname(MODEL_OUT), exist_ok=True)

print("Loading", DATA_CSV)
df = pd.read_csv(DATA_CSV)
features = ["pH","EC","TDS","Temperature","DissolvedOxygen","Moisture"]
X = df[features]
y = df["Label"]

X_train, X_test, y_train, y_test = train_test_split(X,y,test_size=0.2, random_state=42)
model = RandomForestClassifier(n_estimators=200, random_state=42)
model.fit(X_train, y_train)

preds = model.predict(X_test)
print("Accuracy:", accuracy_score(y_test, preds))
print(classification_report(y_test, preds))

joblib.dump(model, MODEL_OUT)
print("Model saved to", MODEL_OUT)
