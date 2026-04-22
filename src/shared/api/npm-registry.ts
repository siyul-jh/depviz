export interface NpmPackageInfo {
  name: string;
  latestVersion: string;
  publishedAt: string | null;
}

export async function fetchPackageInfo(name: string): Promise<NpmPackageInfo> {
  const res = await fetch(
    `https://registry.npmjs.org/${encodeURIComponent(name)}/latest`,
    { next: { revalidate: 3600 } },
  );
  if (!res.ok) throw new Error(`npm registry: ${name} ${res.status}`);
  const data = await res.json();
  return {
    name: data.name,
    latestVersion: data.version,
    publishedAt: data.time?.modified ?? null,
  };
}
