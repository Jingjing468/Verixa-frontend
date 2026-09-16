export default function TopPrograms() {
  const programs = [
    { name: 'Blockchain Development', certificates: 324 },
    { name: 'Smart Contract Basics', certificates: 241 },
    { name: 'Web3 Fundamentals', certificates: 198 },
    { name: 'Ethereum Development', certificates: 165 },
    { name: 'Decentralized Applications', certificates: 142 },
  ]
  const max = programs[0].certificates

  return (
    <article className="report-chart-card top-programs-card">
      <div className="report-chart-header">
        <div>
          <h2>Top Programs</h2>
          <p>Most active certificate programs this period.</p>
        </div>
      </div>
      <div className="programs-list">
        {programs.map((p, i) => (
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
        ))}
      </div>
    </article>
  )
}
