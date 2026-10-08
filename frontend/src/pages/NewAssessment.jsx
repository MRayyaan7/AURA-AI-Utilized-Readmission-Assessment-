import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { predict } from '../api';

const INITIAL = {
  age: '68',
  gender: 'Male',
  num_prior_admissions: 2,
  length_of_stay: 4,
  num_medications: 4,
  has_diabetes: 0,
  has_chf: 0,
  has_copd: 0,
  creatinine_high: 0,
  hemoglobin_low: 1,
  discharge_to_home: 1,
};

function ConditionCard({ label, subtext, selected, onChange }) {
  return (
    <label 
      className={`min-h-[64px] rounded-[8px] p-3 border flex items-center gap-3 cursor-pointer transition-colors ${
        selected ? 'border-[#0F5C5A] bg-[#E3EFED]' : 'border-[#DDD8CC] bg-[#FFFFFF] hover:bg-[#F6F3EC]'
      }`}
    >
      <div className={`w-5 h-5 rounded-[4px] border flex items-center justify-center shrink-0 ${
        selected ? 'bg-[#0F5C5A] border-[#0F5C5A] text-white' : 'border-[#DDD8CC] bg-[#FFFFFF]'
      }`}>
        <input 
          type="checkbox" 
          className="hidden" 
          checked={!!selected}
          onChange={onChange}
        />
        {selected && (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 16 16">
            <polyline points="3.5 8.5 6.5 11.5 12.5 4.5"></polyline>
          </svg>
        )}
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-[15px] font-medium text-[#1B1F1E] leading-snug">{label}</span>
        {subtext && <span className="text-[12px] text-[#5B625F] leading-tight">{subtext}</span>}
      </div>
    </label>
  );
}

function Stepper({ label, subtext, value, onChange, min = 0 }) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(value + 1);

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-medium text-[#1B1F1E]">{label}</label>
      <div className="flex items-center h-11 bg-[#FFFFFF] border border-[#DDD8CC] rounded-[6px] overflow-hidden">
        <button 
          type="button"
          className="w-11 h-full flex items-center justify-center text-[#5B625F] hover:bg-[#F6F3EC] hover:text-[#1B1F1E] active:bg-[#EFECE4] transition-colors border-r border-[#DDD8CC]"
          onClick={dec}
        >
          <span className="material-symbols-outlined text-[18px]">remove</span>
        </button>
        <input 
          type="number"
          min={min}
          value={value}
          onChange={e => {
            const v = parseInt(e.target.value, 10);
            onChange(isNaN(v) ? min : Math.max(min, v));
          }}
          className="w-full h-full text-center bg-transparent font-data-tabular text-[14px] text-[#1B1F1E] focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <button 
          type="button"
          className="w-11 h-full flex items-center justify-center text-[#5B625F] hover:bg-[#F6F3EC] hover:text-[#1B1F1E] active:bg-[#EFECE4] transition-colors border-l border-[#DDD8CC]"
          onClick={inc}
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
        </button>
      </div>
      {subtext && <span className="text-[12px] text-[#5B625F]">{subtext}</span>}
    </div>
  );
}

