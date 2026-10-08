import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    // In a real app, validate credentials here.
    // Setting to dashboard directly for MVP flow.
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#F6F3EC]">
      <style>{`
        .font-sans-ibm {
          font-family: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        .font-serif-source {
          font-family: 'Source Serif 4', Georgia, serif;
        }
        input:focus {
          outline: none;
          border-color: #0F5C5A !important;
          box-shadow: 0 0 0 2px #0F5C5A !important;
        }
        input.input-error:focus {
          outline: none;
          border-color: #B3382C !important;
          box-shadow: 0 0 0 2px #B3382C !important;
        }
      `}</style>
      
      {/* Left Half: Deep Teal Hero Editorial Column */}
      <section className="w-full md:w-1/2 bg-[#0F5C5A] min-h-[360px] md:min-h-screen p-8 md:p-16 lg:p-20 flex flex-col justify-between select-none">
        <div>
          <span className="font-serif-source text-white tracking-wide text-2xl font-semibold">AURA</span>
        </div>

        <div className="my-auto py-12 md:py-0 max-w-xl">
          <h1 className="font-serif-source text-white text-[32px] md:text-[40px] leading-[1.2] font-normal tracking-tight mb-4">
            Know the risk before the patient leaves.
          </h1>
          <p className="font-sans-ibm text-white text-opacity-80 text-[16px] leading-[1.55] font-normal">
            30-day readmission risk with explainable factors and a clinical summary.
          </p>
        </div>

        <div className="hidden md:block text-xs text-white text-opacity-40">
          {/* Quiet subtle baseline */}
        </div>
      </section>

      {/* Right Half: Clean Medical Journal Form Column */}
      <main className="w-full md:w-1/2 bg-[#F6F3EC] min-h-screen flex items-center justify-center p-6 sm:p-10 md:p-12 lg:p-16 font-sans-ibm">
        <div className="w-full max-w-[380px] mx-auto py-8">
          
          {/* Back Button */}
          <button 
            type="button" 
            onClick={() => navigate('/')}
            className="inline-flex items-center text-[#0F5C5A] hover:text-[#0B4846] text-[14px] font-medium transition-colors mb-8 hover:underline underline-offset-2"
          >
            <span className="mr-1.5 leading-none">←</span> Back to home
          </button>

          {/* Heading & Subtext */}
          <div className="mb-8">
            <h2 className="font-serif-source text-[28px] font-normal text-[#1B1F1E] leading-tight mb-2">
              Sign in
            </h2>
            <p className="text-[#5B625F] text-[15px] leading-[1.55]">
              Use the account your hospital administrator created for you.
            </p>
          </div>

          {/* Conditional Error State Box */}
          {error && (
            <div className="mb-6 p-3.5 bg-[#F6E0DC] border border-[#B3382C] rounded-[6px] flex items-start gap-2.5">
              <svg className="w-4 h-4 text-[#B3382C] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <div className="text-[13px] text-[#B3382C] font-medium leading-snug">
                Incorrect email or password.
              </div>
            </div>
          )}

          {/* Login Form */}
          <form className="space-y-5" onSubmit={handleLogin}>
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-[13px] text-[#1B1F1E] font-medium mb-1.5">
                Email
              </label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                defaultValue="eleanor.vance@hospital.edu"
                placeholder="name@hospital.edu" 
                className="w-full h-[44px] px-3.5 bg-white border border-[#DDD8CC] rounded-[6px] text-[15px] text-[#1B1F1E] placeholder-[#5B625F]/60 transition-colors"
                required
              />
            </div>

            {/* Password Field with Show/Hide toggle */}
            <div>
              <label htmlFor="password" className="block text-[13px] text-[#1B1F1E] font-medium mb-1.5">
                Password
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  id="password" 
                  name="password" 
                  defaultValue="password123"
                  className={`${error ? 'input-error border-[#B3382C]' : 'border-[#DDD8CC]'} w-full h-[44px] pl-3.5 pr-16 bg-white border rounded-[6px] text-[15px] text-[#1B1F1E] transition-colors`}
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] font-medium text-[#0F5C5A] hover:text-[#0B4846] focus:outline-none px-1 py-0.5"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {/* Forgot Password Link */}
              <div className="mt-2 text-right">
                <a href="#" className="text-[13px] text-[#0F5C5A] hover:text-[#0B4846] hover:underline transition-colors font-medium">
                  Forgot password?
                </a>
              </div>
            </div>

            {/* Primary Action: Full-width Teal Button */}
            <div className="pt-2">
              <button 
                type="submit" 
                className="w-full h-[44px] bg-[#0F5C5A] hover:bg-[#0B4846] text-white font-medium text-[15px] rounded-[6px] transition-colors flex items-center justify-center cursor-pointer border border-[#0F5C5A]"
              >
                Sign in
              </button>
            </div>
          </form>

          {/* Administrator Note */}
          <div className="mt-8 pt-6 border-t border-[#DDD8CC] text-center">
            <p className="text-[13px] text-[#5B625F] leading-normal">
              Need an account? <span className="text-[#1B1F1E]">Contact your hospital administrator.</span>
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}
