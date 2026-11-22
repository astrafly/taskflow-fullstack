const { startDB, stopDB, registerUser, app, request } = require('./helpers');

beforeAll(startDB);
afterAll(stopDB);

const auth = (token) => ({ Authorization: `Bearer ${token}` });

describe('Tasks', () => {
  let alice;
  let bob;
  let admin;

  beforeAll(async () => {
    alice = await registerUser({ email: 'alice@test.com', name: 'Alice' });
    bob = await registerUser({ email: 'bob@test.com', name: 'Bob' });
    admin = await registerUser({ email: 'admin@test.com', name: 'Admin' });
    // Promote the admin directly in the DB (the API never allows this).
    const User = require('../src/models/User');
    await User.updateOne({ email: 'admin@test.com' }, { role: 'admin' });
  });

  let taskId;

  it('creates a task for the logged-in user', async () => {
    const res = await request(app)
      .post('/api/v1/tasks')
      .set(auth(alice.token))
      .send({ title: 'Write report', priority: 'high', status: 'todo' });
    expect(res.statusCode).toBe(201);
    expect(res.body.data.title).toBe('Write report');
    taskId = res.body.data._id;
  });

  it('rejects a task with no title', async () => {
    const res = await request(app).post('/api/v1/tasks').set(auth(alice.token)).send({ title: '' });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Validation failed');
  });

  it('lists only the caller tasks, with pagination', async () => {
    const res = await request(app).get('/api/v1/tasks?page=1&limit=10').set(auth(alice.token));
    expect(res.statusCode).toBe(200);
    expect(res.body.data.every((t) => t.createdBy._id === alice.user.id)).toBe(true);
    expect(res.body.pagination.total).toBeGreaterThanOrEqual(1);
  });

  it('filters by status', async () => {
    const res = await request(app).get('/api/v1/tasks?status=done').set(auth(alice.token));
    expect(res.statusCode).toBe(200);
    expect(res.body.data.every((t) => t.status === 'done')).toBe(true);
  });

  it('forbids reading another user task (403)', async () => {
    const res = await request(app).get(`/api/v1/tasks/${taskId}`).set(auth(bob.token));
    expect(res.statusCode).toBe(403);
  });

  it('forbids updating another user task (403)', async () => {
    const res = await request(app)
      .put(`/api/v1/tasks/${taskId}`)
      .set(auth(bob.token))
      .send({ title: 'Hacked' });
    expect(res.statusCode).toBe(403);
  });

  it('lets the owner update their task', async () => {
    const res = await request(app)
      .put(`/api/v1/tasks/${taskId}`)
      .set(auth(alice.token))
      .send({ status: 'done' });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.status).toBe('done');
  });

  it('lets an admin read any task', async () => {
    const res = await request(app).get(`/api/v1/tasks/${taskId}`).set(auth(admin.token));
    expect(res.statusCode).toBe(200);
  });

  it('returns 400 for a malformed task ID', async () => {
    const res = await request(app).get('/api/v1/tasks/not-an-id').set(auth(alice.token));
    expect(res.statusCode).toBe(400);
  });

  it('returns 404 for a task that does not exist', async () => {
    const res = await request(app).get('/api/v1/tasks/64b000000000000000000000').set(auth(alice.token));
    expect(res.statusCode).toBe(404);
  });

  it('returns dashboard stats', async () => {
    const res = await request(app).get('/api/v1/tasks/stats').set(auth(alice.token));
    expect(res.statusCode).toBe(200);
    expect(res.body.data.byStatus.done).toBeGreaterThanOrEqual(1);
  });

  it('lets the owner delete their task, then it is gone', async () => {
    const del = await request(app).delete(`/api/v1/tasks/${taskId}`).set(auth(alice.token));
    expect(del.statusCode).toBe(200);
    const get = await request(app).get(`/api/v1/tasks/${taskId}`).set(auth(alice.token));
    expect(get.statusCode).toBe(404);
  });

  it('blocks normal users from the admin user list (403)', async () => {
    const res = await request(app).get('/api/v1/users').set(auth(alice.token));
    expect(res.statusCode).toBe(403);
  });

  it('lets an admin list users', async () => {
    const res = await request(app).get('/api/v1/users').set(auth(admin.token));
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(3);
  });
});
