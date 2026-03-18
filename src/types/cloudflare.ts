export interface TokenVerifyResult {
  result: { id: string; status: string };
  success: boolean;
  messages: { message: string }[];
}

export interface Zone {
  id: string;
  name: string;
  status: string;
  paused: boolean;
  type: string;
  plan: { name: string };
  name_servers: string[];
  original_name_servers: string[];
}

export interface ZonesResponse {
  result: Zone[];
  result_info: PaginationInfo;
  success: boolean;
}

export interface DnsRecord {
  id: string;
  type: string;
  name: string;
  content: string;
  ttl: number;
  proxied: boolean;
  priority?: number;
}

export interface DnsRecordsResponse {
  result: DnsRecord[];
  result_info: PaginationInfo;
  success: boolean;
}

export interface PaginationInfo {
  page: number;
  per_page: number;
  total_count: number;
  total_pages: number;
}

export interface Worker {
  id: string;
  created_on: string;
  modified_on: string;
  handlers: string[];
  last_deployed_from?: string;
  compatibility_date?: string;
  compatibility_flags?: string[];
  has_modules: boolean;
  has_assets: boolean;
  logpush: boolean;
  usage_model: string;
  observability?: {
    enabled: boolean;
    logs?: { enabled: boolean };
  };
}

export interface WorkerBinding {
  name: string;
  type: string;
  // D1
  database_id?: string;
  // KV
  namespace_id?: string;
  // Service
  service?: string;
  environment?: string;
  // R2
  bucket_name?: string;
  // Plain text
  text?: string;
  // Queue
  queue_name?: string;
}

export interface WorkerSettings {
  bindings: WorkerBinding[];
  placement?: { mode: string };
  compatibility_date?: string;
  compatibility_flags?: string[];
}

export interface WorkerSettingsResponse {
  result: WorkerSettings;
  success: boolean;
}

export interface WorkersResponse {
  result: Worker[];
  success: boolean;
}

export interface PagesProject {
  id: string;
  name: string;
  subdomain: string;
  production_branch: string;
  created_on: string;
  source?: { type: string };
}

export interface PagesResponse {
  result: PagesProject[];
  success: boolean;
}

export interface R2Bucket {
  name: string;
  creation_date: string;
}

export interface R2Response {
  result: { buckets: R2Bucket[] };
  success: boolean;
}

export interface KvNamespace {
  id: string;
  title: string;
}

export interface KvResponse {
  result: KvNamespace[];
  success: boolean;
}

export interface AccountOverview {
  zones: number;
  workers: number;
  r2Buckets: number;
  kvNamespaces: number;
  aiGateways: number;
}

export interface AccountInfo {
  id: string;
  name: string;
}

export interface AccountsResponse {
  result: AccountInfo[];
  success: boolean;
}

export interface WorkerLogEntry {
  $workers: {
    scriptName: string;
    wallTimeMs: number;
    outcome: string;
    event?: {
      request?: { method: string; url: string };
      response?: { status: number };
    };
  };
  timestamp: string;
  logs?: Array<{ message: string; level: string }>;
}

export interface WorkerAnalytics {
  totalRequests: number;
  totalErrors: number;
  totalSubrequests: number;
  p50Latency: number;
  p99Latency: number;
}

export interface AiGateway {
  id: string;
  cache_invalidate_on_update: boolean;
  cache_ttl: number;
  collect_logs: boolean;
  created_at: string;
  modified_at: string;
  rate_limiting_interval: number;
  rate_limiting_limit: number;
  rate_limiting_technique: string;
  authentication: boolean;
  log_management: number;
  log_management_strategy: string;
  logpush: boolean;
}

export interface AiGatewayResponse {
  result: AiGateway[];
  result_info?: PaginationInfo;
  success: boolean;
}

export interface AiGatewayLog {
  id: string;
  cached: boolean;
  created_at: string;
  duration: number;
  model: string;
  path: string;
  provider: string;
  success: boolean;
  tokens_in: number;
  tokens_out: number;
  cost: number;
  status_code: number;
}

export interface AiGatewayLogsResponse {
  result: AiGatewayLog[];
  result_info: PaginationInfo & {
    max_cost: number;
    min_cost: number;
    max_duration: number;
    min_duration: number;
    max_tokens_in: number;
    max_tokens_out: number;
    max_total_tokens: number;
  };
  success: boolean;
}
