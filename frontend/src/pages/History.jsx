import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchPredictions } from '../api';
import './History.css';

const RISK_FILTERS = ['ALL', 'HIGH RISK', 'MEDIUM RISK', 'LOW RISK'];

function RiskBadge({ level }) {
  const cls = level.includes('HIGH') ? 'badge-high'
    : level.includes('MEDIUM') ? 'badge-medium' : 'badge-low';
  return <span className={`badge ${cls}`}>{level}</span>;
}

export default function History() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const navigate = useNavigate();

  useEffect(() => {
    const riskLevel = filter === 'ALL' ? undefined : filter;
    setLoading(true);
    fetchPredictions({ limit: 100, riskLevel })
      .then(setPredictions)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <div className="page-enter">
      <div className="page-header">
        <h1 className="page-title">Assessment History</h1>
        <p className="page-subtitle">Browse and filter past readmission risk assessments</p>
      </div>

      {/* Main card */}
      <div className="history-card">
        {/* Controls */}
        <div className="history-controls">
          <div className="history-search-wrapper">
            <span className="material-symbols-outlined history-search-icon">search</span>
            <input
              type="text"
              className="history-search-input"
              placeholder="Filter history..."
              // search logic would go here
            />
          </div>
          <div className="history-filters">
            {RISK_FILTERS.map((f) => (
              <button
                key={f}
                className={`btn ${filter === f ? 'btn-primary' : 'btn-ghost'} btn-sm`}
                onClick={() => setFilter(f)}
                style={{ padding: '0.375rem 0.75rem', borderRadius: '0.5rem' }}
              >
                {f === 'ALL' ? 'All Levels' : f}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="history-loading">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 48 }} />
            ))}
          </div>
        ) : predictions.length === 0 ? (
          <div className="history-empty">
            <span className="material-symbols-outlined" style={{ fontSize: 48, opacity: 0.2 }}>history</span>
            <p>No assessments found{filter !== 'ALL' ? ` for "${filter}"` : ''}.</p>
            <button className="btn btn-primary" onClick={() => navigate('/assess')}>
              Run an Assessment
            </button>
          </div>
        ) : (
          <div className="history-table-wrapper">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Age</th>
                  <th>Gender</th>
                  <th>Length of Stay</th>
                  <th>Risk Score</th>
                  <th>Risk Level</th>
                  <th>LLM Success</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {predictions.map((p) => (
                  <tr
                    key={p.id}
                    className="history-table-row group"
                    onClick={() => navigate(`/prediction/${p.id}`)}
                  >
                    <td className="text-muted">{new Date(p.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</td>
                    <td>{p.patient_data.age}</td>
                    <td>{p.patient_data.gender}</td>
                    <td>{p.patient_data.length_of_stay} Days</td>
                    <td className="text-mono" style={{ fontWeight: 600 }}>{p.risk_score}%</td>
                    <td><RiskBadge level={p.risk_level} /></td>
                    <td>
                      {p.llm_success ? (
                        <span className="material-symbols-outlined" style={{ color: '#059669', fontSize: 20 }}>check_circle</span>
                      ) : (
                        <span className="material-symbols-outlined" style={{ color: '#94A3B8', fontSize: 20 }}>cancel</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className="btn btn-ghost btn-sm" 
                        onClick={(e) => { e.stopPropagation(); navigate(`/prediction/${p.id}`); }}
                        style={{ padding: '4px', borderRadius: '50%' }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>visibility</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        {predictions.length > 0 && (
          <div className="history-footer">
            <span>Showing {predictions.length} entries</span>
            <div className="history-pagination">
              <button className="page-btn" disabled><span className="material-symbols-outlined">chevron_left</span></button>
              <button className="page-btn active">1</button>
              <button className="page-btn" disabled><span className="material-symbols-outlined">chevron_right</span></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
