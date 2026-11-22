process.env.NODE_ENV = 'test';
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../src/app');

// Starts an in-memory MongoDB so tests never touch your real database.
let mongod;

async function startDB() {
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret_value_for_jest';
  process.env.NODE_ENV = 'test';
  // Option 1: use a test database you run yourself (local MongoDB or Atlas).
  if (process.env.MONGO_URI_TEST) {
    await mongoose.connect(process.env.MONGO_URI_TEST);
    return;
  }
  // Option 2: spin up a temporary in-memory MongoDB (downloads a binary once).
  mongod = await MongoMemoryServer.create({
    binary: { version: process.env.MONGOMS_VERSION || '7.0.14' },
  });
  await mongoose.connect(mongod.getUri());
}

async function stopDB() {
  // Only ever drop the test database, never the one from MONGO_URI.
  if (mongoose.connection.readyState === 1) await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
}

// Registers a user and returns { token, user }.
async function registerUser(overrides = {}) {
  const payload = {
    name: 'Test User',
    email: `user${Math.random().toString(36).slice(2, 8)}@test.com`,
    password: 'Password123',
    ...overrides,
  };
  const res = await request(app).post('/api/v1/auth/register').send(payload);
  return { ...res.body.data, password: payload.password, status: res.statusCode };
}

module.exports = { startDB, stopDB, registerUser, app, request };
