import React from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen flex flex-col">
      <header className="fixed top-0 left-0 w-full z-50 bg-surface border-b border-outline-variant">
        <div className="h-20 max-w-[1120px] mx-auto px-margin flex items-center justify-between">
          <Link to="/" className="flex flex-col group">
            <span className="font-headline-lg text-headline-lg text-primary-container tracking-wider">AURA</span>
            <span className="font-body-sm text-body-sm text-on-surface-variant font-medium">AI-Utilized Readmission Assessment</span>
          </Link>
          <div className="flex items-center gap-space-lg">
            <nav className="flex items-center">
              <Link to="/login" className="h-11 px-space-xl bg-primary-container text-on-primary font-label-caps text-label-caps tracking-wider uppercase rounded-lg flex items-center justify-center hover:bg-primary transition-colors duration-150">
                Sign in
              </Link>
            </nav>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
            </div>
          </div>
        </div>
      </header>

      <main className="w-full pt-20 flex-1 bg-surface">
        <div className="max-w-[1120px] mx-auto p-space-xl">
          <div className="flex flex-col w-full">
            <div className="w-full max-w-[1120px] mx-auto py-12 md:py-20 lg:py-24">
              
              {/* Hero Section */}
              <section className="max-w-[840px] flex flex-col items-start">
                <div className="inline-flex items-center gap-2 mb-6 px-2.5 py-1 bg-surface-container rounded border border-outline-variant/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
                  <span className="font-data-tabular text-[11px] tracking-widest uppercase text-on-surface-variant font-medium">Diagnostic Support Specification</span>
                </div>
                <h1 className="font-headline-xl text-[44px] md:text-[56px] leading-[1.12] text-on-surface font-semibold tracking-tight mb-7">
                  Know the risk before the patient leaves.
                </h1>
                <p className="font-body-lg text-[17px] md:text-[18px] leading-[1.6] text-on-surface-variant max-w-[640px] mb-10">
                  AURA estimates 30-day readmission risk, shows the factors behind each score, and writes a clinical summary for your team.
                </p>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                  <Link to="/login" className="h-[44px] px-6 bg-primary-container text-on-primary font-body-md text-[14px] font-semibold tracking-normal rounded flex items-center justify-center hover:bg-primary transition-colors duration-150 text-center">
                    Sign in
                  </Link>
                  <div className="flex items-center gap-2 px-1 text-on-surface-variant">
                    <span className="font-data-tabular text-body-sm text-[12px] uppercase tracking-wider text-outline">ED • Inpatient Discharge Protocol</span>
                  </div>
                </div>
              </section>

              {/* Editorial Separation Rule */}
              <div className="w-full my-16 md:my-20 border-t border-outline-variant/60"></div>

              {/* Three-Step Workflow Architecture */}
              <section className="w-full">
                <div className="flex items-baseline justify-between mb-8 pb-3 border-b border-outline-variant/40">
                  <span className="font-label-caps text-label-caps uppercase text-on-surface-variant tracking-wider">Clinical Methodology</span>
                  <span className="font-data-tabular text-[12px] text-outline">Workflow: Sequence 01–03</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                  {/* Step 1 */}
                  <div className="bg-surface-container-lowest rounded-lg border border-outline-variant/80 p-7 md:p-8 flex flex-col justify-between transition-colors duration-150">
                    <div>
                      <div className="font-data-tabular text-[12px] text-primary-container font-semibold tracking-wider uppercase mb-4">
                        Step 01
                      </div>
                      <h2 className="font-headline-md text-[21px] leading-[1.3] text-on-surface font-semibold mb-3">
                        1. Enter the patient’s details.
                      </h2>
                      <p className="font-body-md text-[15px] leading-[1.55] text-on-surface-variant">
                        Demographic and clinical parameters entered during discharge planning.
                      </p>
                    </div>
                    <div className="mt-8 pt-4 border-t border-surface-container-high flex items-center justify-between text-outline">
                      <span className="font-data-tabular text-[11px] uppercase tracking-wider">Registry Input</span>
                      <span className="font-data-tabular text-[11px]">EHR/Manual</span>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="bg-surface-container-lowest rounded-lg border border-outline-variant/80 p-7 md:p-8 flex flex-col justify-between transition-colors duration-150">
                    <div>
                      <div className="font-data-tabular text-[12px] text-primary-container font-semibold tracking-wider uppercase mb-4">
                        Step 02
                      </div>
                      <h2 className="font-headline-md text-[21px] leading-[1.3] text-on-surface font-semibold mb-3">
                        2. See the risk and what drove it.
                      </h2>
                      <p className="font-body-md text-[15px] leading-[1.55] text-on-surface-variant">
                        30-day readmission probability calibrated with SHAP feature attribution.
                      </p>
                    </div>
                    <div className="mt-8 pt-4 border-t border-surface-container-high flex items-center justify-between text-outline">
                      <span className="font-data-tabular text-[11px] uppercase tracking-wider">Calibration</span>
                      <span className="font-data-tabular text-[11px]">Attribution Vector</span>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="bg-surface-container-lowest rounded-lg border border-outline-variant/80 p-7 md:p-8 flex flex-col justify-between transition-colors duration-150">
                    <div>
                      <div className="font-data-tabular text-[12px] text-primary-container font-semibold tracking-wider uppercase mb-4">
                        Step 03
                      </div>
                      <h2 className="font-headline-md text-[21px] leading-[1.3] text-on-surface font-semibold mb-3">
                        3. Read the clinical summary.
                      </h2>
                      <p className="font-body-md text-[15px] leading-[1.55] text-on-surface-variant">
                        AI-synthesized clinical reasoning and targeted recommendations.
                      </p>
                    </div>
                    <div className="mt-8 pt-4 border-t border-surface-container-high flex items-center justify-between text-outline">
                      <span className="font-data-tabular text-[11px] uppercase tracking-wider">Synthesis</span>
                      <span className="font-data-tabular text-[11px]">Directives • Signed</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Structural Baseline Sign-off */}
              <div className="mt-16 md:mt-20 pt-6 border-t border-outline-variant/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-outline font-data-tabular text-[11px]">
                <div className="flex items-center gap-6">
                  <span>ARCHIVE REF: 30D-DISCH-AURA</span>
                  <span>AUDIT STANDARD: CL-2024</span>
                </div>
                <div>
                  <span>GOVERNANCE: CLINICAL EVIDENCE PLATFORM</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
      
      <footer className="w-full bg-surface border-t border-outline-variant mt-auto">
        <div className="max-w-[1120px] mx-auto px-margin py-space-xl flex flex-col sm:flex-row items-center justify-between gap-space-md">
          <span className="font-body-md text-body-md text-on-surface-variant">AURA (AI-Utilized Readmission Assessment)</span>
          <nav className="flex items-center gap-space-lg">
            <Link to="/privacy" className="font-body-md text-body-md text-on-surface-variant hover:text-primary-container transition-colors duration-150">Privacy</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
