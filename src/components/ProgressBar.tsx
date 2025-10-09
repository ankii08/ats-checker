// Progress indicator component
'use client';

interface ProgressBarProps {
  steps: string[];
  currentStep: number;
}

export function ProgressBar({ steps, currentStep }: ProgressBarProps) {
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto mb-6">
      <div className="relative">
        {/* Progress bar */}
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Step indicators */}
        <div className="flex justify-between mt-4">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex flex-col items-center transition-all duration-300 ${
                index <= currentStep ? 'opacity-100' : 'opacity-40'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-2 ${
                  index < currentStep
                    ? 'bg-emerald-500 text-white'
                    : index === currentStep
                    ? 'bg-indigo-600 text-white animate-pulse'
                    : 'bg-gray-700 text-gray-400'
                }`}
              >
                {index < currentStep ? '✓' : index + 1}
              </div>
              <p className="text-xs text-gray-400 text-center max-w-[80px]">{step}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
