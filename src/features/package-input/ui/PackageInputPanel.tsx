'use client';

import { useState } from 'react';
import { FileUploadTab } from './FileUploadTab';
import { UrlTab } from './UrlTab';
import { TextTab } from './TextTab';
import { usePackageInputStore } from '../model/store';
import type { InputMethod } from '@/src/shared/types';

const TABS: { id: InputMethod; label: string }[] = [
  { id: 'upload', label: '파일 업로드' },
  { id: 'url', label: 'URL' },
  { id: 'text', label: '텍스트' },
];

export function PackageInputPanel() {
  const [activeTab, setActiveTab] = useState<InputMethod>('upload');
  const { packageJson, reset } = usePackageInputStore();

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
          package.json 입력
        </h2>
        {packageJson && (
          <button
            onClick={reset}
            className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
          >
            초기화
          </button>
        )}
      </div>

      {packageJson ? (
        <div className="rounded-lg bg-zinc-50 px-4 py-3 dark:bg-zinc-900">
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {packageJson.name}{' '}
            <span className="font-normal text-zinc-400">v{packageJson.version}</span>
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            prod {Object.keys(packageJson.dependencies).length} ·
            dev {Object.keys(packageJson.devDependencies).length} ·
            peer {Object.keys(packageJson.peerDependencies).length}
          </p>
        </div>
      ) : (
        <>
          <div className="flex gap-1 border-b border-zinc-200 dark:border-zinc-800">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-b-2 border-zinc-900 font-medium text-zinc-900 dark:border-zinc-50 dark:text-zinc-50'
                    : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div>
            {activeTab === 'upload' && <FileUploadTab />}
            {activeTab === 'url' && <UrlTab />}
            {activeTab === 'text' && <TextTab />}
          </div>
        </>
      )}
    </div>
  );
}
