import { Card, Header } from '../../../components/AppPrimitives'

function TrustDot() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#6b705c]/20 bg-[#6b705c]/8 px-2 py-0.5">
      <span className="h-1.5 w-1.5 rounded-full bg-[#6b705c]/70 shrink-0" />
      <span className="text-[9px] font-black uppercase tracking-[0.12em] text-[#e8dcc0]/45">Not enough data</span>
    </span>
  )
}

export default function WipPageTemplate({ title, eyebrow, description, willShow, requires }) {
  return (
    <>
      <Header
        eyebrow={eyebrow}
        title={title}
        body={description}
      />
      <Card>
        <div className="py-10">
          <div className="font-serif text-[5rem] font-black leading-none text-[#c9a96e]/[0.04] mb-6 text-center select-none">
            ◎
          </div>

          <div className="max-w-lg mx-auto space-y-6">
            <div className="text-center">
              <p className="text-sm font-bold text-[#e8dcc0]/50 mb-1">Page not yet active.</p>
              <p className="text-xs text-[#e8dcc0]/30 leading-6">
                This page is in development. No estimates or placeholder data will be shown.
              </p>
            </div>

            {willShow && (
              <div className="rounded-2xl border border-[#6b705c]/15 bg-[#6b705c]/5 px-4 py-4">
                <div className="text-[10px] font-black uppercase tracking-widest text-[#e8dcc0]/40 mb-2">
                  What this page will show
                </div>
                <ul className="space-y-1.5">
                  {willShow.map((item, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-[10px] text-[#e8dcc0]/35 leading-4">
                      <span className="mt-0.5 shrink-0 text-[#c9a96e]/40">·</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {requires && (
              <div className="rounded-2xl border border-[#c9a96e]/12 bg-[#c9a96e]/4 px-4 py-4">
                <div className="text-[10px] font-black uppercase tracking-widest text-[#c9a96e]/50 mb-2">
                  Required to activate
                </div>
                <ul className="space-y-1.5">
                  {requires.map((item, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-[10px] text-[#e8dcc0]/35 leading-4">
                      <span className="mt-0.5 shrink-0 text-[#c9a96e]/50">→</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-center">
              <TrustDot />
            </div>
          </div>
        </div>
      </Card>
    </>
  )
}
