# AURA - AI-Utilized Readmission Assessment 🏥

**AURA** is a full-stack health-tech application designed to evaluate patient data and predict the likelihood of a 30-day hospital readmission. 

Built with a React frontend and a FastAPI backend, it leverages an **XGBoost** machine learning model for accurate risk scoring, **SHAP** for feature explainability, and the **Google Gemini LLM** to generate plain-text clinical insights and actionable recommendations.

---

## 🌟 Features
- **Predictive Risk Assessment:** Evaluate patient readmission risk dynamically based on vital metrics and clinical history.
- **Explainable AI:** Uses SHAP to identify and highlight the top risk factors contributing to a patient's score.
- **LLM Insights:** Generates natural language explanations and recommendations for healthcare providers using Google Gemini.
- **Analytics Dashboard:** Visualize aggregated prediction data and system health metrics.

## 🛠️ Tech Stack
- **Frontend:** React 19, Vite, React Router, Recharts, CSS (Vanilla)
- **Backend:** Python, FastAPI, Uvicorn
- **Machine Learning:** XGBoost, Scikit-learn, SHAP, Pandas, NumPy
- **Generative AI:** Google GenAI (Gemini)

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites
- Python 3.10+
- Node.js (v18 or higher)
- A Google Gemini API Key

### Environment Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/MRayyaan7/AURA-AI-Utilized-Readmission-Assessment-.git
   cd AURA-AI-Utilized-Readmission-Assessment-
   ```

2. **Set up your environment variables:**
   Create a `.env` file in the root directory and add your Google API key:
   ```env
   GOOGLE_API_KEY=your_gemini_api_key_here
   # DATABASE_URL=postgresql+psycopg://aura:aura@localhost:5432/aura  # uncomment to use PostgreSQL
   ```

3. **(Optional) Start PostgreSQL using Docker:**
   ```bash
   docker compose up -d
   ```

---

### Running the Backend

The backend is built with FastAPI and runs on port `8000`.

1. **Activate the Virtual Environment:**
   *(On Windows)*
   ```bash
   .\venv\Scripts\activate
   ```
   *(On macOS/Linux)*
   ```bash
   source venv/bin/activate
   ```

2. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run Database Migrations:**
   ```bash
   alembic upgrade head
   ```

4. **Start the FastAPI server:**
   ```bash
   uvicorn api.main:app --reload
   ```

*The backend will be available at `http://localhost:8000`.*
*API documentation is automatically generated at `http://localhost:8000/docs`.*

---

### Running the Frontend

The frontend is a Vite + React application and typically runs on port `5173`.

1. **Open a new terminal and navigate to the frontend folder:**
   ```bash
   cd frontend
   ```

2. **Install Node dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

*The frontend will be available at `http://localhost:5173`.*

---

## 📂 Project Structure

```
.
├── api/                  # FastAPI backend source code
│   ├── main.py           # Application entrypoint & routes
│   └── agent.py          # ML + LLM agent logic
├── data/                 # Raw data and dataset generation scripts
├── frontend/             # React + Vite frontend source code
│   ├── public/           # Static assets
│   └── src/              # React components and pages
├── ml/                   # Machine learning training scripts
├── requirements.txt      # Python dependencies
└── README.md
```

---

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! 
Feel free to check the [issues page](https://github.com/MRayyaan7/AURA-AI-Utilized-Readmission-Assessment-/issues).

## 📝 License
This project is open-source and available under the [MIT License](LICENSE).
