// backend/tests/login.test.js

// Core testing and server libraries
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const bcrypt = require('bcryptjs');

// Import your User model directly for test setup/teardown
const User = require('../models/userModel').default || require('../models/userModel');

// 🔑🔑🔑 MOCKS FOR EXTERNAL LIBRARIES AND YOUR CUSTOM MODULES 🔑🔑🔑
jest.mock('stripe');
jest.mock('dotenv');
jest.mock('../config/connectDB');

// MOCK FOR generateTokenAndSetCookie:
// This mock ensures that generateTokenAndSetCookie is a Jest mock function.
// The actual cookie setting will be asserted via the 'mockResCookie' spy on res.cookie.
jest.mock('../utils/generateTokenAndSetCookie', () =>
  jest.fn((userId, res) => {
    // Although we are spying on res.cookie, for some versions/configurations,
    // the mock here might need to call res.cookie to ensure it's recorded correctly.
    // We'll simplify this to just call res.cookie as if it were the real function,
    // trusting the spy on `express.response.cookie` to capture it.
    // The important part is that `res.cookie` is invoked.
    res.cookie('jwt', 'dummy_token', {
      maxAge: 1,
      httpOnly: true,
      sameSite: 'strict',
      secure: false,
    });
  }),
);

// Mock other route files
jest.mock('../routes/productRoutes', () => require('express').Router());
jest.mock('../routes/commentRoutes', () => require('express').Router());
jest.mock('../routes/eventRoutes', () => require('express').Router());
jest.mock('../routes/galleryRoutes', () => require('express').Router());
jest.mock('../routes/messageRoutes', () => require('express').Router());
jest.mock('../routes/paymentRoutes', () => require('express').Router());
jest.mock('../routes/cartRoutes', () => require('express').Router());
jest.mock('../routes/orderRoutes', () => require('express').Router());
jest.mock('../routes/adminRoutes', () => require('express').Router());
jest.mock('../routes/auditRoutes', () => require('express').Router());
jest.mock('../routes/reviewRoutes', () => require('express').Router());
jest.mock('../routes/notificationRoutes', () => require('express').Router());
jest.mock('../routes/articleRoutes', () => require('express').Router());
jest.mock('../routes/searchRoutes', () => require('express').Router());
jest.mock('../routes/reportRoutes', () => require('express').Router());

// backend/tests/login.test.js

// ... (existing imports and other mocks at the top)

// 💥💥💥 CORRECTED MOCK FOR generateTokenAndSetCookie (VERY SIMPLE) 💥💥💥
jest.mock('../utils/generateTokenAndSetCookie', () => jest.fn()); // Just a plain mock function

// ... (rest of your other mocks)

let app;
let mongoServer;
let generateTokenAndSetCookie;
let mockResCookie; // Declare a variable to hold the spy for res.cookie

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  // Get a reference to the mocked generateTokenAndSetCookie function (this will be the plain jest.fn())
  generateTokenAndSetCookie = require('../utils/generateTokenAndSetCookie');

  const serverModule = await import('../server.js');
  app = serverModule.default;
});

let testUser;

beforeEach(async () => {
  await User.deleteMany({});
  jest.clearAllMocks(); // Crucial to clear mocks/spies from previous tests

  const hashedPassword = await bcrypt.hash('correctPassword1!', 10);
  testUser = await User.create({
    firstName: 'Login',
    lastName: 'User',
    username: 'loginuser',
    email: 'login@example.com',
    password: hashedPassword,
    profilePicture: 'http://example.com/login_pic.jpg',
    isBlocked: false,
  });

  jest.spyOn(bcrypt, 'compare').mockImplementation(async (password, hashedPasswordFromDb) => {
    return password === 'correctPassword1!' && hashedPasswordFromDb === hashedPassword;
  });

  // 🔑🔑🔑 IMPORTANT: SPY ON res.cookie method, AND MAKE IT MOCK IMPLEMENTATION DO THE WORK 🔑🔑🔑
  // We mock this to capture the call, but *also* to simulate what the real res.cookie does
  // for Supertest's header tracking.
  mockResCookie = jest
    .spyOn(require('express').response, 'cookie')
    .mockImplementation((name, value, options) => {
      // This part simulates the header setting. Supertest will then pick this up.
      if (!this.headers) {
        // 'this' refers to the response object in the context of Express's response.cookie
        this.headers = {};
      }
      if (!this.headers['set-cookie']) {
        this.headers['set-cookie'] = [];
      }
      // Very basic cookie string for testing. A real cookie string is more complex.
      this.headers['set-cookie'].push(`${name}=${value}; Path=/`);
    });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('POST /api/users/login', () => {
  it('should log in a user successfully with correct credentials and return 200', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({ username: 'loginuser', password: 'correctPassword1!' });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('_id', testUser._id.toString());
    expect(res.body).toHaveProperty('username', 'loginuser');
    expect(res.body).toHaveProperty('email', 'login@example.com');

    // Verify that generateTokenAndSetCookie was called
    // (This now refers to the simple jest.fn() mock)
    expect(generateTokenAndSetCookie).toHaveBeenCalledTimes(1);
    expect(generateTokenAndSetCookie).toHaveBeenCalledWith(
      expect.any(mongoose.Types.ObjectId),
      expect.anything(),
    );

    expect(mockResCookie).toHaveBeenCalledTimes(1);
    expect(mockResCookie).toHaveBeenCalledWith(
      'jwt',
      expect.any(String),
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'strict',
        maxAge: expect.any(Number),
        secure: expect.any(Boolean),
      }),
    );
    expect(res.headers['set-cookie']).toBeDefined();
    expect(res.headers['set-cookie'][0]).toContain('jwt=');
  });

  // ... (rest of your tests remain the same, ensure mockResCookie.not.toHaveBeenCalled() is used)
  it('should return 400 for invalid username', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({ username: 'nonexistentuser', password: 'correctPassword1!' });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error', 'Invalid username or password');
    expect(generateTokenAndSetCookie).not.toHaveBeenCalled();
    expect(mockResCookie).not.toHaveBeenCalled();
  });

  it('should return 400 for incorrect password', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({ username: 'loginuser', password: 'wrongPassword!' });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error', 'Invalid username or password');
    expect(generateTokenAndSetCookie).not.toHaveBeenCalled();
    expect(mockResCookie).not.toHaveBeenCalled();
  });

  it('should return 403 if user account is blocked', async () => {
    await User.findByIdAndUpdate(testUser._id, { isBlocked: true });

    const res = await request(app)
      .post('/api/users/login')
      .send({ username: 'loginuser', password: 'correctPassword1!' });

    expect(res.statusCode).toEqual(403);
    expect(res.body).toHaveProperty(
      'error',
      'Your account has been blocked. Contact support for assistance.',
    );
    expect(generateTokenAndSetCookie).not.toHaveBeenCalled();
    expect(mockResCookie).not.toHaveBeenCalled();
  });

  it('should return 500 on internal server error during user lookup', async () => {
    jest.spyOn(User, 'findOne').mockImplementationOnce(() => {
      throw new Error('Forced database read error');
    });

    const res = await request(app)
      .post('/api/users/login')
      .send({ username: 'loginuser', password: 'correctPassword1!' });

    expect(res.statusCode).toEqual(500);
    expect(res.body).toHaveProperty('error', 'Forced database read error');
    expect(generateTokenAndSetCookie).not.toHaveBeenCalled();
    expect(mockResCookie).not.toHaveBeenCalled();

    jest.restoreAllMocks();
  });
});
