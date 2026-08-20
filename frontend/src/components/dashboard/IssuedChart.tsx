function IssuedChart() {
  const data = [
    { day: 'May 17', value: 118 },
    { day: 'May 18', value: 145 },
    { day: 'May 19', value: 162 },
    { day: 'May 20', value: 220 },
    { day: 'May 21', value: 195 },
    { day: 'May 22', value: 135 },
    { day: 'May 23', value: 160 },
  ]

  const width = 340
  const height = 170
  const padTop = 20
  const padBottom = 24
  const padLeft = 0
  const padRight = 0

  const chartH = height - padTop - padBottom
  const chartW = width - padLeft - padRight
  const maxVal = 250
  const minVal = 80
  const range = maxVal - minVal

  const getX = (i: number) => padLeft + (i / (data.length - 1)) * chartW
  const getY = (v: number) => padTop + (1 - (v - minVal) / range) * chartH

  // Build smooth bezier path
  const pts = data.map((d, i) => ({ x: getX(i), y: getY(d.value) }))
  let linePath = `M${pts[0].x},${pts[0].y}`
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1]
    const curr = pts[i]
    const cpx1 = prev.x + (curr.x - prev.x) * 0.4
    const cpx2 = curr.x - (curr.x - prev.x) * 0.4
    linePath += ` C${cpx1},${prev.y} ${cpx2},${curr.y} ${curr.x},${curr.y}`
  }
  const areaPath = linePath + ` L${pts[pts.length - 1].x},${height - padBottom} L${pts[0].x},${height - padBottom} Z`

  const gridLines = [250, 200, 150, 100]

  return (
    <article className="dashboard-card issued-chart dashboard-enter">
      <div className="card-heading">
        <div>
          <h2>Certificates Issued Over Time</h2>
          <p>Daily issuance activity</p>
        </div>
        <button className="select-button">Last 7 days ▾</button>
      </div>
      <div className="line-chart">
        <div className="chart-scale">
          {gridLines.map((v) => <span key={v}>{v}</span>)}
        </div>
        <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-label="Certificate issuance trend">
          <defs>
            <linearGradient id="areaGrad" x1="0" x2="0" y1="0" y2="1">
              <stop stopColor="#4b8bff" stopOpacity=".22" />
              <stop offset="1" stopColor="#4b8bff" stopOpacity=".02" />
            </linearGradient>
            <linearGradient id="lineGrad" x1="0" x2="1" y1="0" y2="0">
              <stop stopColor="#5b8fff" />
              <stop offset="1" stopColor="#3975ff" />
            </linearGradient>
          </defs>
          {/* Grid lines */}
          {gridLines.map((v) => {
            const y = getY(v)
            return <line key={v} x1={padLeft} y1={y} x2={width - padRight} y2={y} stroke="#edf1f6" strokeWidth="1" />
          })}
          {/* Area fill */}
          <path d={areaPath} fill="url(#areaGrad)" className="chart-area-fill" />
          {/* Line */}
          <path d={linePath} fill="none" stroke="url(#lineGrad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="chart-line" />

        </svg>
        <div className="chart-days">
          {data.map((d) => <span key={d.day}>{d.day}</span>)}
        </div>
      </div>
    </article>
  )
}

export default IssuedChart
