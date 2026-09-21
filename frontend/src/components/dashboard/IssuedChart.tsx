interface IssuedPoint {
  day: string
  value: number
}

interface Props {
  data: IssuedPoint[]
}

function IssuedChart({ data }: Props) {
  const width = 340
  const height = 170
  const padTop = 20
  const padBottom = 24
  const padLeft = 0
  const padRight = 0

  const chartH = height - padTop - padBottom
  const chartW = width - padLeft - padRight
  const maxVal = Math.max(...data.map((point) => point.value), 1)
  const range = maxVal

  const getX = (i: number) => padLeft + (data.length <= 1 ? chartW / 2 : (i / (data.length - 1)) * chartW)
  const getY = (v: number) => padTop + (1 - v / range) * chartH

  const pts = data.map((d, i) => ({ x: getX(i), y: getY(d.value) }))
  let linePath = pts.length > 0 ? `M${pts[0].x},${pts[0].y}` : ''
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1]
    const curr = pts[i]
    const cpx1 = prev.x + (curr.x - prev.x) * 0.4
    const cpx2 = curr.x - (curr.x - prev.x) * 0.4
    linePath += ` C${cpx1},${prev.y} ${cpx2},${curr.y} ${curr.x},${curr.y}`
  }
  const areaPath = pts.length > 0
    ? `${linePath} L${pts[pts.length - 1].x},${height - padBottom} L${pts[0].x},${height - padBottom} Z`
    : ''

  const gridLines = [maxVal, Math.round(maxVal * 0.75), Math.round(maxVal * 0.5), Math.round(maxVal * 0.25)]

  return (
    <article className="dashboard-card issued-chart dashboard-enter">
      <div className="card-heading">
        <div>
          <h2>Certificates Issued Over Time</h2>
          <p>Daily issuance activity</p>
        </div>
        <button className="select-button">Last 7 days</button>
      </div>
      <div className="line-chart">
        <div className="chart-scale">
          {gridLines.map((v, index) => <span key={`${v}-${index}`}>{v}</span>)}
        </div>
        {data.some((point) => point.value > 0) ? (
          <>
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
              {gridLines.map((v) => {
                const y = getY(v)
                return <line key={v} x1={padLeft} y1={y} x2={width - padRight} y2={y} stroke="#edf1f6" strokeWidth="1" />
              })}
              <path d={areaPath} fill="url(#areaGrad)" className="chart-area-fill" />
              <path d={linePath} fill="none" stroke="url(#lineGrad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="chart-line" />
            </svg>
            <div className="chart-days">
              {data.map((d) => <span key={d.day}>{d.day}</span>)}
            </div>
          </>
        ) : (
          <div className="dashboard-empty-state">
            <b>No certificates issued yet</b>
            <span>Your daily issuance trend will appear here.</span>
          </div>
        )}
      </div>
    </article>
  )
}

export default IssuedChart
