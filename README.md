# Trading Dashboard

A web platform to answer your stock performance queries.

## Why This Project?
- Stock and option data is **abundantly available** (historical prices, technical indicators).  
- There are **several tools for gathering this data**, such as Yahoo Finance, Alpha Vantage, and web scrapers.  
- **Relevance:** A large portion of the population participates in trading at some level.  

## Our Two-Pronged Approach

We structure our solution into **two complementary layers**:

### 1. Long-Term Predictions
- **Objective:** Estimate the returns of a stock after a chosen time horizon (e.g., 3 months, 6 months, 1 year).  
- **Method:**  
  - Analyze historical data alongside broader parameters (earnings growth, policy, macroeconomic variables).  
  - Build models that outperform a random walk baseline.  
  - Pipeline:  
    1. Predict future values of influencing parameters (e.g., revenue growth, volatility).  
    2. Use these parameter forecasts to compute expected stock returns.  
- **Example Models:** Bayesian probabilistic forecasting for parameter prediction, followed by return estimation.  

### 2. Short-Term Predictions + Recommendation System
- **Objective:** Provide actionable guidance (buy/hold/avoid/short) based on near-term stock behavior.  
- **Method:**  
  - Core predictor model outputs **numeric values** such as:  
    - Future return estimates (e.g., next week % change).  
    - Risk measures and volatility forecasts.  
    - Probability distributions of possible outcomes.  
  - Recommendation system applies **business logic** to translate numeric values into actions:  
    - *Predicted return > risk-adjusted threshold → Mark as “Buy Candidate”*.  
    - *Expected downside > cutoff → Mark as Avoid/Short*.  
  - Additional layers: filtering, prioritization, and categorization across multiple stocks.  

This layered approach ensures that **long-term investors** receive parameter-driven return estimates, while **short-term traders** get a recommendation engine tuned for actionable signals.  

## What We Plan to Do
1. **Data Collection:**  
   - Gather historical stock data using Yahoo Finance datasets and the `yfinance` Python library.

2. **Exploratory Data Analysis (EDA) & Preprocessing:**  
   - Understand data distributions, detect anomalies, and clean/normalize data.

3. **Feature Engineering:**  
   - Reduce dimensionality and extract useful information like moving averages, RSI, MACD, etc.

4. **Data Analysis & Modeling:**  
   - Apply regression, LSTM, or other models to understand trends and make predictions.

5. **Training & Validation:**  
   - Evaluate model accuracy and performance using relevant metrics.

6. **User Interface (Web-based):**  
   - Users can enter stock symbols and parameter values.  
   - Dashboard displays insights, charts, and predictions interactively.
