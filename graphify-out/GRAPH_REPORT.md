# Graph Report - .  (2026-04-20)

## Corpus Check
- Corpus is ~1,239 words - fits in a single context window. You may not need a graph.

## Summary
- 44 nodes · 62 edges · 8 communities detected
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.6)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]

## God Nodes (most connected - your core abstractions)
1. `assess_patient()` - 5 edges
2. `prepare_patient_data()` - 3 edges
3. `get_top_shap_factors()` - 3 edges
4. `PatientInput` - 2 edges
5. `predict()` - 2 edges
6. `generate_synthetic_data()` - 2 edges
7. `main()` - 2 edges
8. `Convert input data to match model features - FIXED to maintain correct order.` - 1 edges
9. `Get top N risk factors using SHAP values.` - 1 edges
10. `Main function: predict risk and generate explanation.` - 1 edges

## Surprising Connections (you probably didn't know these)
- `predict()` --calls--> `assess_patient()`  [INFERRED]
  api\main.py → api\agent.py

## Hyperedges (group relationships)
- **ML Training Pipeline** —  [INFERRED]
- **Prediction API** —  [INFERRED]
- **Inference System** —  [INFERRED]

## Communities

### Community 0 - "Community 0"
Cohesion: 0.0
Nodes (11): SHAP TreeExplainer, XGBClassifier, explainer.joblib, features.joblib, joblib, model.joblib, requirements.txt, shap (+3 more)

### Community 1 - "Community 1"
Cohesion: 0.0
Nodes (6): FastAPI, PatientInput, BaseModel, PatientInput, predict(), main.py

### Community 2 - "Community 2"
Cohesion: 0.0
Nodes (8): ChatGoogleGenerativeAI, PromptTemplate, agent.py, assess_patient(), check_models.py, get_top_shap_factors(), langchain, prepare_patient_data()

### Community 3 - "Community 3"
Cohesion: 0.0
Nodes (6): assess_patient(), get_top_shap_factors(), prepare_patient_data(), Get top N risk factors using SHAP values., Main function: predict risk and generate explanation., Convert input data to match model features - FIXED to maintain correct order.

### Community 4 - "Community 4"
Cohesion: 0.0
Nodes (4): create_data.py, generate_synthetic_data(), pandas, patient_readmission_data.csv

### Community 5 - "Community 5"
Cohesion: 0.0
Nodes (2): generate_synthetic_data(), main()

### Community 6 - "Community 6"
Cohesion: 0.0
Nodes (0): 

### Community 7 - "Community 7"
Cohesion: 0.0
Nodes (0): 

## Knowledge Gaps
- **3 isolated node(s):** `Convert input data to match model features - FIXED to maintain correct order.`, `Get top N risk factors using SHAP values.`, `Main function: predict risk and generate explanation.`
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 6`** (2 nodes): `train_model.py`, `main()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 7`** (1 nodes): `check_models.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.