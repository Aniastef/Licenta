const request = require('supertest');
const app = require('../../app'); // Adjust path to your main Express app file
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Import your User model directly for test setup/teardown
const User = require('../../models/userModel').default || require('../../models/userModel');

// Mock external dependencies for signup process
jest.mock('../../utils/generateTokenAndSetCookie', () => jest.fn()); // Adjust path as needed
jest.mock('bcryptjs', () => ({
  ...jest.requireActual('bcryptjs'), // Keep original bcrypt functionality
  hash: jest.fn((password, salt) => Promise.resolve(`hashed_${password}`)), // Mock hash to return a predictable value
}));
jest.mock('cloudinary', () => ({
  v2: {
    uploader: {
      upload: jest.fn(() => Promise.resolve({ secure_url: 'http://mock-cloudinary.com/profile.jpg' })),
    },
  },
}));
jest.mock('../../controllers/auditLogController', () => ({ // Adjust path as needed
  addAuditLog: jest.fn(),
}));

// Set a mock admin secret for testing
process.env.ADMIN_SECRET = 'supersecretadmincode123';

let mongoServer;
let generateTokenAndSetCookie;
let addAuditLog;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  // Dynamically import the mocked functions after mocks are set up
  generateTokenAndSetCookie = require('../../utils/generateTokenAndSetCookie');
  addAuditLog = require('../../controllers/auditLogController').addAuditLog;
});

beforeEach(async () => {
  // Clear the database before each test
  await User.deleteMany({});
  jest.clearAllMocks(); // Clear all mock calls
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('POST /api/users/signup', () => {
  const validUserData = {
    firstName: 'Test',
    lastName: 'User',
    username: 'testuser',
    email: 'test@example.com',
    password: 'correctPassword1!',
    confirmPassword: 'correctPassword1!',
    // Optional fields
    gender: 'Male',
    pronouns: 'He/Him',
    address: '123 Test St',
    city: 'Testville',
    country: 'Testland',
    phone: '1234567890',
    bio: 'A test user.',
    profilePicture: 'data:image/jpeg;base64,mockbase64image',
  };

  it('should register a new user successfully with valid data and return 201', async () => {
    const res = await request(app)
      .post('/api/users/signup')
      .send(validUserData);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body).toHaveProperty('username', 'testuser');
    expect(res.body).toHaveProperty('email', 'test@example.com');
    expect(res.body).toHaveProperty('role', 'user'); // Should be 'user' for non-first user
    expect(generateTokenAndSetCookie).toHaveBeenCalledTimes(1);
    expect(addAuditLog).toHaveBeenCalledTimes(1);
    expect(addAuditLog).toHaveBeenCalledWith(expect.objectContaining({
      action: 'signup',
      details: 'New account created: testuser'
    }));

    // Verify user in DB
    const userInDb = await User.findById(res.body._id);
    expect(userInDb).not.toBeNull();
    expect(userInDb.username).toBe('testuser');
    expect(userInDb.password).toContain('hashed_'); // Check if password was hashed
    expect(userInDb.profilePicture).toBe('http://mock-cloudinary.com/profile.jpg');
  });

  it('should assign "admin" role if it is the first user registered', async () => {
    // No users in DB initially due to beforeEach cleanup
    const res = await request(app)
      .post('/api/users/signup')
      .send(validUserData); // This user should become admin

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('role', 'admin');
  });

  it('should allow admin registration with correct admin code when not the first user', async () => {
    // Register a regular user first
    await request(app).post('/api/users/signup').send({ ...validUserData, username: 'firstregularuser', email: 'first@example.com' });

    // Register a second user as admin with the code
    const res = await request(app)
      .post('/api/users/signup')
      .send({
        ...validUserData,
        username: 'adminuser',
        email: 'admin@example.com',
        role: 'admin',
        adminCode: process.env.ADMIN_SECRET,
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('role', 'admin');
    expect(generateTokenAndSetCookie).toHaveBeenCalledTimes(1);
    expect(addAuditLog).toHaveBeenCalledTimes(1); // One for regular, one for admin signup
  });

  it('should return 403 if admin registration attempted with incorrect admin code', async () => {
    // Register a regular user first to ensure it's not the first user scenario
    await request(app).post('/api/users/signup').send({ ...validUserData, username: 'anotherregularuser', email: 'another@example.com' });

    const res = await request(app)
      .post('/api/users/signup')
      .send({
        ...validUserData,
        username: 'fakeadmin',
        email: 'fake@example.com',
        role: 'admin',
        adminCode: 'wrongcode',
      });

    expect(res.statusCode).toEqual(403);
    expect(res.body).toHaveProperty('error', 'Invalid admin access code');
    expect(generateTokenAndSetCookie).not.toHaveBeenCalled();
    expect(addAuditLog).toHaveBeenCalledTimes(1); // Only for the first regular user
  });

  it('should return 400 if passwords do not match', async () => {
    const res = await request(app)
      .post('/api/users/signup')
      .send({ ...validUserData, confirmPassword: 'wrongPassword' });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error', 'Passwords do not match');
    expect(generateTokenAndSetCookie).not.toHaveBeenCalled();
    expect(addAuditLog).not.toHaveBeenCalled();
  });

  it('should return 400 if username already exists', async () => {
    // First signup to create the user
    await request(app).post('/api/users/signup').send(validUserData);

    // Second signup attempt with the same username
    const res = await request(app)
      .post('/api/users/signup')
      .send({ ...validUserData, email: 'different@example.com' }); // Ensure email is different to isolate username check

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error', 'User already exists');
    expect(generateTokenAndSetCookie).not.toHaveBeenCalled();
    expect(addAuditLog).toHaveBeenCalledTimes(1); // Only for the first successful signup
  });

  it('should return 400 if email already exists', async () => {
    // First signup to create the user
    await request(app).post('/api/users/signup').send(validUserData);

    // Second signup attempt with the same email
    const res = await request(app)
      .post('/api/users/signup')
      .send({ ...validUserData, username: 'anotheruser' }); // Ensure username is different to isolate email check

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error', 'User already exists');
    expect(generateTokenAndSetCookie).not.toHaveBeenCalled();
    expect(addAuditLog).toHaveBeenCalledTimes(1); // Only for the first successful signup
  });

  it('should return 500 on internal server error during user creation', async () => {
    // Force an error during user save
    jest.spyOn(User.prototype, 'save').mockImplementationOnce(() => {
      throw new Error('Forced database write error');
    });

    const res = await request(app)
      .post('/api/users/signup')
      .send(validUserData);

    expect(res.statusCode).toEqual(500);
    expect(res.body).toHaveProperty('message', 'Forced database write error');
    expect(generateTokenAndSetCookie).not.toHaveBeenCalled();
    expect(addAuditLog).not.toHaveBeenCalled();

    // Restore original save function after this test
    jest.restoreAllMocks();
  });
});