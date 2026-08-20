export interface ReportMetric {
  label: string
  value: number
  trend?: number
  icon?: string
  tone?: 'blue' | 'green' | 'orange' | 'red'
  detail?: string
}

export interface ChartDataPoint {
  label: string
  value: number
}

export interface ProgramRank {
  name: string
  certificates: number
  percentage: number
}

export interface ActivityItem {
  text: string
  time: string
  type: 'issue' | 'revoke' | 'verify' | 'report'
}
