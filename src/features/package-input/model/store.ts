import { create } from 'zustand';
import type { ParsedPackageJson } from './schema';

interface PackageInputState {
  packageJson: ParsedPackageJson | null;
  setPackageJson: (pkg: ParsedPackageJson) => void;
  reset: () => void;
}

export const usePackageInputStore = create<PackageInputState>((set) => ({
  packageJson: null,
  setPackageJson: (packageJson) => set({ packageJson }),
  reset: () => set({ packageJson: null }),
}));
