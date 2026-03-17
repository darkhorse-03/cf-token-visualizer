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
}: {
  name: SimpleIconName;
  className?: string;
}) {
  const icon = icons[name];
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      dangerouslySetInnerHTML={{ __html: icon.path }}
    />
  );
}
