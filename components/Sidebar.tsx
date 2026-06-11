export type StepStatus = 'done' | 'active' | 'pending'

export interface NavStep {
  id: string
  label: string
  status: StepStatus
}

function StepIndicator({ status, index }: { status: StepStatus; index: number }) {
  if (status === 'done') {
    return (
      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white shrink-0">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      </span>
    )
  }
  return (
    <span
      className={`flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-semibold shrink-0 ${
        status === 'active' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
      }`}
    >
      {index}
    </span>
  )
}

export function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M3 3v18h18M7 16l4-5 3 3 5-7" />
        </svg>
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-800 tracking-tight leading-tight">FigureReady</p>
        <p className="text-[11px] text-slate-400 leading-tight">Excel → Figure</p>
      </div>
    </div>
  )
}

export function StepNav({ steps, onNavigate }: { steps: NavStep[]; onNavigate?: () => void }) {
  return (
    <nav className="space-y-1">
      {steps.map((step, i) => (
        <a
          key={step.id}
          href={`#${step.id}`}
          onClick={onNavigate}
          aria-disabled={step.status === 'pending'}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            step.status === 'pending'
              ? 'text-slate-300 pointer-events-none'
              : step.status === 'active'
              ? 'bg-blue-50 text-blue-700'
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <StepIndicator status={step.status} index={i + 1} />
          {step.label}
        </a>
      ))}
    </nav>
  )
}

export default function Sidebar({ steps }: { steps: NavStep[] }) {
  return (
    <aside className="hidden lg:flex lg:flex-col w-60 shrink-0 border-r border-slate-200 bg-white px-5 py-6">
      <div className="mb-10">
        <Logo />
      </div>
      <StepNav steps={steps} />
      <div className="mt-auto pt-6 text-[11px] text-slate-300">FigureReady · MVP</div>
    </aside>
  )
}
