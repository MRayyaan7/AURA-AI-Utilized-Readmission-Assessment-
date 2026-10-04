import joblib
import pandas as pd
import shap
from sklearn.metrics import roc_auc_score
from sklearn.model_selection import train_test_split
from xgboost import XGBClassifier


def main() -> None:
    data_path = "data/patient_readmission_data.csv"
    df = pd.read_csv(data_path)

    # One-hot encode gender while retaining deterministic feature columns.
    df = pd.get_dummies(df, columns=["gender"], drop_first=True)
    if "gender_Male" not in df.columns:
        df["gender_Male"] = 0

    target_col = "readmitted_30_days"
    feature_cols = [col for col in df.columns if col != target_col]

    X = df[feature_cols]
    y = df[target_col]

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y,
    )

    model = XGBClassifier(
        n_estimators=200,
        max_depth=4,
        learning_rate=0.08,
        subsample=0.9,
        colsample_bytree=0.9,
        eval_metric="logloss",
        random_state=42,
    )
    model.fit(X_train, y_train)

    y_proba = model.predict_proba(X_test)[:, 1]
    auc = roc_auc_score(y_test, y_proba)
    print(f"AUC-ROC: {auc:.4f}")

    explainer = shap.TreeExplainer(model)

    joblib.dump(model, "ml/model.joblib")
    joblib.dump(explainer, "ml/explainer.joblib")
    joblib.dump(feature_cols, "ml/features.joblib")
    print("Saved model, explainer, and feature list to ml/")


if __name__ == "__main__":
    main()
