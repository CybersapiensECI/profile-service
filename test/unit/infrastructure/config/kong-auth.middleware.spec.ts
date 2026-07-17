import { createHmac } from 'crypto';
import { Request, Response } from 'express';
import { KongAuthMiddleware } from 'src/profile/infrastructure/config/kong-auth.middleware';

const TEST_SECRET = 'unit-test-secret-key';

function base64url(json: string): string {
  return Buffer.from(json, 'utf8').toString('base64url');
}

function sign(header: string, payload: string, secret: string): string {
  return createHmac('sha256', secret)
    .update(`${header}.${payload}`)
    .digest('base64url');
}

function makeToken(payloadJson: string, secret: string): string {
  const header = base64url('{"alg":"HS256"}');
  const payload = base64url(payloadJson);
  const signature = sign(header, payload, secret);
  return `${header}.${payload}.${signature}`;
}

function makeRequest(authHeader?: string): Request {
  return { headers: { authorization: authHeader } } as unknown as Request;
}

describe('KongAuthMiddleware', () => {
  let middleware: KongAuthMiddleware;
  let next: jest.Mock;
  const originalSecret = process.env['APP_JWT_SECRET'];

  beforeEach(() => {
    middleware = new KongAuthMiddleware();
    next = jest.fn();
    process.env['APP_JWT_SECRET'] = TEST_SECRET;
  });

  afterEach(() => {
    process.env['APP_JWT_SECRET'] = originalSecret;
  });

  it('does nothing when there is no Authorization header', () => {
    const req = makeRequest();
    middleware.use(req, {} as Response, next);

    expect(req['user']).toBeUndefined();
    expect(next).toHaveBeenCalled();
  });

  it('populates req.user for a token with a valid signature', () => {
    const token = makeToken(
      '{"sub":"user-1","role":"ADMIN"}',
      TEST_SECRET,
    );
    const req = makeRequest(`Bearer ${token}`);

    middleware.use(req, {} as Response, next);

    expect(req['user']).toEqual({ userId: 'user-1', roles: ['ROLE_ADMIN'] });
    expect(next).toHaveBeenCalled();
  });

  it('rejects a token signed with the wrong secret', () => {
    const token = makeToken('{"sub":"attacker","role":"ADMIN"}', 'wrong-secret');
    const req = makeRequest(`Bearer ${token}`);

    middleware.use(req, {} as Response, next);

    expect(req['user']).toBeUndefined();
    expect(next).toHaveBeenCalled();
  });

  it('rejects a forged token with an arbitrary signature segment', () => {
    const header = base64url('{"alg":"none"}');
    const payload = base64url('{"sub":"attacker","role":"ADMIN"}');
    const req = makeRequest(`Bearer ${header}.${payload}.forged-signature`);

    middleware.use(req, {} as Response, next);

    expect(req['user']).toBeUndefined();
    expect(next).toHaveBeenCalled();
  });

  it('rejects every token when APP_JWT_SECRET is not configured', () => {
    delete process.env['APP_JWT_SECRET'];
    const token = makeToken('{"sub":"user-1","role":"ADMIN"}', TEST_SECRET);
    const req = makeRequest(`Bearer ${token}`);

    middleware.use(req, {} as Response, next);

    expect(req['user']).toBeUndefined();
    expect(next).toHaveBeenCalled();
  });
});
