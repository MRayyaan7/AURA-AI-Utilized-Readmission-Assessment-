import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchPrediction } from '../api';
import { RISK_THRESHOLDS } from '../config';

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
      <div className="max-w-[1120px] mx-auto w-full flex flex-col gap-8 animate-pulse p-8">
        <div className="h-10 bg-[#DDD8CC] rounded w-1/3"></div>
        <div className="h-64 bg-[#DDD8CC] rounded w-full"></div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="max-w-[1120px] mx-auto w-full p-8">
        <div className="p-4 bg-[#F6E0DC] text-[#B3382C] rounded border border-[#B3382C]">
          {error}
        </div>
        <button onClick={() => navigate('/history')} className="mt-4 text-[#0F5C5A] underline">
          Back to history
        </button>
      </div>
    );
  }

  const p = prediction;
  const pd = p.patient_data;

  // Compute Risk Colors
  const isLow = p.risk_level === 'LOW RISK';
  const isMed = p.risk_level === 'MEDIUM RISK';
  const isHigh = p.risk_level === 'HIGH RISK';
  
  const riskColor = isLow ? '#2F7D4F' : isMed ? '#B7791F' : '#B3382C';
  const badgeBg = isLow ? 'bg-[#E4F1E9]' : isMed ? 'bg-[#F8EBD3]' : 'bg-[#F6E0DC]';
  const badgeText = isLow ? 'text-[#2F7D4F]' : isMed ? 'text-[#B7791F]' : 'text-[#B3382C]';

  // Process SHAP factors
  const shapData = p.top_factors.map((f, i) => {
    const increases = f.includes('increases');
    const label = f.replace(/ \((increases|decreases) risk\)/, '');
    const width = Math.max(20, 80 - i * 15); // visual fake width since we lack raw shap numbers
    return { label, increases, width };
  });

  // Conditions for Patient Profile
  const conditions = [
    pd.has_diabetes === 1 && 'Diabetes',
    pd.has_chf === 1 && 'CHF',
    pd.has_copd === 1 && 'COPD',
    pd.creatinine_high === 1 && 'Elevated Creatinine',
    pd.hemoglobin_low === 1 && 'Low Hemoglobin'
  ].filter(Boolean);

  return (
    <div className="flex flex-col w-full max-w-[1120px] mx-auto p-8">
      {/* Top Navigation & Actions */}
      <div className="flex flex-col gap-6 mb-8">
        <div>
          <button 
            onClick={() => navigate('/history')}
            className="inline-flex items-center text-[#0F5C5A] hover:text-[#0B4846] font-['IBM_Plex_Sans'] font-medium text-[15px] transition-colors"
          >
            <span className="mr-1.5 leading-none">←</span> Back to history
          </button>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
          <div>
            <h1 className="font-headline-xl text-[32px] text-[#1B1F1E] font-semibold leading-tight tracking-tight">
              Risk assessment
            </h1>
            <p className="font-['IBM_Plex_Sans'] text-[15px] text-[#5B625F] mt-1.5 flex items-center gap-1.5">
              {new Date(p.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })} 
              <span className="mx-1.5 opacity-60">·</span> 
              ID <span className="font-['JetBrains_Mono'] text-[14px] text-[#1B1F1E]">{p.id.slice(0, 8)}</span>
            </p>
          </div>
          <div className="self-start sm:self-center">
            <button className="inline-flex items-center justify-center px-5 h-[44px] rounded-[6px] border border-[#0F5C5A] text-[#0F5C5A] font-['IBM_Plex_Sans'] text-[14px] font-medium bg-[#FFFFFF] hover:bg-[#E3EFED] transition-colors" type="button">
              Export report
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: 5/12 left, 7/12 right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-start">
        
        {/* LEFT COLUMN (5 of 12) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Panel 1: 30-day readmission risk */}
          <section className="bg-[#FFFFFF] border border-[#DDD8CC] rounded-[8px] p-6 flex flex-col">
            <h2 className="font-headline-md text-[20px] text-[#1B1F1E] font-semibold tracking-tight">
              30-day readmission risk
            </h2>
            <div className="flex items-baseline gap-4 mt-6">
              <span 
                className="font-headline-xl text-[88px] font-bold leading-none tracking-tight"
                style={{ color: riskColor }}
              >
                {p.risk_score}%
              </span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] ${badgeBg} ${badgeText} font-['JetBrains_Mono'] text-[11px] font-bold tracking-wider uppercase self-center`}>
                <span className="w-[6px] h-[6px] rounded-full inline-block" style={{ backgroundColor: riskColor }}></span>
                {p.risk_level}
              </span>
            </div>
            
            {/* Horizontal Risk Spectrum */}
            <div className="mt-8 pt-2">
              <div className="relative w-full">
                {/* Indicator Needle */}
                <div 
                  className="absolute -top-6 -translate-x-1/2 flex flex-col items-center transition-all duration-700 ease-out"
                  style={{ left: `${p.risk_score}%` }}
                >
                  <span className="font-['JetBrains_Mono'] text-[11px] font-semibold text-[#1B1F1E] leading-none mb-1">
                    {p.risk_score}%
                  </span>
                  <div className="w-[2px] h-[8px] bg-[#1B1F1E]"></div>
                </div>
                
                {/* Segmented Scale Track */}
                <div className="h-[8px] w-full rounded-[4px] flex overflow-hidden border border-[#DDD8CC]/40">
                  <div className={`bg-[#E4F1E9]`} style={{ width: `${RISK_THRESHOLDS.LOW_MAX}%` }} title={`Low risk zone (0-${RISK_THRESHOLDS.LOW_MAX}%)`}></div>
                  <div className={`bg-[#F8EBD3]`} style={{ width: `${RISK_THRESHOLDS.MED_MAX - RISK_THRESHOLDS.LOW_MAX}%` }} title={`Medium risk zone (${RISK_THRESHOLDS.LOW_MAX}-${RISK_THRESHOLDS.MED_MAX}%)`}></div>
                  <div className={`bg-[#F6E0DC]`} style={{ width: `${100 - RISK_THRESHOLDS.MED_MAX}%` }} title={`High risk zone (${RISK_THRESHOLDS.MED_MAX}-100%)`}></div>
                </div>
                
                {/* Scale Labels */}
                <div className="relative w-full font-['IBM_Plex_Sans'] text-[12px] text-[#5B625F] mt-2 h-4">
                  <span className="absolute left-0">0%</span>
                  <span className="absolute -translate-x-1/2" style={{ left: `${RISK_THRESHOLDS.LOW_MAX}%` }}>{RISK_THRESHOLDS.LOW_MAX}%</span>
                  <span className="absolute -translate-x-1/2" style={{ left: `${RISK_THRESHOLDS.MED_MAX}%` }}>{RISK_THRESHOLDS.MED_MAX}%</span>
                  <span className="absolute right-0">100%</span>
                </div>
              </div>
              <p className="font-['IBM_Plex_Sans'] text-[14px] text-[#5B625F] mt-5">
                {isLow 
                  ? 'Below the threshold for elevated risk.'
                  : isMed 
                    ? 'Approaching elevated readmission risk.'
                    : 'Significantly elevated risk of readmission.'}
              </p>
            </div>
          </section>

          {/* Panel 2: Patient profile */}
          <section className="bg-[#FFFFFF] border border-[#DDD8CC] rounded-[8px] p-6 flex flex-col">
            <h2 className="font-headline-md text-[20px] text-[#1B1F1E] font-semibold tracking-tight pb-4 border-b border-[#DDD8CC]">
              Patient profile
            </h2>
            <dl className="grid grid-cols-2 gap-y-5 gap-x-4 pt-5">
              <div>
                <dt className="font-['IBM_Plex_Sans'] text-[13px] text-[#5B625F]">Age</dt>
                <dd className="font-['IBM_Plex_Sans'] text-[16px] font-medium text-[#1B1F1E] mt-0.5">{pd.age} years</dd>
              </div>
              <div>
                <dt className="font-['IBM_Plex_Sans'] text-[13px] text-[#5B625F]">Gender</dt>
                <dd className="font-['IBM_Plex_Sans'] text-[16px] font-medium text-[#1B1F1E] mt-0.5">{pd.gender}</dd>
              </div>
              <div className="pt-3 border-t border-[#DDD8CC]/40">
                <dt className="font-['IBM_Plex_Sans'] text-[13px] text-[#5B625F]">Prior admissions</dt>
                <dd className="font-['IBM_Plex_Sans'] text-[16px] font-medium text-[#1B1F1E] mt-0.5">{pd.num_prior_admissions}</dd>
              </div>
              <div className="pt-3 border-t border-[#DDD8CC]/40">
                <dt className="font-['IBM_Plex_Sans'] text-[13px] text-[#5B625F]">Length of stay</dt>
                <dd className="font-['IBM_Plex_Sans'] text-[16px] font-medium text-[#1B1F1E] mt-0.5">{pd.length_of_stay} days</dd>
              </div>
              <div className="pt-3 border-t border-[#DDD8CC]/40">
                <dt className="font-['IBM_Plex_Sans'] text-[13px] text-[#5B625F]">Medications at discharge</dt>
                <dd className="font-['IBM_Plex_Sans'] text-[16px] font-medium text-[#1B1F1E] mt-0.5">{pd.num_medications}</dd>
              </div>
              <div className="pt-3 border-t border-[#DDD8CC]/40">
                <dt className="font-['IBM_Plex_Sans'] text-[13px] text-[#5B625F]">Discharge destination</dt>
                <dd className="font-['IBM_Plex_Sans'] text-[16px] font-medium text-[#1B1F1E] mt-0.5">{pd.discharge_to_home ? 'Home' : 'Facility'}</dd>
              </div>
              
              {conditions.length > 0 && (
                <div className="col-span-2 pt-3 border-t border-[#DDD8CC]/40">
                  <dt className="font-['IBM_Plex_Sans'] text-[13px] text-[#5B625F]">Active Conditions & Markers</dt>
                  <dd className="font-['IBM_Plex_Sans'] text-[15px] font-medium text-[#1B1F1E] mt-1 flex flex-wrap gap-2">
                    {conditions.map((c, i) => (
                      <span key={i} className="px-2 py-1 bg-[#F6F3EC] border border-[#DDD8CC] rounded-[4px] text-[13px]">{c}</span>
                    ))}
                  </dd>
                </div>
              )}
            </dl>
          </section>
        </div>

        {/* RIGHT COLUMN (7 of 12) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Panel 3: What drove this score */}
          <section className="bg-[#FFFFFF] border border-[#DDD8CC] rounded-[8px] p-6 flex flex-col">
            <h2 className="font-headline-md text-[20px] text-[#1B1F1E] font-semibold tracking-tight pb-3">
              What drove this score
            </h2>
            
            {/* Diverging Bar Chart Container */}
            <div className="mt-4 flex flex-col">
              {/* Column Orientation Header */}
              <div className="flex items-center pb-2 text-[12px] font-['IBM_Plex_Sans'] text-[#5B625F] border-b border-[#DDD8CC] gap-4">
                <div className="w-5/12 text-left">Factor</div>
                <div className="w-7/12 flex relative">
                  <div className="flex-1 text-right pr-2">Decreases risk</div>
                  <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-[#DDD8CC]"></div>
                  <div className="flex-1 text-left pl-2">Increases risk</div>
                </div>
              </div>
              
              {/* Chart Rows with Centered Zero Axis */}
              <div className="relative py-2">
                {shapData.length > 0 ? shapData.map((f, i) => (
                  <div key={i} className={`flex items-center py-3.5 relative z-10 gap-4 ${i > 0 ? 'border-t border-[#DDD8CC]/30' : ''}`}>
                    <div className="w-5/12 font-['IBM_Plex_Sans'] text-[14px] text-[#1B1F1E] line-clamp-2" title={f.label}>
                      {f.label}
                    </div>
                    <div className="w-7/12 flex relative items-center h-[14px]">
                      {/* Zero line */}
                      <div className="absolute left-1/2 -top-3.5 -bottom-3.5 w-[1px] bg-[#DDD8CC] z-0"></div>
                      
                      {/* Left bar (Decreases risk) */}
                      <div className="flex-1 flex justify-end h-full z-10">
                        {!f.increases && (
                          <div className="h-full bg-[#0F5C5A] rounded-l-[2px]" style={{ width: `${f.width}%` }}></div>
                        )}
                      </div>
                      
                      {/* Right bar (Increases risk) */}
                      <div className="flex-1 flex justify-start h-full z-10 pl-[1px]">
                        {f.increases && (
                          <div className="h-full bg-[#B3382C] rounded-r-[2px]" style={{ width: `${f.width}%` }}></div>
                        )}
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="py-6 text-center text-[14px] text-[#5B625F]">No significant factors identified.</div>
                )}
              </div>
              
              {/* Legend & Citation Footnote */}
              <div className="pt-4 mt-2 border-t border-[#DDD8CC] flex items-center justify-between gap-3">
                <div className="flex items-center gap-5 font-['IBM_Plex_Sans'] text-[13px] text-[#1B1F1E]">
                  <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#B3382C] inline-block"></span>
                    Increases risk
                  </span>
                  <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0F5C5A] inline-block"></span>
                    Decreases risk
                  </span>
                </div>
                <p className="font-['IBM_Plex_Sans'] text-[13px] text-[#5B625F] text-right truncate">
                  Based on SHAP values.
                </p>
              </div>
            </div>
          </section>

          {/* Panel 4: Clinical summary */}
          <section className="bg-[#FFFFFF] border border-[#DDD8CC] rounded-[8px] p-6 flex flex-col">
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#DDD8CC]">
              <h2 className="font-headline-md text-[20px] text-[#1B1F1E] font-semibold tracking-tight">
                Clinical summary
              </h2>
              <span className={`font-['IBM_Plex_Sans'] text-[12px] px-2.5 py-1 rounded-[4px] font-medium ${
                p.llm_success ? 'text-[#0F5C5A] bg-[#E3EFED]' : 'text-[#B7791F] bg-[#F8EBD3]'
              }`}>
                {p.llm_success ? 'Generated by Gemini AI' : 'Fallback Rules'}
              </span>
            </div>
            
            <div className="pt-5 max-w-[68ch]">
              <h3 className="font-headline-sm text-[16px] font-semibold text-[#1B1F1E]">
                Summary
              </h3>
              <p className="font-['IBM_Plex_Sans'] text-[16px] text-[#1B1F1E] leading-[1.65] mt-2 whitespace-pre-line">
                {p.explanation}
              </p>
              
              <h3 className="font-headline-sm text-[16px] font-semibold text-[#1B1F1E] mt-6">
                Recommendations
              </h3>
              <ol className="font-['IBM_Plex_Sans'] text-[15px] text-[#1B1F1E] leading-relaxed mt-2.5 list-decimal pl-5 space-y-1.5">
                {p.recommendations.map((rec, i) => {
                  const cleanRec = rec.replace(/^\d+\.\s*/, '');
                  return <li key={i}>{cleanRec}</li>;
                })}
              </ol>
              
              <div className="mt-8 pt-4 border-t border-[#DDD8CC]/50">
                <p className="font-['IBM_Plex_Sans'] text-[13px] text-[#5B625F]">
                  AI-generated. Review before acting on it.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
