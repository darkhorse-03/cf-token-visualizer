import {
  siCloudflare,
  siCloudflareworkers,
  siCloudflarepages,
} from "simple-icons";

const icons = {
  cloudflare: siCloudflare,
  workers: siCloudflareworkers,
  pages: siCloudflarepages,
} as const;

export type SimpleIconName = keyof typeof icons;

export function SimpleIcon({
  name,
  className = "size-4",
  useBrandColor = true,
}: {
  name: SimpleIconName;
  className?: string;
  useBrandColor?: boolean;
}) {
  const icon = icons[name];
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-label={icon.title}
      style={useBrandColor ? { color: `#${icon.hex}` } : undefined}
    >
      <path d={icon.path} />
    </svg>
  );
}
