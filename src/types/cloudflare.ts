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
  name: string;
  modified_on: string;
  created_on: string;
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
  pages: number;
  r2Buckets: number;
  kvNamespaces: number;
}

export interface AccountInfo {
  id: string;
  name: string;
}

export interface AccountsResponse {
  result: AccountInfo[];
  success: boolean;
}
