export interface Workflow {
  id: string;
  name: string;
  status: string | null;
  user_email_created: string | null;
  user_email_updated: string | null;
  rd_created_at: string | null;
  rd_updated_at: string | null;
  synced_at: string;
}

export interface WorkflowMetric {
  id: number;
  workflow_id: string;
  snapshot_date: string;
  period_start: string | null;
  period_end: string | null;
  emails_count: number | null;
  total_sent: number | null;
  total_delivered: number | null;
  total_opened: number | null;
  total_clicked: number | null;
  total_bounced: number | null;
  total_unsubscribed: number | null;
  delivery_rate: number | null;
  open_rate: number | null;
  click_rate: number | null;
  bounce_rate: number | null;
  worst_email_id: string | null;
  worst_email_metric: string | null;
  worst_email_value: number | null;
  synced_at: string;
}

export interface Email {
  id: string;
  campaign_id: string | null;
  workflow_id: string | null;
  name: string;
  type: string | null;
  status: string | null;
  send_at: string | null;
  leads_count: number | null;
  is_predictive_sending: boolean | null;
  rd_created_at: string | null;
  rd_updated_at: string | null;
  synced_at: string;
}

export interface EmailMetric {
  id: number;
  email_id: string;
  snapshot_date: string;
  period_start: string | null;
  period_end: string | null;
  sent: number | null;
  delivered: number | null;
  opened: number | null;
  unique_opens: number | null;
  clicked: number | null;
  unique_clicks: number | null;
  bounced: number | null;
  soft_bounces: number | null;
  hard_bounces: number | null;
  unsubscribed: number | null;
  spam_reports: number | null;
  delivery_rate: number | null;
  open_rate: number | null;
  click_rate: number | null;
  ctor: number | null;
  bounce_rate: number | null;
  unsubscribe_rate: number | null;
  synced_at: string;
}

export interface SyncLog {
  id: number;
  source: string;
  status: string;
  items_synced: number | null;
  duration_ms: number | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}
