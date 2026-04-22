import { describe, it, expect } from 'vitest';
import { calcVersionRisk, isOutdated } from './index';

describe('calcVersionRisk', () => {
  it('동일 major → low', () => {
    expect(calcVersionRisk('1.2.0', '1.9.0')).toBe('low');
  });

  it('1 major 차이 → medium', () => {
    expect(calcVersionRisk('1.0.0', '2.0.0')).toBe('medium');
  });

  it('2 major 차이 → high', () => {
    expect(calcVersionRisk('1.0.0', '3.0.0')).toBe('high');
  });

  it('3+ major 차이 → critical', () => {
    expect(calcVersionRisk('1.0.0', '4.0.0')).toBe('critical');
    expect(calcVersionRisk('1.0.0', '10.0.0')).toBe('critical');
  });

  it('파싱 불가 버전 → low', () => {
    expect(calcVersionRisk('invalid', '1.0.0')).toBe('low');
    expect(calcVersionRisk('1.0.0', 'invalid')).toBe('low');
  });
});

describe('isOutdated', () => {
  it('현재가 낮으면 true', () => {
    expect(isOutdated('1.0.0', '2.0.0')).toBe(true);
  });

  it('현재가 같거나 높으면 false', () => {
    expect(isOutdated('2.0.0', '2.0.0')).toBe(false);
    expect(isOutdated('3.0.0', '2.0.0')).toBe(false);
  });

  it('파싱 불가 버전 → false', () => {
    expect(isOutdated('invalid', '1.0.0')).toBe(false);
  });
});
