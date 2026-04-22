'use client';

import { useQueries } from '@tanstack/react-query';
import { fetchPackageInfo } from '@/src/shared/api/npm-registry';
import { buildDependencyGraph } from '@/src/shared/lib/graph/build-graph';
import { usePackageInputStore } from '@/src/features/package-input/model/store';

export function useGraphData() {
  const packageJson = usePackageInputStore((s) => s.packageJson);

  const allDeps = packageJson
    ? [
        ...Object.keys(packageJson.dependencies),
        ...Object.keys(packageJson.devDependencies),
        ...Object.keys(packageJson.peerDependencies),
        ...Object.keys(packageJson.optionalDependencies),
      ]
    : [];

  const results = useQueries({
    queries: allDeps.map((name) => ({
      queryKey: ['npm-package', name] as const,
      queryFn: () => fetchPackageInfo(name),
      enabled: !!packageJson,
      staleTime: 1000 * 60 * 60,
      retry: 1,
    })),
  });

  const isLoading = results.some((r) => r.isPending);
  const registryData = Object.fromEntries(
    results.filter((r) => r.data).map((r) => [r.data!.name, r.data!]),
  );

  const graph =
    packageJson && !isLoading
      ? buildDependencyGraph(packageJson, registryData)
      : null;

  return { graph, isLoading, packageJson, registryData };
}
