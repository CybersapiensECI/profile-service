import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { InternalServiceGuard } from '../../../src/profile/entrypoints/rest/guard/internal-service.guard';

/**
 * Contract with matching-service: internal routes are reachable only with a
 * matching X-Internal-Key header. A regression here surfaces in production as
 * "Profile service unavailable: [403 Forbidden]" on the matching screen.
 */
describe('InternalServiceGuard', () => {
  const guard = new InternalServiceGuard();
  const originalEnv = process.env;

  const contextWithHeaders = (headers: Record<string, string>) =>
    ({
      switchToHttp: () => ({ getRequest: () => ({ headers }) }),
    }) as unknown as ExecutionContext;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('allows any request outside production', () => {
    process.env['NODE_ENV'] = 'development';
    delete process.env['INTERNAL_API_KEY'];

    expect(guard.canActivate(contextWithHeaders({}))).toBe(true);
  });

  it('denies every request when INTERNAL_API_KEY is unset in production', () => {
    process.env['NODE_ENV'] = 'production';
    delete process.env['INTERNAL_API_KEY'];

    expect(() =>
      guard.canActivate(contextWithHeaders({ 'x-internal-key': 'anything' })),
    ).toThrow(ForbiddenException);
  });

  it('denies requests whose key does not match', () => {
    process.env['NODE_ENV'] = 'production';
    process.env['INTERNAL_API_KEY'] = 'expected-key';

    expect(() =>
      guard.canActivate(contextWithHeaders({ 'x-internal-key': 'wrong-key' })),
    ).toThrow(ForbiddenException);
  });

  it('denies requests with no key header at all', () => {
    process.env['NODE_ENV'] = 'production';
    process.env['INTERNAL_API_KEY'] = 'expected-key';

    expect(() => guard.canActivate(contextWithHeaders({}))).toThrow(
      ForbiddenException,
    );
  });

  it('allows requests carrying the matching key', () => {
    process.env['NODE_ENV'] = 'production';
    process.env['INTERNAL_API_KEY'] = 'expected-key';

    expect(
      guard.canActivate(contextWithHeaders({ 'x-internal-key': 'expected-key' })),
    ).toBe(true);
  });
});
