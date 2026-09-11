import { describe, expect, it } from 'vitest';
import { MOTOR_NAME } from './index.js';

describe('motor', () => {
  it('importa o nome do app do pacote shared', () => {
    expect(MOTOR_NAME).toBe('Motor LIFE');
  });
});
