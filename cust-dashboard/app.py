from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import os
from sklearn.metrics import confusion_matrix
import pandas as pd

app = Flask(__name__)
CORS(app)

# Load model
base_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(base_dir, 'prediction', 'logistic_model.pkl')
model = joblib.load(model_path)

# Performance Testing
data_path = os.path.join(base_dir, 'dataset1.csv')
df = pd.read_csv(data_path)

X_full = df[['Age', 'NumberOfPurchases', 'LoyaltyProgram', 'DiscountsAvailed']].copy()
X_full['LPxD'] = X_full['LoyaltyProgram'] * X_full['DiscountsAvailed']
test_X = X_full.iloc[:1500].to_numpy()

test_y = df['PurchaseStatus'].iloc[:1500].to_numpy()



@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    features = data['features']
    
    # Match trained model's feature names
    column_names = ['Age', 'NumberOfPurchases', 'LoyaltyProgram', 'DiscountsAvailed', 'LoyaltyProgram_Discounts']
    X_input = pd.DataFrame([features], columns=column_names)

    prediction = model.predict(X_input)[0]
    return jsonify({'prediction': int(prediction)})

# @app.route('/predict', methods=['POST'])
# def predict():
#     data = request.get_json()
#     features = data.get('features', [])

#     if not features:
#         return jsonify({'error': 'No features provided'}), 400

#     prediction = model.predict([features])[0]
#     return jsonify({'prediction': int(prediction)})


@app.route('/performance', methods=['GET'])
def performance():
    # Use capitalized column names to match training
    test_X_named = pd.DataFrame(test_X, columns=[
        'Age', 'NumberOfPurchases', 'LoyaltyProgram', 'DiscountsAvailed', 'LoyaltyProgram_Discounts'
    ])

    preds = model.predict(test_X_named)
    tn, fp, fn, tp = confusion_matrix(test_y, preds).ravel()

    return jsonify({
        'TP': int(tp),
        'TN': int(tn),
        'FP': int(fp),
        'FN': int(fn)
    })

# @app.route('/performance', methods=['GET'])
# def performance():
#     preds = model.predict(test_X)
#     tn, fp, fn, tp = confusion_matrix(test_y, preds).ravel()

#     return jsonify({
#         'TP': int(tp),
#         'TN': int(tn),
#         'FP': int(fp),
#         'FN': int(fn)
#     })

@app.route('/importance', methods=['GET'])
def importance():
    feature_names = ['age', 'purchases', 'loyalty', 'discounts', 'discounts x loyalty']
    coefficients = model.coef_[0]
    importance = np.abs(coefficients)

    feature_importance = [
        {"name": name, "value": float(val)}
        for name, val in zip(feature_names, importance)
    ]

    feature_importance.sort(key=lambda x: x["value"], reverse=True)
    return jsonify(feature_importance)

if __name__ == '__main__':
    app.run(debug=True)
