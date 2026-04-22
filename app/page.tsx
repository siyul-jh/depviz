import { ErrorBoundary } from 'react-error-boundary';
import { PackageInputPanel } from '@/src/features/package-input/ui/PackageInputPanel';
import { GraphPanel } from '@/src/widgets/dependency-graph-panel/ui/GraphPanel';
import { ErrorFallback } from '@/src/shared/ui/ErrorFallback';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          DepViz
        </h1>
        <p className="text-xs text-zinc-500">package.json 의존성 분석 도구</p>
      </header>

      <main className="flex flex-1 flex-col gap-6 p-6 min-h-0 md:flex-row">
        <aside className="w-full shrink-0 md:w-80">
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <PackageInputPanel />
          </ErrorBoundary>
        </aside>
        <section className="flex flex-1 flex-col rounded-xl border border-zinc-200 bg-white p-6 shadow-sm min-h-0 min-h-[480px] dark:border-zinc-800 dark:bg-zinc-950 md:min-h-0">
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <GraphPanel />
          </ErrorBoundary>
        </section>
      </main>
    </div>
  );
}
