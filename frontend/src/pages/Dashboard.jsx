import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { fetchDashboardStats, fetchPredictions } from '../api';
import { RISK_THRESHOLDS } from '../config';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      fetchDashboardStats(),
      fetchPredictions({ limit: 10 }), // Fetches recent 10 to match chart
    ])
      .then(([s, r]) => { setStats(s); setRecent(r); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-[#5B625F]">Loading dashboard data...</div>;

  const total = stats.total_predictions || 1;
  const lowPct = ((stats.low_risk_count / total) * 100).toFixed(1);
  const medPct = ((stats.medium_risk_count / total) * 100).toFixed(1);
  const highPct = ((stats.high_risk_count / total) * 100).toFixed(1);

  return (
    <div className="flex flex-col w-full">
      {/* Page Header */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6">
        <div>
          <h1 className="font-headline-xl text-[32px] font-semibold text-[#1B1F1E] tracking-[-0.015em] leading-[38px]">Dashboard</h1>
          <p className="font-body-lg text-[15px] text-[#5B625F] leading-[22px] mt-1">Readmission risk assessments overview</p>
        </div>
        <div>
          <Link to="/assess" className="inline-flex items-center justify-center gap-1.5 h-[42px] px-5 bg-[#0F5C5A] hover:bg-[#0B4846] text-white font-body-md text-[14px] font-medium rounded-[6px] transition-colors">
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>New assessment</span>
          </Link>
        </div>
      </header>

      {/* Summary Strip */}
      <section className="bg-white rounded-[8px] border border-[#DDD8CC] px-6 py-5 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#DDD8CC]">
          <div className="py-2 sm:py-0 sm:pr-6">
            <span className="block text-[13px] text-[#5B625F] font-body-md">Total assessments</span>
            <span className="block font-headline-xl text-[32px] font-semibold text-[#1B1F1E] leading-[38px] mt-1.5">{stats.total_predictions}</span>
          </div>
          <div className="py-2 sm:py-0 sm:px-6">
            <span className="block text-[13px] text-[#5B625F] font-body-md">High risk</span>
            <span className="block font-headline-xl text-[32px] font-semibold text-[#B3382C] leading-[38px] mt-1.5">{stats.high_risk_count}</span>
          </div>
          <div className="py-2 sm:py-0 sm:px-6">
            <span className="block text-[13px] text-[#5B625F] font-body-md">Average risk score</span>
            <span className="block font-headline-xl text-[32px] font-semibold text-[#1B1F1E] leading-[38px] mt-1.5">{stats.average_risk_score}%</span>
          </div>
          <div className="py-2 sm:py-0 sm:pl-6">
            <span className="block text-[13px] text-[#5B625F] font-body-md">AI summary success rate</span>
            <span className="block font-headline-xl text-[32px] font-semibold text-[#1B1F1E] leading-[38px] mt-1.5">{Math.round(stats.llm_success_rate * 100)}%</span>
          </div>
        </div>
      </section>

      {/* Two-Column Row: Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Risk Distribution (5 Cols) */}
        <section className="lg:col-span-5 bg-white rounded-[8px] border border-[#DDD8CC] p-6 flex flex-col justify-between">
          <div>
            <h2 className="font-headline-md text-[20px] font-semibold text-[#1B1F1E] leading-[26px]">Risk distribution</h2>
            <p className="font-body-md text-[13px] text-[#5B625F] mt-1">Assessment breakdown across {stats.total_predictions} patients</p>
            {/* Stacked Horizontal Bar */}
            <div className="mt-8">
              <div className="w-full h-[28px] rounded-[4px] overflow-hidden flex border border-[#DDD8CC] bg-[#f3f4f6]">
                <div className="bg-[#2F7D4F] h-full" style={{ width: `${lowPct}%` }} title={`Low: ${stats.low_risk_count}`}></div>
                <div className="bg-[#B7791F] h-full" style={{ width: `${medPct}%` }} title={`Medium: ${stats.medium_risk_count}`}></div>
                <div className="bg-[#B3382C] h-full" style={{ width: `${highPct}%` }} title={`High: ${stats.high_risk_count}`}></div>
              </div>
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex flex-col gap-2.5 mt-8 pt-4 border-t border-[#DDD8CC]">
            <div className="flex items-center justify-between text-[14px] text-[#1B1F1E] font-body-md">
              <span className="inline-flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2F7D4F]"></span>
                <span>Low risk</span>
              </span>
              <span className="font-data-tabular text-[13px] text-[#5B625F]">{stats.low_risk_count} ({lowPct}%)</span>
            </div>
            <div className="flex items-center justify-between text-[14px] text-[#1B1F1E] font-body-md">
              <span className="inline-flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#B7791F]"></span>
                <span>Medium risk</span>
              </span>
              <span className="font-data-tabular text-[13px] text-[#5B625F]">{stats.medium_risk_count} ({medPct}%)</span>
            </div>
            <div className="flex items-center justify-between text-[14px] text-[#1B1F1E] font-body-md">
              <span className="inline-flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#B3382C]"></span>
                <span>High risk</span>
              </span>
              <span className="font-data-tabular text-[13px] text-[#5B625F]">{stats.high_risk_count} ({highPct}%)</span>
            </div>
          </div>
        </section>

        {/* Recent Risk Scores Bar Chart (7 Cols) */}
        <section className="lg:col-span-7 bg-white rounded-[8px] border border-[#DDD8CC] p-6">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-6">
            <div>
              <h2 className="font-headline-md text-[20px] font-semibold text-[#1B1F1E] leading-[26px]">Recent risk scores</h2>
              <p className="font-body-md text-[13px] text-[#5B625F] mt-1">Last {recent.length || 0} assessments (threshold line at {RISK_THRESHOLDS.MED_MAX}%)</p>
            </div>
            <div className="flex items-center gap-1.5 text-[12px] text-[#B3382C] font-body-md">
              <span className="inline-block w-3 border-t border-dashed border-[#B3382C]"></span>
              <span>High risk threshold ({RISK_THRESHOLDS.MED_MAX}%)</span>
            </div>
          </div>
          
          {/* SVG Bar Chart */}
          <div className="relative w-full h-[180px] select-none">
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 540 180">
              <line stroke="#DDD8CC" strokeWidth="1" x1="38" x2="540" y1="10" y2="10"></line>
              <text fill="#5B625F" fontFamily="'Source Sans 3', sans-serif" fontSize="11" textAnchor="end" x="32" y="14">100%</text>
              <line stroke="#DDD8CC" strokeWidth="1" x1="38" x2="540" y1="46" y2="46"></line>
              <text fill="#5B625F" fontFamily="'Source Sans 3', sans-serif" fontSize="11" textAnchor="end" x="32" y="50">75%</text>
              <line stroke="#DDD8CC" strokeWidth="1" x1="38" x2="540" y1="82" y2="82"></line>
              <text fill="#5B625F" fontFamily="'Source Sans 3', sans-serif" fontSize="11" textAnchor="end" x="32" y="86">50%</text>
              <line stroke="#DDD8CC" strokeWidth="1" x1="38" x2="540" y1="118" y2="118"></line>
              <text fill="#5B625F" fontFamily="'Source Sans 3', sans-serif" fontSize="11" textAnchor="end" x="32" y="122">25%</text>
              
              {/* Dynamic Reference Line */}
              <line stroke="#B3382C" strokeDasharray="3,3" strokeWidth="1" x1="38" x2="540" y1={154 - (RISK_THRESHOLDS.MED_MAX / 100) * 144} y2={154 - (RISK_THRESHOLDS.MED_MAX / 100) * 144}></line>
              
              <line stroke="#DDD8CC" strokeWidth="1" x1="38" x2="540" y1="154" y2="154"></line>
              <text fill="#5B625F" fontFamily="'Source Sans 3', sans-serif" fontSize="11" textAnchor="end" x="32" y="157">0%</text>
              
              {/* Render dynamic bars. Reverse array to show oldest of the recent 10 first. */}
              {[...recent].reverse().map((p, idx) => {
                const height = (p.risk_score / 100) * 144; // 144 is max height (154 - 10)
                const y = 154 - height;
                const x = 52 + (idx * 50);
                const color = p.risk_level === 'HIGH RISK' ? '#B3382C' : '#0F5C5A';
                return (
                  <rect key={p.id} fill={color} height={height} rx="1.5" width="22" x={x} y={y}></rect>
                );
              })}
            </svg>
          </div>
          
          <div className="grid grid-cols-10 pl-[38px] text-center font-data-tabular text-[12px] text-[#5B625F] pt-2">
            {[...recent].reverse().map((p, idx) => (
              <span key={p.id} className={p.risk_level === 'HIGH RISK' ? 'text-[#B3382C] font-semibold' : ''}>#{idx + 1}</span>
            ))}
          </div>
        </section>
      </div>

      {/* Recent Assessments Table Panel */}
      <section className="bg-white rounded-[8px] border border-[#DDD8CC] p-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#DDD8CC]">
          <h2 className="font-headline-md text-[20px] font-semibold text-[#1B1F1E] leading-[26px]">Recent assessments</h2>
          <Link to="/history" className="text-[14px] font-medium text-[#0F5C5A] hover:text-[#0B4846] transition-colors">
            View all history →
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-[#DDD8CC] h-[40px]">
                <th className="text-[13px] font-medium text-[#5B625F] font-body-md py-2 pr-4">Time</th>
                <th className="text-[13px] font-medium text-[#5B625F] font-body-md py-2 px-4">Age</th>
                <th className="text-[13px] font-medium text-[#5B625F] font-body-md py-2 px-4">Gender</th>
                <th className="text-[13px] font-medium text-[#5B625F] font-body-md py-2 px-4">Length of stay</th>
                <th className="text-[13px] font-medium text-[#5B625F] font-body-md py-2 px-4">Risk score</th>
                <th className="text-[13px] font-medium text-[#5B625F] font-body-md py-2 px-4">Risk level</th>
                <th className="text-[13px] font-medium text-[#5B625F] font-body-md py-2 pl-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDD8CC]">
              {recent.slice(0, 5).map(p => {
                const isHigh = p.risk_level === 'HIGH RISK';
                const isMed = p.risk_level === 'MEDIUM RISK';
                const badgeBg = isHigh ? 'bg-[#F6E0DC]' : isMed ? 'bg-[#F8EBD3]' : 'bg-[#E4F1E9]';
                const badgeText = isHigh ? 'text-[#B3382C]' : isMed ? 'text-[#B7791F]' : 'text-[#2F7D4F]';
                const badgeDot = isHigh ? 'bg-[#B3382C]' : isMed ? 'bg-[#B7791F]' : 'bg-[#2F7D4F]';
                
                return (
                  <tr key={p.id} className="h-[52px] hover:bg-[#E3EFED]/40 transition-colors cursor-pointer" onClick={() => navigate(`/prediction/${p.id}`)}>
                    <td className="py-3 pr-4 font-data-tabular text-[13px] text-[#1B1F1E] whitespace-nowrap">
                      {new Date(p.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 font-body-md text-[14px] text-[#1B1F1E]">{p.patient_data.age}</td>
                    <td className="py-3 px-4 font-body-md text-[14px] text-[#1B1F1E]">{p.patient_data.gender}</td>
                    <td className="py-3 px-4 font-body-md text-[14px] text-[#1B1F1E]">{p.patient_data.length_of_stay} days</td>
                    <td className="py-3 px-4 font-headline-sm text-[15px] font-semibold text-[#1B1F1E]">{p.risk_score}%</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] ${badgeBg} ${badgeText} text-[10px] font-bold tracking-[0.06em]`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${badgeDot}`}></span>
                        {p.risk_level.split(' ')[0]}
                      </span>
                    </td>
                    <td className="py-3 pl-4 text-right">
                      <Link to={`/prediction/${p.id}`} className="font-body-md text-[14px] font-medium text-[#0F5C5A] hover:text-[#0B4846] transition-colors" onClick={e => e.stopPropagation()}>View</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        <div className="flex items-center justify-between pt-4 mt-2 border-t border-[#DDD8CC]">
          <span className="font-body-sm text-[12px] text-[#5B625F]">Showing {Math.min(recent.length, 5)} of {stats.total_predictions} assessments</span>
          <Link to="/history" className="text-[14px] font-medium text-[#0F5C5A] hover:text-[#0B4846] transition-colors">
            View all history →
          </Link>
        </div>
      </section>
    </div>
  );
}
