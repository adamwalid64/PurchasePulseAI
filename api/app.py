from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import os
import pandas as pd
from sklearn.metrics import confusion_matrix

app = Flask(__name__)
CORS(app)

# Load model and dataset relative to repository root
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, 'prediction', 'logistic_model.pkl')
DATA_PATH = os.path.join(BASE_DIR, 'prediction', 'dataset1.csv')

model = joblib.load(MODEL_PATH)

df = pd.read_csv(DATA_PATH)
X_full = df[['Age', 'NumberOfPurchases', 'LoyaltyProgram', 'DiscountsAvailed']].copy()
X_full['LPxD'] = X_full['LoyaltyProgram'] * X_full['DiscountsAvailed']
TEST_X = X_full.iloc[:1500].to_numpy()
TEST_Y = df['PurchaseStatus'].iloc[:1500].to_numpy()

@app.post('/predict')
def predict():
    data = request.get_json()
    features = data['features']
    columns = ['Age', 'NumberOfPurchases', 'LoyaltyProgram', 'DiscountsAvailed', 'LoyaltyProgram_Discounts']
    X_input = pd.DataFrame([features], columns=columns)
    prediction = model.predict(X_input)[0]
    return jsonify({'prediction': int(prediction)})

@app.get('/performance')
def performance():
    named = pd.DataFrame(TEST_X, columns=[
        'Age', 'NumberOfPurchases', 'LoyaltyProgram', 'DiscountsAvailed', 'LoyaltyProgram_Discounts'
    ])
    preds = model.predict(named)
    tn, fp, fn, tp = confusion_matrix(TEST_Y, preds).ravel()
    return jsonify({'TP': int(tp), 'TN': int(tn), 'FP': int(fp), 'FN': int(fn)})

@app.get('/importance')
def importance():
    feature_names = ['age', 'purchases', 'loyalty', 'discounts', 'discounts x loyalty']
    coefficients = model.coef_[0]
    importance = np.abs(coefficients)
    feature_importance = [
        {'name': name, 'value': float(val)}
        for name, val in zip(feature_names, importance)
    ]
    feature_importance.sort(key=lambda x: x['value'], reverse=True)
    return jsonify(feature_importance)

