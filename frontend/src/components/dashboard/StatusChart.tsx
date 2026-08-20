function StatusChart() {
  return <article className="dashboard-card status-chart dashboard-enter"><div className="card-heading"><div><h2>Certificate Status Overview</h2><p>Your credentials at a glance</p></div><button>View details</button></div><div className="donut-area"><div className="donut-chart"><div><strong>1,248</strong><span>Total</span></div></div><div className="chart-legend"><span><i className="valid" />Valid <b>1,102</b></span><span><i className="expired" />Expired <b>98</b></span><span><i className="revoked" />Revoked <b>48</b></span></div></div></article>
}
export default StatusChart
