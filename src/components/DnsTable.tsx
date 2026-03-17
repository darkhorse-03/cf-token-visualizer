import type { DnsRecord } from "#/types/cloudflare";

export function DnsTable({ records }: { records: DnsRecord[] }) {
  if (records.length === 0) {
    return (
      <div className="alert alert-info alert-soft">
        <span className="text-sm">No DNS records found.</span>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="table table-sm table-zebra">
        <thead>
          <tr>
            <th>Type</th>
            <th>Name</th>
            <th>Content</th>
            <th>TTL</th>
            <th>Proxy</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r.id}>
              <td>
                <kbd className="kbd kbd-xs">{r.type}</kbd>
              </td>
              <td className="font-mono text-xs">{r.name}</td>
              <td className="font-mono text-xs max-w-xs truncate">
                {r.content}
              </td>
              <td className="text-base-content/50">
                {r.ttl === 1 ? "Auto" : `${r.ttl}s`}
              </td>
              <td>
                {r.proxied ? (
                  <span className="badge badge-warning badge-xs">proxied</span>
                ) : (
                  <span className="badge badge-ghost badge-xs">dns</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
