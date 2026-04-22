import { z } from 'zod';

export const packageJsonSchema = z.object({
  name: z.string().min(1),
  version: z.string().min(1),
  dependencies: z.record(z.string(), z.string()).optional().default({}),
  devDependencies: z.record(z.string(), z.string()).optional().default({}),
  peerDependencies: z.record(z.string(), z.string()).optional().default({}),
  optionalDependencies: z.record(z.string(), z.string()).optional().default({}),
}).passthrough();

export type ParsedPackageJson = z.infer<typeof packageJsonSchema>;

export function parsePackageJson(raw: string): ParsedPackageJson {
  return packageJsonSchema.parse(JSON.parse(raw));
}