export default function NewAssessment() {
  const [form, setForm] = useState(INITIAL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const setVal = (key, val) => setForm(prev => ({ ...prev, [key]: val }));
  const setToggle = (key) => () => setForm(prev => ({ ...prev, [key]: prev[key] ? 0 : 1 }));

  const conditionsCount = [
    form.has_diabetes, form.has_chf, form.has_copd, 
    form.creatinine_high, form.hemoglobin_low, form.discharge_to_home
  ].filter(Boolean).length;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.age || isNaN(form.age)) return;
    
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
      setError(err.message || 'An error occurred during prediction.');
      setLoading(false);
    }
  }

  function handleReset() {
    setForm(INITIAL);
  }

  return (
    <div className="max-w-[760px] w-full">
      <div className="flex flex-col gap-1 mb-8">
        <h1 className="font-headline-lg text-[26px] text-[#1B1F1E] font-semibold tracking-tight">New assessment</h1>
        <p className="font-body-md text-[13px] text-[#5B625F]">Enter the patient's details to estimate 30-day readmission risk.</p>
      </div>

      <form 
        className="bg-[#FFFFFF] rounded-xl border border-[#DDD8CC] p-8"
        onSubmit={handleSubmit}
      >
        {/* Group 1: Patient */}
        <section className="flex flex-col">
          <div className="flex items-center justify-between pb-4">
            <h2 className="font-headline-sm text-[20px] text-[#1B1F1E] font-semibold">Patient</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
            {/* Age */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-[#1B1F1E]" htmlFor="patientAge">
                Age <span className="text-[#B3382C]">*</span>
              </label>
              <div className="relative flex items-center h-11 bg-[#FFFFFF] border border-[#DDD8CC] rounded-[6px] focus-within:border-[#0F5C5A] transition-colors">
                <input 
                  id="patientAge"
                  type="number"
                  required
                  min="0"
                  max="125"
                  value={form.age}
                  onChange={(e) => setVal('age', e.target.value)}
                  className="w-full h-full pl-3 pr-14 bg-transparent text-[14px] text-[#1B1F1E] focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="absolute right-3 text-[12px] text-[#5B625F] select-none pointer-events-none">years</span>
              </div>
            </div>

            {/* Gender Segmented Switch */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-[#1B1F1E]">
                Gender <span className="text-[#B3382C]">*</span>
              </label>
              <div className="grid grid-cols-2 h-11 bg-[#F6F3EC] p-1 rounded-[6px] border border-[#DDD8CC] select-none">
                <button 
                  type="button"
                  onClick={() => setVal('gender', 'Male')}
                  className={`flex items-center justify-center rounded text-[13px] transition-all border ${
                    form.gender === 'Male' 
                      ? 'bg-[#FFFFFF] text-[#0F5C5A] font-semibold border-[#DDD8CC]' 
                      : 'text-[#5B625F] hover:text-[#1B1F1E] border-transparent font-medium'
                  }`}
                >
                  Male
                </button>
                <button 
                  type="button"
                  onClick={() => setVal('gender', 'Female')}
                  className={`flex items-center justify-center rounded text-[13px] transition-all border ${
                    form.gender === 'Female' 
                      ? 'bg-[#FFFFFF] text-[#0F5C5A] font-semibold border-[#DDD8CC]' 
                      : 'text-[#5B625F] hover:text-[#1B1F1E] border-transparent font-medium'
                  }`}
                >
                  Female
                </button>
              </div>
            </div>
          </div>
        </section>

        <div className="h-px w-full bg-[#DDD8CC] my-8"></div>

        {/* Group 2: Clinical history */}
        <section className="flex flex-col">
          <div className="flex items-center justify-between pb-4">
            <h2 className="font-headline-sm text-[20px] text-[#1B1F1E] font-semibold">Clinical history</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-1">
            <Stepper 
              label="Prior admissions" 
              subtext="Past 12 months, acute or emergency"
              value={form.num_prior_admissions} 
              onChange={v => setVal('num_prior_admissions', v)} 
              min={0} 
            />
            <Stepper 
              label="Length of stay" 
              subtext="Index hospitalization duration"
              value={form.length_of_stay} 
              onChange={v => setVal('length_of_stay', v)} 
              min={1} 
            />
            <Stepper 
              label="Medications at discharge" 
              subtext="Includes active prescribed regimens"
              value={form.num_medications} 
              onChange={v => setVal('num_medications', v)} 
              min={0} 
            />
          </div>
        </section>

        <div className="h-px w-full bg-[#DDD8CC] my-8"></div>

        {/* Group 3: Conditions and markers */}
        <section className="flex flex-col">
          <div className="flex items-center justify-between">
            <h2 className="font-headline-sm text-[20px] text-[#1B1F1E] font-semibold">Conditions and markers</h2>
            <span className="text-[13px] text-[#5B625F] font-medium">{conditionsCount} selected</span>
          </div>
          <p className="text-[13px] text-[#5B625F] mt-1 mb-4">Select all that apply. Leave unselected if not present.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <ConditionCard 
              label="Diabetes" 
              selected={form.has_diabetes} 
              onChange={setToggle('has_diabetes')} 
            />
            <ConditionCard 
              label="Congestive heart failure" 
              subtext="CHF"
              selected={form.has_chf} 
              onChange={setToggle('has_chf')} 
            />
            <ConditionCard 
              label="COPD" 
              selected={form.has_copd} 
              onChange={setToggle('has_copd')} 
            />
            <ConditionCard 
              label="Elevated creatinine" 
              selected={form.creatinine_high} 
              onChange={setToggle('creatinine_high')} 
            />
            <ConditionCard 
              label="Low hemoglobin" 
              subtext="Anaemia marker"
              selected={form.hemoglobin_low} 
              onChange={setToggle('hemoglobin_low')} 
            />
            <ConditionCard 
              label="Discharged to home" 
              selected={form.discharge_to_home} 
              onChange={setToggle('discharge_to_home')} 
            />
          </div>
        </section>

        {error && (
          <div className="mt-8 p-3.5 bg-[#F6E0DC] border border-[#B3382C] rounded-[6px] flex items-start gap-2.5">
            <div className="text-[13px] text-[#B3382C] font-medium leading-snug">
              {error}
            </div>
          </div>
        )}

        {/* Panel Footer Actions */}
        <div className="mt-10 pt-6 border-t border-[#DDD8CC] flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                type="submit" 
                disabled={loading}
                className="h-11 px-6 rounded-[6px] bg-[#0F5C5A] hover:bg-[#0c4a48] active:bg-[#093736] disabled:opacity-50 disabled:cursor-not-allowed text-white text-[13px] font-medium transition-colors flex items-center gap-2 border border-[#0F5C5A]"
              >
                <span>Run prediction</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
              <button 
                type="button" 
                onClick={handleReset}
                disabled={loading}
                className="h-11 px-4 text-[#5B625F] hover:text-[#1B1F1E] disabled:opacity-50 text-[13px] font-medium transition-colors underline-offset-4 hover:underline"
              >
                Clear form
              </button>
            </div>
          </div>

          {/* Processing State Preview */}
          {loading && (
            <div className="flex items-center gap-4 p-4 rounded-[8px] bg-[#F6F3EC] border border-[#DDD8CC]">
              <div className="shrink-0 w-8 h-8 flex items-center justify-center">
                <svg className="animate-spin w-6 h-6 text-[#0F5C5A]" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5"></circle>
                  <path className="opacity-100" d="M4 12a8 8 0 018-8v2a6 6 0 00-6 6H4z" fill="currentColor"></path>
                </svg>
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-medium text-[#0F5C5A]">Analyzing...</span>
                  <span className="text-[11px] text-[#5B625F] px-1.5 py-0.5 rounded border border-[#DDD8CC] bg-[#FFFFFF]">Processing</span>
                </div>
                <p className="text-[12px] text-[#5B625F] mt-0.5">Running the model, then generating the clinical summary.</p>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
