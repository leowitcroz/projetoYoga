import { describe, expect, it } from 'vitest';
import { APP_NAME } from './index.js';

describe('shared', () => {
  it('exporta o nome do app', () => {
    expect(APP_NAME).toBe('LIFE');
  });
});
