import { Validator } from '../src/core/Validator';

describe('Validator', () => {
  let validator: Validator;

  beforeEach(() => {
    validator = new Validator();
  });

  it('should validate a minimal valid config', async () => {
    const context = {
      config: { foo: 'bar' },
      environment: 'test',
      project: 'demo',
      timestamp: new Date(),
      metadata: {},
    };
    const result = await validator.validate({ foo: 'bar' }, context);
    expect(result.success).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should throw if config is null', async () => {
    const context = {
      config: {},
      environment: 'test',
      project: 'demo',
      timestamp: new Date(),
      metadata: {},
    };
    await expect(validator.validate(null as any, context)).rejects.toThrow();
  });
});