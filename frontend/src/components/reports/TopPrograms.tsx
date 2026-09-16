interface ProgramSummary {
  name: string
  certificates: number
}

interface Props {
  programs: ProgramSummary[]
}

export default function TopPrograms({ programs }: Props) {
  const max = Math.max(...programs.map((program) => program.certificates), 1)

  return (
    <article className="report-chart-card top-programs-card">
      <div className="report-chart-header">
        <div>
          <h2>Top Programs</h2>
          <p>Most active certificate programs this period.</p>
        </div>
      </div>
      <div className="programs-list">
        {programs.length > 0 ? (
          programs.map((p, i) => (
            <div key={p.name} className="program-row" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="program-rank">{i + 1}</div>
              <div className="program-info">
                <div className="program-name-row">
                  <b>{p.name}</b>
                  <span>{p.certificates} certificates</span>
                </div>
                <div className="program-bar-track">
                  <div className="program-bar-fill" style={{ width: `${(p.certificates / max) * 100}%` }} />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="report-empty-state">
            <b>No programs yet</b>
            <span>Issued certificate programs will appear here.</span>
          </div>
        )}
      </div>
    </article>
  )
}
