export type NotificationCategory = 'certificate' | 'email' | 'security' | 'system'

export interface NotificationItem {
  id: string
  title: string
  message: string
  category: NotificationCategory
  timestamp: string
  timeGroup: 'today' | 'yesterday' | 'earlier'
  unread: boolean
  certificateId?: string
}

export type NotificationFilter = 'all' | 'certificate' | 'email' | 'security' | 'system'
