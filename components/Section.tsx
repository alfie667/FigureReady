interface Props {
  step: number
  title: string
  children: React.ReactNode
}

export default function Section({ step, title, children }: Props) {
  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-5">
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#7c3aed] text-white text-xs font-semibold shrink-0">
          {step}
        </span>
        <h2 className="text-sm font-semibold text-slate-700">{title}</h2>
      </div>
      {children}
    </section>
  )
}
