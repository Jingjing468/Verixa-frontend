import { useEffect, useState } from 'react'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps { icon: LucideIcon; label: string; value: number; detail: string; tone: 'blue' | 'green' | 'orange' | 'red'; delay: number }

function StatCard({ icon: Icon, label, value, detail, tone, delay }: StatCardProps) {
  const [count, setCount] = useState(0)
  useEffect(() => { const start = performance.now(); const frame = now => { const progress = Math.min((now - start) / 700, 1); setCount(Math.round(value * (1 - Math.pow(1 - progress, 3)))); if (progress < 1) requestAnimationFrame(frame) }; requestAnimationFrame(frame) }, [value])
  return <article className="dash-stat-card dashboard-enter" style={{ animationDelay: `${delay}ms` }}><span className={`stat-icon ${tone}`}><Icon size={22} /></span><div><p>{label}</p><strong>{count.toLocaleString()}</strong><small className={tone}>{detail}</small></div></article>
}
export default StatCard
