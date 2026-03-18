const iconPaths = {
  r2: "/brand/cloudflare/r2.svg",
  kv: "/brand/cloudflare/kv.svg",
  aiGateway: "/brand/cloudflare/ai-gateway.svg",
} as const;

export type CloudflareAssetIconName = keyof typeof iconPaths;

export function CloudflareAssetIcon({
  name,
  className = "size-4",
}: {
  name: CloudflareAssetIconName;
  className?: string;
}) {
  return (
    <img
      src={iconPaths[name]}
      alt=""
      aria-hidden="true"
      className={`${className} shrink-0 object-contain`}
      loading="lazy"
      decoding="async"
    />
  );
}
