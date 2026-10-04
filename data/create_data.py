import numpy as np
import pandas as pd


def generate_synthetic_data(n_samples: int = 500, random_state: int = 42) -> pd.DataFrame:
    rng = np.random.default_rng(random_state)

    age = rng.integers(18, 91, size=n_samples)
    gender = rng.choice(["Male", "Female"], size=n_samples, p=[0.48, 0.52])
    num_prior_admissions = np.clip(rng.poisson(lam=1.8, size=n_samples), 0, 10)
    length_of_stay = np.clip(rng.poisson(lam=5.5, size=n_samples) + 1, 1, 30)
    num_medications = np.clip(rng.normal(loc=8, scale=3, size=n_samples).round().astype(int), 1, 25)

    has_diabetes = rng.binomial(1, 0.28, size=n_samples)
    has_chf = rng.binomial(1, 0.18, size=n_samples)
    has_copd = rng.binomial(1, 0.16, size=n_samples)
    creatinine_high = rng.binomial(1, 0.22, size=n_samples)
    hemoglobin_low = rng.binomial(1, 0.24, size=n_samples)
    discharge_to_home = rng.binomial(1, 0.72, size=n_samples)

    # Weighted readmission risk with clinically plausible contributors.
    age_scaled = (age - 50) / 10
    prior_scaled = num_prior_admissions
    los_scaled = (length_of_stay - 5) / 5
    meds_scaled = (num_medications - 8) / 4

    linear_risk = (
        -2.2
        + 0.22 * age_scaled
        + 0.38 * prior_scaled
        + 0.12 * los_scaled
        + 0.06 * meds_scaled
        + 0.75 * has_chf
        + 0.45 * has_diabetes
        + 0.32 * has_copd
        + 0.58 * creatinine_high
        + 0.25 * hemoglobin_low
        - 0.40 * discharge_to_home
    )

    prob_readmit = 1.0 / (1.0 + np.exp(-linear_risk))
    readmitted_30_days = rng.binomial(1, prob_readmit, size=n_samples)

    df = pd.DataFrame(
        {
            "age": age,
            "gender": gender,
            "num_prior_admissions": num_prior_admissions,
            "length_of_stay": length_of_stay,
            "num_medications": num_medications,
            "has_diabetes": has_diabetes,
            "has_chf": has_chf,
            "has_copd": has_copd,
            "creatinine_high": creatinine_high,
            "hemoglobin_low": hemoglobin_low,
            "discharge_to_home": discharge_to_home,
            "readmitted_30_days": readmitted_30_days,
        }
    )

    return df


def main() -> None:
    df = generate_synthetic_data(n_samples=500, random_state=42)
    from pathlib import Path

    output_path = Path(__file__).resolve().parent / "patient_readmission_data.csv"
    df.to_csv(output_path, index=False)
    print(f"Synthetic dataset saved to {output_path} with shape {df.shape}")


if __name__ == "__main__":
    main()
