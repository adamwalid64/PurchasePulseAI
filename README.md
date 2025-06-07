# 🛍️ PurchasePulse: Customer Retention Prediction Model

**PurchasePulse** is a machine learning-powered web app that predicts whether a customer will make a repeat purchase based on behavioral and demographic data. Built with React for the frontend and a logistic regression model on the backend, this tool enables businesses to assess customer retention likelihood and make data-driven marketing decisions.

---

## 🚀 Features

- 🧠 **Logistic Regression Model** trained on real customer behavior data  
- 📊 **Prediction Dashboard** with user-friendly form input  
- 📈 **Model Performance** visualized with a pie chart (TP, TN, FP, FN)  
- 🧮 **Feature Importance** bar chart based on model coefficients  
- 📋 **Dataset Preview** for quick reference to the training data  
- 🎨 Clean UI built with React, Bootstrap, and Recharts  

---

## 🖼️ Demo Screenshot

![PurchasePulse Dashboard Screenshot](https://via.placeholder.com/1000x500?text=Demo+Screenshot)

---

## ⚙️ Tech Stack

| Frontend        | Backend         | ML & Data              |
|-----------------|------------------|------------------------|
| React + Vite    | Flask (Python)   | Logistic Regression    |
| Bootstrap       | REST API         | Gradient Descent       |
| Recharts        | CORS + Fetch     | Customer Dataset       |

---

## 🧪 How It Works

1. User inputs values for:
   - Age
   - Number of Purchases
   - Loyalty Program (Yes/No)
   - Number of Discounts Used  
2. The app computes an additional interaction feature: `loyalty × discounts`  
3. These values are sent via POST request to a Flask backend  
4. The ML model predicts:
   - `1` = The customer is likely to return  
   - `0` = The customer will likely churn  
5. The frontend displays:
   - Prediction result  
   - Pie chart of model performance (TP, TN, FP, FN)  
   - Feature importance chart  

---

## 📂 Project Structure



