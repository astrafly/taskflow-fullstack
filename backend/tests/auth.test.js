const { startDB, stopDB, registerUser, app, request } = require('./helpers');
const User = require('../src/models/User');

beforeAll(startDB);
afterAll(stopDB);

describe('Auth', () => {
  it('registers a user and returns a token without a password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Ada', email: 'ada@test.com', password: 'Password123' });
    expect(res.statusCode).toBe(201);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.role).toBe('user');
    expect(res.body.data.user.password).toBeUndefined();
  });

  it('never lets the client set role during registration', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Eve', email: 'eve@test.com', password: 'Password123', role: 'admin' });
    expect(res.body.data.user.role).toBe('user');
  });

  it('rejects a duplicate email with 409', async () => {
    await registerUser({ email: 'dup@test.com' });
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Dup', email: 'dup@test.com', password: 'Password123' });
    expect(res.statusCode).toBe(409);
  });

  it('validates input and returns field errors', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({ name: 'A', email: 'bad', password: '123' });
    expect(res.statusCode).toBe(400);
    expect(res.body.errors.length).toBeGreaterThanOrEqual(3);
  });

  it('stores the password hashed, not in plain text', async () => {
    await registerUser({ email: 'hash@test.com' });
    const stored = await User.findOne({ email: 'hash@test.com' }).select('+password');
    expect(stored.password).not.toBe('Password123');
    expect(stored.password.startsWith('$2')).toBe(true);
  });

  it('logs in with correct credentials', async () => {
    await registerUser({ email: 'login@test.com' });
    const res = await request(app).post('/api/v1/auth/login').send({ email: 'login@test.com', password: 'Password123' });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.token).toBeDefined();
  });

  it('rejects a wrong password with 401', async () => {
    await registerUser({ email: 'wrong@test.com' });
    const res = await request(app).post('/api/v1/auth/login').send({ email: 'wrong@test.com', password: 'nope-nope' });
    expect(res.statusCode).toBe(401);
  });

  it('blocks private routes without a token', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.statusCode).toBe(401);
  });

  it('returns the current user with a valid token', async () => {
    const { token } = await registerUser({ email: 'me@test.com' });
    const res = await request(app).get('/api/v1/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.email).toBe('me@test.com');
  });
});
