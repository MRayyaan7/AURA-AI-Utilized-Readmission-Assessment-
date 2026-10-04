import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { predict } from '../api';
import './NewAssessment.css';

const INITIAL = {
  age: '',
  gender: 'Male',
  num_prior_admissions: '',
  length_of_stay: '',
  num_medications: '',
  has_diabetes: 0,
  has_chf: 0,
  has_copd: 0,
  creatinine_high: 0,
  hemoglobin_low: 0,
  discharge_to_home: 1,
};

function Toggle({ label, value, onChange, id }) {
  return (
    <label className="toggle-group" htmlFor={id}>
      <div
        className={`toggle-track${value ? ' active' : ''}`}
        onClick={() => onChange(value ? 0 : 1)}
        role="switch"
        aria-checked={!!value}
        id={id}
      >
        <div className="toggle-knob" />
      </div>
      <span className="toggle-label">{label}</span>
    </label>
  );
}

export default function NewAssessment() {
  const [form, setForm] = useState(INITIAL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const setToggle = (key) => (val) => setForm({ ...form, [key]: val });

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const payload = {
      ...form,
      age: Number(form.age),
      num_prior_admissions: Number(form.num_prior_admissions),
      length_of_stay: Number(form.length_of_stay),
      num_medications: Number(form.num_medications),
    };

    try {
      const result = await predict(payload);
      navigate(`/prediction/${result.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const isValid =
    form.age !== '' &&
    form.num_prior_admissions !== '' &&
    form.length_of_stay !== '' &&
    form.num_medications !== '';

  return (
    <div className="page-enter">
      <div className="page-header">
        <h1 className="page-title">New Assessment</h1>
        <p className="page-subtitle">Enter patient data to predict 30-day readmission risk</p>
      </div>

      <form className="assess-form" onSubmit={handleSubmit}>
        {/* Demographics */}
        <div className="form-section">
          <div className="form-section-header">
            <span className="material-symbols-outlined form-section-icon">person</span>
            <h3 className="form-section-title">Demographics</h3>
          </div>
          <div className="form-grid">
            <div className="input-group">
              <label className="input-label" htmlFor="age">Age (years)</label>
              <input
                id="age"
                type="number"
                className="input-field"
                placeholder="e.g. 72"
                min={0}
                max={120}
                value={form.age}
                onChange={set('age')}
                required
              />
            </div>
            <div className="input-group">
              <label className="input-label" htmlFor="gender">Gender</label>
              <select id="gender" className="input-field" value={form.gender} onChange={set('gender')}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>
        </div>

        {/* Admission Details */}
        <div className="form-section">
          <div className="form-section-header">
            <span className="material-symbols-outlined form-section-icon">medical_information</span>
            <h3 className="form-section-title">Clinical History</h3>
          </div>
          <div className="form-grid">
            <div className="input-group">
              <label className="input-label" htmlFor="prior">Prior Admissions (12 months)</label>
              <input
                id="prior"
                type="number"
                className="input-field"
                placeholder="e.g. 3"
                min={0}
                value={form.num_prior_admissions}
                onChange={set('num_prior_admissions')}
                required
              />
            </div>
            <div className="input-group">
              <label className="input-label" htmlFor="los">Length of Stay (days)</label>
              <input
                id="los"
                type="number"
                className="input-field"
                placeholder="e.g. 8"
                min={1}
                value={form.length_of_stay}
                onChange={set('length_of_stay')}
                required
              />
            </div>
            <div className="input-group">
              <label className="input-label" htmlFor="meds">Medications at Discharge</label>
              <input
                id="meds"
                type="number"
                className="input-field"
                placeholder="e.g. 14"
                min={0}
                value={form.num_medications}
                onChange={set('num_medications')}
                required
              />
            </div>
          </div>
        </div>

        {/* Conditions */}
        <div className="form-section">
          <div className="form-section-header">
            <span className="material-symbols-outlined form-section-icon">monitor_heart</span>
            <h3 className="form-section-title">Conditions & Markers</h3>
          </div>
          <div className="toggle-grid">
            <Toggle label="Diabetes" value={form.has_diabetes} onChange={setToggle('has_diabetes')} id="diabetes" />
            <Toggle label="Congestive Heart Failure (CHF)" value={form.has_chf} onChange={setToggle('has_chf')} id="chf" />
            <Toggle label="COPD" value={form.has_copd} onChange={setToggle('has_copd')} id="copd" />
            <Toggle label="Elevated Creatinine" value={form.creatinine_high} onChange={setToggle('creatinine_high')} id="creatinine" />
            <Toggle label="Low Hemoglobin" value={form.hemoglobin_low} onChange={setToggle('hemoglobin_low')} id="hemoglobin" />
            <Toggle label="Discharged to Home" value={form.discharge_to_home} onChange={setToggle('discharge_to_home')} id="discharge" />
          </div>
        </div>

        {error && <div className="form-error">{error}</div>}

        <div className="form-actions">
          <button type="submit" className="btn-predict" disabled={!isValid || loading}>
            {loading ? (
              <>
                <span className="spinner" />
                Analyzing...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">magic_button</span>
                Run AI Prediction
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
