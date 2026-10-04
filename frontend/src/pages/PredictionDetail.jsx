import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchPrediction } from '../api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts';
import './PredictionDetail.css';

function RiskGauge({ score, level }) {
  /* Circular arc gauge: 180° sweep */
  const radius = 80;
  const cx = 100;
  const cy = 100;
  const startAngle = Math.PI;        /* left */
  const endAngle = 0;                /* right */
  const scoreAngle = startAngle - (score / 100) * Math.PI;

  const arcPath = (start, end) => {
    const x1 = cx + radius * Math.cos(start);
    const y1 = cy - radius * Math.sin(start);
    const x2 = cx + radius * Math.cos(end);
    const y2 = cy - radius * Math.sin(end);
    const largeArc = Math.abs(start - end) > Math.PI ? 1 : 0;
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
  };

  const color = level.includes('HIGH') ? '#ef4444'
    : level.includes('MEDIUM') ? '#f59e0b' : '#10b981';

  return (
    <div className="risk-gauge">
      <svg viewBox="0 0 200 120" className="gauge-svg">
        <defs>
          <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>
        {/* Background arc */}
        <path d={arcPath(startAngle, endAngle)} fill="none" stroke="#E2E8F0" strokeWidth="14" strokeLinecap="round" />
        {/* Value arc */}
        <path d={arcPath(startAngle, scoreAngle)} fill="none" stroke="url(#gaugeGrad)" strokeWidth="14" strokeLinecap="round" />
        {/* Needle dot */}
        <circle
          cx={cx + radius * Math.cos(scoreAngle)}
          cy={cy - radius * Math.sin(scoreAngle)}
          r="6"
          fill={color}
          stroke="#F8FAFC"
          strokeWidth="3"
        />
      </svg>
      <div className="gauge-value" style={{ color }}>{score}%</div>
      <div className="gauge-label">{level}</div>
    </div>
  );
}

export default function PredictionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPrediction(id)
      .then(setPrediction)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="page-enter">
        <div className="skeleton" style={{ width: 300, height: 32, marginBottom: 16 }} />
        <div className="skeleton" style={{ width: '100%', height: 400 }} />
      </div>
    );
  }
  if (error) {
    return (
      <div className="page-enter">
        <div className="form-error">{error}</div>
        <button className="btn btn-secondary" onClick={() => navigate('/')}>Back to Dashboard</button>
      </div>
    );
  }

  const p = prediction;
  const pd = p.patient_data;

  /* Build SHAP factor chart data */
  const shapData = p.top_factors.map((f) => {
    const increases = f.includes('increases');
    const label = f.replace(/ \((increases|decreases) risk\)/, '');
    return { name: label, value: increases ? 1 : -1, direction: increases ? 'increases' : 'decreases' };
  });

  return (
    <div className="page-enter">
      <div className="detail-header">
        <button className="btn btn-ghost" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <div>
          <h1 className="page-title">Risk Assessment Result</h1>
          <p className="page-subtitle">
            {new Date(p.timestamp).toLocaleString()} &middot; ID: {p.id.slice(0, 8)}
          </p>
        </div>
      </div>

      <div className="detail-grid">
        {/* ── Left: Gauge + Patient Info ── */}
        <div className="detail-left">
          <div className="card gauge-card">
            <RiskGauge score={p.risk_score} level={p.risk_level} />
          </div>

          <div className="card patient-card">
            <h3 className="card-section-title">Patient Profile</h3>
            <div className="patient-info-grid">
              <div className="info-item">
                <span className="info-label">Age</span>
                <span className="info-value">{pd.age} years</span>
              </div>
              <div className="info-item">
                <span className="info-label">Gender</span>
                <span className="info-value">{pd.gender}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Prior Admissions</span>
                <span className="info-value">{pd.num_prior_admissions}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Length of Stay</span>
                <span className="info-value">{pd.length_of_stay} days</span>
              </div>
              <div className="info-item">
                <span className="info-label">Medications</span>
                <span className="info-value">{pd.num_medications}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Discharge</span>
                <span className="info-value">{pd.discharge_to_home ? 'Home' : 'Facility'}</span>
              </div>
            </div>
            <div className="condition-tags">
              {pd.has_diabetes === 1 && <span className="condition-tag">Diabetes</span>}
              {pd.has_chf === 1 && <span className="condition-tag tag-high">CHF</span>}
              {pd.has_copd === 1 && <span className="condition-tag">COPD</span>}
              {pd.creatinine_high === 1 && <span className="condition-tag tag-warn">High Creatinine</span>}
              {pd.hemoglobin_low === 1 && <span className="condition-tag tag-warn">Low Hemoglobin</span>}
            </div>
          </div>
        </div>

        {/* ── Right: SHAP + Explanation + Recommendations ── */}
        <div className="detail-right">
          {/* SHAP Factors */}
          <div className="card">
            <h3 className="card-section-title">Key Risk Factors (SHAP)</h3>
            <div className="shap-chart-container">
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={shapData} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(67,56,202,.08)" horizontal={false} />
                  <XAxis type="number" domain={[-1.5, 1.5]} hide />
                  <YAxis type="category" dataKey="name" width={180} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <ReferenceLine x={0} stroke="#E2E8F0" />
                  <Tooltip
                    contentStyle={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 8, color: '#1E293B', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                    formatter={(v) => [v > 0 ? 'Increases risk' : 'Decreases risk', 'Impact']}
                  />
                  <Bar dataKey="value" radius={[4, 4, 4, 4]} barSize={24}>
                    {shapData.map((d, i) => (
                      <Cell key={i} fill={d.value > 0 ? '#ef4444' : '#10b981'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="shap-legend">
              <span className="shap-legend-item"><span className="shap-dot" style={{ background: '#ef4444' }} /> Increases risk</span>
              <span className="shap-legend-item"><span className="shap-dot" style={{ background: '#10b981' }} /> Decreases risk</span>
            </div>
          </div>

          {/* AI Explanation */}
          <div className="card explanation-card">
            <div className="explanation-header">
              <h3 className="card-section-title">AI Clinical Explanation</h3>
              <span className={`badge ${p.llm_success ? 'badge-low' : 'badge-high'}`}>
                {p.llm_success ? 'Gemini AI' : 'Fallback'}
              </span>
            </div>
            <div className="explanation-text">{p.explanation}</div>
          </div>

          {/* Recommendations */}
          <div className="card recommendations-card">
            <h3 className="card-section-title">Recommended Actions</h3>
            <div className="recommendation-list">
              {p.recommendations.map((rec, i) => (
                <div key={i} className="recommendation-item">
                  <div className="rec-number">{i + 1}</div>
                  <span>{rec.replace(/^\d+\.\s*/, '')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
