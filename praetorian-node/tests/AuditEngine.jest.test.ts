import { AuditEngine } from '../src/core/AuditEngine';

describe('AuditEngine', () => {
  let auditEngine: AuditEngine;
  let context: any;

  beforeEach(() => {
    auditEngine = new AuditEngine();
    context = {
      config: { foo: 'bar' },
      environment: 'test',
      project: 'demo',
      timestamp: new Date(),
      metadata: {},
    };
  });

  it('should run a security audit and return a result', async () => {
    const result = await auditEngine.audit(context, { type: 'security' });
    expect(result).toHaveProperty('summary');
    expect(result).toHaveProperty('results');
    expect(result).toHaveProperty('score');
    expect(result).toHaveProperty('grade');
  });

  it('should handle invalid context gracefully', async () => {
    await expect(auditEngine.audit(null as any)).rejects.toThrow();
  });
});