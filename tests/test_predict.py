import os, sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
import json
from api.app import app


def test_predict_route():
    client = app.test_client()
    payload = {"features": [30, 2, 1, 1, 1]}
    response = client.post('/predict', json=payload)
    assert response.status_code == 200
    data = response.get_json()
    assert 'prediction' in data
