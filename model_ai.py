from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
import joblib
import json
import xgboost as xgb
from tensorflow.keras.models import Sequential, load_model
from tensorflow.keras.layers import Dense, Dropout
from tensorflow.keras.optimizers import Adam

app = Flask(__name__)
CORS(app)

# Mock database (in a real scenario, use a proper database)
documents = {}
users = {}
underwriting_results = {}

# Feature extraction function (mock version)
def extract_features(user_documents):
    # In a real scenario, this would analyze the documents and extract relevant features
    # For this example, we'll generate random features
    return np.random.rand(1, 20)  # Increased to 20 features for more complexity

# Load or train the models
try:
    rf_model = joblib.load('rf_underwriting_model.joblib')
    gb_model = joblib.load('gb_underwriting_model.joblib')
    xgb_model = joblib.load('xgb_underwriting_model.joblib')
    nn_model = load_model('nn_underwriting_model.h5')
    scaler = joblib.load('feature_scaler.joblib')
except:
    print("Training new models...")
    
    # Generate mock training data
    np.random.seed(42)
    X = np.random.rand(10000, 20)  # 20 features, 10000 samples
    y = np.exp(X[:, 0] + X[:, 1]**2 + np.random.normal(0, 0.1, 10000)) * 10000  # More complex target function

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Feature scaling
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Random Forest
    rf_model = RandomForestRegressor(n_estimators=200, random_state=42)
    rf_model.fit(X_train_scaled, y_train)

    # Gradient Boosting
    gb_model = GradientBoostingRegressor(n_estimators=200, random_state=42)
    gb_model.fit(X_train_scaled, y_train)

    # XGBoost
    xgb_model = xgb.XGBRegressor(n_estimators=200, random_state=42)
    xgb_model.fit(X_train_scaled, y_train)

    # Neural Network
    nn_model = Sequential([
        Dense(64, activation='relu', input_shape=(20,)),
        Dropout(0.2),
        Dense(32, activation='relu'),
        Dropout(0.2),
        Dense(16, activation='relu'),
        Dense(1)
    ])
    nn_model.compile(optimizer=Adam(learning_rate=0.001), loss='mean_squared_error')
    nn_model.fit(X_train_scaled, y_train, epochs=100, batch_size=32, validation_split=0.2, verbose=0)

    # Save models
    joblib.dump(rf_model, 'rf_underwriting_model.joblib')
    joblib.dump(gb_model, 'gb_underwriting_model.joblib')
    joblib.dump(xgb_model, 'xgb_underwriting_model.joblib')
    nn_model.save('nn_underwriting_model.h5')
    joblib.dump(scaler, 'feature_scaler.joblib')

    # Evaluate models
    models = {
        "Random Forest": rf_model,
        "Gradient Boosting": gb_model,
        "XGBoost": xgb_model,
        "Neural Network": nn_model
    }

    for name, model in models.items():
        if name == "Neural Network":
            y_pred = model.predict(X_test_scaled).flatten()
        else:
            y_pred = model.predict(X_test_scaled)
        mse = mean_squared_error(y_test, y_pred)
        mae = mean_absolute_error(y_test, y_pred)
        r2 = r2_score(y_test, y_pred)
        print(f"{name} - MSE: {mse:.2f}, MAE: {mae:.2f}, R2 Score: {r2:.2f}")

@app.route('/process_underwriting', methods=['POST'])
def process_underwriting():
    user_id = request.json['user_id']
    
    if user_id not in users:
        return jsonify({"error": "User not found"}), 404

    # Extract features from user's documents
    user_docs = [documents[doc_id] for doc_id in users[user_id] if doc_id in documents]
    features = extract_features(user_docs)

    # Scale features
    features_scaled = scaler.transform(features)

    # Make predictions using all models
    rf_pred = rf_model.predict(features_scaled)[0]
    gb_pred = gb_model.predict(features_scaled)[0]
    xgb_pred = xgb_model.predict(features_scaled)[0]
    nn_pred = nn_model.predict(features_scaled).flatten()[0]

    # Ensemble prediction (simple average)
    final_prediction = np.mean([rf_pred, gb_pred, xgb_pred, nn_pred])

    # Determine approval status based on prediction
    status = "Approved" if final_prediction <= 50000 else "Denied"

    result = {
        "status": status,
        "quotation": float(final_prediction),
        "confidence": calculate_confidence(rf_pred, gb_pred, xgb_pred, nn_pred),
        "model_predictions": {
            "random_forest": float(rf_pred),
            "gradient_boosting": float(gb_pred),
            "xgboost": float(xgb_pred),
            "neural_network": float(nn_pred)
        }
    }
    underwriting_results[user_id] = result

    return jsonify({"message": "Underwriting processed successfully"}), 200

def calculate_confidence(rf_pred, gb_pred, xgb_pred, nn_pred):
    predictions = [rf_pred, gb_pred, xgb_pred, nn_pred]
    variance = np.var(predictions)
    max_variance = np.square(np.max(predictions) - np.min(predictions)) / 4  # Maximum possible variance
    confidence = 1 - (variance / max_variance)
    return float(confidence)

@app.route('/get_underwriting_result', methods=['GET'])
def get_underwriting_result():
    user_id = request.args.get('user_id')

    if user_id not in underwriting_results:
        return jsonify({"error": "No underwriting result found"}), 404

    return jsonify(underwriting_results[user_id]), 200

if __name__ == '__main__':
    app.run(debug=True)