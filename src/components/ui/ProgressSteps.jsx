import React from 'react';
import { Check } from 'lucide-react';

/**
 * Step progress indicator component
 */
export const ProgressSteps = ({ currentStep, isDark }) => {
  const steps = [
    { id: 'input', label: 'Enter URL', number: 1 },
    { id: 'file-select', label: 'Select Files', number: 2 },
    { id: 'analyzing', label: 'Analyzing', number: 3 },
    { id: 'results', label: 'Results', number: 4 },
  ];

  const getStepStatus = (stepId) => {
    const stepOrder = ['input', 'file-select', 'analyzing', 'results'];
    const currentIndex = stepOrder.indexOf(currentStep);
    const stepIndex = stepOrder.indexOf(stepId);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  return (
    <nav aria-label="Progress" className="mb-8">
      <ol className="flex items-center justify-center gap-2 md:gap-4">
        {steps.map((step, index) => {
          const status = getStepStatus(step.id);
          const isLast = index === steps.length - 1;

          return (
            <li key={step.id} className="flex items-center">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    status === 'completed'
                      ? 'bg-emerald-500 text-white'
                      : status === 'current'
                      ? 'bg-cyan-500 text-white ring-4 ring-cyan-500/30'
                      : isDark
                      ? 'bg-slate-800 text-slate-500 border border-slate-700'
                      : 'bg-slate-200 text-slate-400 border border-slate-300'
                  }`}
                  aria-current={status === 'current' ? 'step' : undefined}
                >
                  {status === 'completed' ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    step.number
                  )}
                </div>
                <span
                  className={`mt-1 text-[10px] font-medium hidden md:block ${
                    status === 'current'
                      ? 'text-cyan-500'
                      : status === 'completed'
                      ? 'text-emerald-500'
                      : isDark
                      ? 'text-slate-500'
                      : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div
                  className={`w-8 md:w-16 h-0.5 mx-2 transition-colors duration-300 ${
                    getStepStatus(steps[index + 1].id) === 'completed' ||
                    getStepStatus(steps[index + 1].id) === 'current'
                      ? 'bg-cyan-500'
                      : isDark
                      ? 'bg-slate-700'
                      : 'bg-slate-300'
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default ProgressSteps;
