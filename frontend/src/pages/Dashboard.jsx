import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchDashboardStats, fetchPredictions } from '../api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import './Dashboard.css';

const RISK_COLORS = {
  'HIGH RISK': '#ef4444',
  'MEDIUM RISK': '#f59e0b',
  'LOW RISK': '#10b981',
};

function RiskBadge({ level }) {
  const cls = level.includes('HIGH') ? 'badge-high'
    : level.includes('MEDIUM') ? 'badge-medium' : 'badge-low';
  return <span className={`badge ${cls}`}>{level}</span>;
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      fetchDashboardStats(),
      fetchPredictions({ limit: 5 }),
    ])
      .then(([s, r]) => { setStats(s); setRecent(r); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;

  const pieData = [
    { name: 'High', value: stats.high_risk_count, color: RISK_COLORS['HIGH RISK'] },
    { name: 'Medium', value: stats.medium_risk_count, color: RISK_COLORS['MEDIUM RISK'] },
    { name: 'Low', value: stats.low_risk_count, color: RISK_COLORS['LOW RISK'] },
  ].filter(d => d.value > 0);

  const barData = recent.map((p, i) => ({
    name: `#${recent.length - i}`,
    score: p.risk_score,
    fill: RISK_COLORS[p.risk_level],
  })).reverse();

  return (
    <div className="page-enter">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Overview of readmission risk assessments</p>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid-4 dash-stats">
        <div className="card stat-card">
          <div className="stat-header">
            <span className="stat-label">Total Assessments</span>
            <span className="material-symbols-outlined stat-icon">analytics</span>
          </div>
          <span className="stat-value">{stats.total_predictions}</span>
        </div>
        <div className="card stat-card">
          <div className="stat-header">
            <span className="stat-label">High Risk</span>
            <span className="material-symbols-outlined stat-icon error">warning</span>
          </div>
          <span className="stat-value" style={{ color: '#DC2626' }}>
            {stats.high_risk_count}
          </span>
        </div>
        <div className="card stat-card">
          <div className="stat-header">
            <span className="stat-label">Average Score</span>
            <span className="material-symbols-outlined stat-icon">percent</span>
          </div>
          <span className="stat-value">{stats.average_risk_score}%</span>
        </div>
        <div className="card stat-card">
          <div className="stat-header">
            <span className="stat-label">LLM Success Rate</span>
            <span className="material-symbols-outlined stat-icon">memory</span>
          </div>
          <span className="stat-value">{Math.round(stats.llm_success_rate * 100)}%</span>
        </div>
      </div>

      {/* ── Charts row ── */}
      <div className="grid-2 dash-charts">
        <div className="card">
          <h3 className="chart-title">Risk Distribution</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  dataKey="value"
                  paddingAngle={3}
                  stroke="none"
                >
                  {pieData.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 8, color: '#1E293B', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">
              <span className="material-symbols-outlined" style={{ fontSize: 48, opacity: 0.2 }}>pie_chart</span>
              No data yet
            </div>
          )}
          <div className="pie-legend">
            {pieData.map((d, i) => (
              <span key={i} className="pie-legend-item">
                <span className="pie-dot" style={{ background: d.color }} />
                {d.name}: {d.value}
              </span>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="chart-title">Recent Scores</h3>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(67,56,202,.08)" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis domain={[0, 100]} stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 8, color: '#1E293B', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                  formatter={(v) => [`${v}%`, 'Risk Score']}
                />
                <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                  {barData.map((d, i) => (
                    <Cell key={i} fill={d.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">
              <span className="material-symbols-outlined" style={{ fontSize: 48, opacity: 0.2 }}>bar_chart</span>
              No data yet
            </div>
          )}
        </div>
      </div>

      {/* ── Recent predictions table ── */}
      <div className="card dash-recent">
        <div className="dash-recent-header">
          <h3 className="chart-title" style={{ margin: 0 }}>Recent Assessments</h3>
          {recent.length > 0 && (
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/history')}>
              View all
            </button>
          )}
        </div>
        {recent.length > 0 ? (
          <div className="dash-table-wrapper">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Age</th>
                  <th>Gender</th>
                  <th>Risk Score</th>
                  <th>Level</th>
                  <th>LLM</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((p) => (
                  <tr key={p.id} onClick={() => navigate(`/prediction/${p.id}`)} className="dash-table-row group">
                    <td className="text-muted">{new Date(p.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                    <td>{p.patient_data.age}</td>
                    <td>{p.patient_data.gender}</td>
                    <td className="text-mono" style={{ fontWeight: 500 }}>{p.risk_score}%</td>
                    <td><RiskBadge level={p.risk_level} /></td>
                    <td>{p.llm_success ? '✓' : '—'}</td>
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
        ) : (
          <div className="chart-empty" style={{ padding: '2rem' }}>
            No assessments yet.{' '}
            <button className="btn btn-primary" onClick={() => navigate('/assess')}>
              Run your first assessment
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div>
      <div className="page-header">
        <div className="skeleton" style={{ width: 180, height: 32, marginBottom: 8 }} />
        <div className="skeleton" style={{ width: 300, height: 18 }} />
      </div>
      <div className="grid-4 dash-stats">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card"><div className="skeleton" style={{ height: 72 }} /></div>
        ))}
      </div>
    </div>
  );
}
