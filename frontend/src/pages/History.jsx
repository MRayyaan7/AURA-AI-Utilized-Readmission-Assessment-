import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { fetchPredictions } from '../api';

const RISK_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'high', label: 'High' },
  { id: 'medium', label: 'Medium' },
  { id: 'low', label: 'Low' },
];

export default function History() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // States for search and filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');

  // Sorting
  const [sortConfig, setSortConfig] = useState({ key: 'timestamp', direction: 'desc' });
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    fetchPredictions({ limit: 100 })
      .then(setPredictions)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return (
        <svg className="w-3.5 h-3.5 opacity-40 hover:opacity-100" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" strokeLinecap="round" strokeLinejoin="round"></path>
        </svg>
      );
    }
    return sortConfig.direction === 'asc' ? (
      <svg className="w-3.5 h-3.5 text-primary-container" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M4.5 15.75l7.5-7.5 7.5 7.5" strokeLinecap="round" strokeLinejoin="round"></path>
      </svg>
    ) : (
      <svg className="w-3.5 h-3.5 text-primary-container" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M19.5 8.25l-7.5 7.5-7.5-7.5" strokeLinecap="round" strokeLinejoin="round"></path>
      </svg>
    );
  };

  // 1. Filter
  const filteredPredictions = predictions.filter(p => {
    // Risk Match
    const pRisk = p.risk_level.toLowerCase();
    const matchesRisk = filter === 'all' || pRisk.includes(filter);
    
    // Search Match
    const q = searchQuery.trim().toLowerCase();
    const dateStr = new Date(p.timestamp).toLocaleString().toLowerCase();
    const matchesQuery = !q || p.id.toLowerCase().includes(q) || dateStr.includes(q);
    
    return matchesRisk && matchesQuery;
  });

  // 2. Sort
  const sortedPredictions = [...filteredPredictions].sort((a, b) => {
    let aVal = a[sortConfig.key];
    let bVal = b[sortConfig.key];

    if (sortConfig.key === 'age' || sortConfig.key === 'length_of_stay') {
      aVal = a.patient_data[sortConfig.key];
      bVal = b.patient_data[sortConfig.key];
    } else if (sortConfig.key === 'timestamp') {
      aVal = new Date(a.timestamp).getTime();
      bVal = new Date(b.timestamp).getTime();
    }

    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const renderBadge = (level) => {
    if (level.includes('LOW')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-[#E4F1E9] text-[#2F7D4F] border border-[#2F7D4F]/30 font-label-caps text-[10px] font-bold tracking-wider uppercase" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#2F7D4F]"></span> LOW
        </span>
      );
    }
    if (level.includes('MEDIUM')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-[#F8EBD3] text-[#B7791F] border border-[#B7791F]/30 font-label-caps text-[10px] font-bold tracking-wider uppercase" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#B7791F]"></span> MEDIUM
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-[#F6E0DC] text-[#B3382C] border border-[#B3382C]/30 font-label-caps text-[10px] font-bold tracking-wider uppercase" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        <span className="w-1.5 h-1.5 rounded-full bg-[#B3382C]"></span> HIGH
      </span>
    );
  };

  return (
    <div className="flex flex-col w-full max-w-[1120px] mx-auto p-8 page-enter">
      {/* Document Header */}
      <header className="mb-6 flex flex-col md:flex-row md:items-baseline md:justify-between gap-2">
        <div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight text-[32px] leading-tight" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
            Assessment history
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-1 text-[15px] leading-relaxed" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
            Browse and filter past assessments.
          </p>
        </div>
        <div className="font-label-caps text-label-caps text-on-surface-variant/80 text-[11px] self-start md:self-auto tracking-wider uppercase">
          Registry status: Synced &middot; Volume: {predictions.length} Evaluated
        </div>
      </header>

      {/* Main Clinical Dossier Panel */}
      <section className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded-[8px] overflow-hidden">
        
        {/* Top Filter & Search Bar */}
        <div className="p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-outline-variant/60 bg-surface-container-lowest">
          
          {/* Search Input */}
          <div className="relative w-full sm:w-[320px]">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-on-surface-variant">
              <svg aria-hidden="true" className="w-4 h-4 text-outline" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                <path d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
            </div>
            <input 
              type="text"
              className="w-full h-[44px] pl-10 pr-3.5 rounded-[6px] border border-outline-variant/70 bg-surface-container-lowest font-body-md text-on-surface text-[14px] placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-colors" 
              placeholder="Search by ID or date" 
              style={{ fontFamily: "'Source Sans 3', sans-serif" }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Segmented Risk Filter Controls */}
          <div className="flex items-center self-start sm:self-auto">
            <div aria-label="Filter assessments by risk level" className="inline-flex h-[44px] rounded-[6px] border border-outline-variant/70 bg-surface-container-lowest overflow-hidden p-0" role="group">
              {RISK_FILTERS.map((f, i) => (
                <button 
                  key={f.id}
                  type="button"
                  className={`h-full px-4 text-[13px] transition-colors border-outline-variant/70 font-medium ${
                    filter === f.id 
                      ? 'bg-[#E3EFED] text-[#0F5C5A] font-semibold' 
                      : 'text-on-surface-variant hover:bg-surface-variant/40 hover:text-on-surface'
                  } ${i < RISK_FILTERS.length - 1 ? 'border-r' : ''}`}
                  style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                  onClick={() => setFilter(f.id)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tabular Grid View */}
        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="h-[44px] bg-[#FAFAF8] border-b border-outline-variant/60 font-body-sm text-on-surface-variant text-[13px] font-medium select-none" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                <th className="px-4 font-normal text-on-surface-variant" scope="col">
                  <button className="inline-flex items-center gap-1.5 hover:text-on-surface text-on-surface font-medium cursor-pointer" onClick={() => handleSort('timestamp')}>
                    <span>Time</span>
                    {getSortIcon('timestamp')}
                  </button>
                </th>
                <th className="px-4 font-normal text-on-surface-variant" scope="col">
                  <button className="inline-flex items-center gap-1.5 hover:text-on-surface cursor-pointer" onClick={() => handleSort('id')}>
                    <span>ID</span>
                    {getSortIcon('id')}
                  </button>
                </th>
                <th className="px-4 font-normal text-on-surface-variant" scope="col">
                  <button className="inline-flex items-center gap-1.5 hover:text-on-surface cursor-pointer" onClick={() => handleSort('age')}>
                    <span>Age</span>
                    {getSortIcon('age')}
                  </button>
                </th>
                <th className="px-4 font-normal text-on-surface-variant" scope="col">
                  <span className="inline-flex items-center gap-1.5">Gender</span>
                </th>
                <th className="px-4 font-normal text-on-surface-variant" scope="col">
                  <button className="inline-flex items-center gap-1.5 hover:text-on-surface cursor-pointer" onClick={() => handleSort('length_of_stay')}>
                    <span>Length of stay</span>
                    {getSortIcon('length_of_stay')}
                  </button>
                </th>
                <th className="px-4 font-normal text-on-surface-variant" scope="col">
                  <button className="inline-flex items-center gap-1.5 hover:text-on-surface cursor-pointer" onClick={() => handleSort('risk_score')}>
                    <span>Risk score</span>
                    {getSortIcon('risk_score')}
                  </button>
                </th>
                <th className="px-4 font-normal text-on-surface-variant" scope="col">Risk level</th>
                <th className="px-4 font-normal text-on-surface-variant" scope="col">Summary</th>
                <th className="px-4 font-normal text-on-surface-variant text-right" scope="col">Actions</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-outline-variant/60 font-body-md text-[14px]" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
              {loading ? (
                <tr>
                  <td colSpan="9" className="py-14 px-6 text-center">
                    <div className="flex flex-col items-center justify-center text-on-surface-variant">
                      <svg className="animate-spin w-8 h-8 text-primary mb-3" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5"></circle>
                        <path className="opacity-100" d="M4 12a8 8 0 018-8v2a6 6 0 00-6 6H4z" fill="currentColor"></path>
                      </svg>
                      <span className="font-medium">Loading history...</span>
                    </div>
                  </td>
                </tr>
              ) : sortedPredictions.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-0">
                    <div className="py-14 px-6 text-center">
                      <div className="inline-flex items-center justify-center w-10 h-10 rounded-[6px] border border-outline-variant/70 text-on-surface-variant mb-3 bg-surface-container-low">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" strokeLinecap="round" strokeLinejoin="round"></path>
                        </svg>
                      </div>
                      <p className="font-body-md text-on-surface text-[15px] font-medium">No assessments match your filters</p>
                      <p className="font-body-sm text-on-surface-variant text-[13px] mt-1">Try modifying your query terms or clearing the current risk level filters.</p>
                      <button 
                        type="button"
                        onClick={() => { setFilter('all'); setSearchQuery(''); }}
                        className="mt-3.5 inline-block text-[13px] font-medium text-[#0F5C5A] hover:text-[#0B4846] underline decoration-1 underline-offset-2"
                      >
                        Clear filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedPredictions.map(p => (
                  <tr 
                    key={p.id} 
                    className="h-[52px] hover:bg-[#F8FAF9] transition-colors cursor-pointer"
                    onClick={() => navigate(`/prediction/${p.id}`)}
                  >
                    <td className="px-4 whitespace-nowrap font-data-tabular text-data-tabular text-on-surface text-[13px]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      {new Date(p.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 whitespace-nowrap font-data-tabular text-data-tabular text-on-surface-variant text-[13px]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      {p.id.slice(0, 8)}
                    </td>
                    <td className="px-4 whitespace-nowrap text-on-surface">{p.patient_data.age}</td>
                    <td className="px-4 whitespace-nowrap text-on-surface">{p.patient_data.gender}</td>
                    <td className="px-4 whitespace-nowrap text-on-surface">{p.patient_data.length_of_stay} days</td>
                    <td className="px-4 whitespace-nowrap text-[15px] font-semibold text-on-surface" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
                      {p.risk_score}%
                    </td>
                    <td className="px-4 whitespace-nowrap">
                      {renderBadge(p.risk_level)}
                    </td>
                    <td className="px-4 whitespace-nowrap">
                      {p.llm_success ? (
                        <span className="inline-flex items-center gap-1 text-[#2F7D4F] text-[13px]" title="Clinical narrative verified">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                            <path d="M4.5 12.75l6 6 9-13.5" strokeLinecap="round" strokeLinejoin="round"></path>
                          </svg>
                          <span className="font-normal">Generated</span>
                        </span>
                      ) : (
                        <span className="text-on-surface-variant text-[13px]" title="Summary failed">Failed</span>
                      )}
                    </td>
                    <td className="px-4 whitespace-nowrap text-right">
                      <Link 
                        to={`/prediction/${p.id}`} 
                        className="text-[#0F5C5A] hover:text-[#0B4846] font-medium text-[13px] hover:underline"
                        onClick={e => e.stopPropagation()}
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Pagination */}
        {sortedPredictions.length > 0 && (
          <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-outline-variant/60 bg-surface-container-lowest font-body-md text-[14px]">
            <div className="text-on-surface-variant">
              Showing <span className="font-medium text-on-surface">1</span> to <span className="font-medium text-on-surface">{sortedPredictions.length}</span> of <span className="font-medium text-on-surface">{predictions.length}</span>
            </div>
            
            <nav aria-label="Pagination Navigation" className="flex items-center gap-1.5">
              <button disabled className="px-2.5 py-1.5 rounded-[6px] text-on-surface-variant/40 font-medium text-[13px] cursor-not-allowed" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                Previous
              </button>
              <button className="w-9 h-9 flex items-center justify-center rounded-[6px] bg-[#0F5C5A] text-on-primary font-semibold text-[13px]" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                1
              </button>
              <button disabled className="px-2.5 py-1.5 rounded-[6px] text-on-surface-variant/40 font-medium text-[13px] cursor-not-allowed" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
                Next
              </button>
            </nav>
          </div>
        )}
      </section>
    </div>
  );
}
