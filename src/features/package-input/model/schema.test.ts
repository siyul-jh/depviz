import { describe, it, expect } from 'vitest';
import { parsePackageJson } from './schema';

describe('parsePackageJson', () => {
  it('필수 필드만 있는 package.json 파싱', () => {
    const result = parsePackageJson(JSON.stringify({ name: 'my-app', version: '1.0.0' }));
    expect(result.name).toBe('my-app');
    expect(result.version).toBe('1.0.0');
    expect(result.dependencies).toEqual({});
    expect(result.devDependencies).toEqual({});
  });

  it('의존성 포함 파싱', () => {
    const pkg = {
      name: 'app',
      version: '2.0.0',
      dependencies: { react: '^18.0.0' },
      devDependencies: { typescript: '^5.0.0' },
    };
    const result = parsePackageJson(JSON.stringify(pkg));
    expect(result.dependencies).toEqual({ react: '^18.0.0' });
    expect(result.devDependencies).toEqual({ typescript: '^5.0.0' });
  });

  it('name이 없으면 에러', () => {
    expect(() => parsePackageJson(JSON.stringify({ version: '1.0.0' }))).toThrow();
  });

  it('유효하지 않은 JSON이면 에러', () => {
    expect(() => parsePackageJson('not-json')).toThrow();
  });
});
