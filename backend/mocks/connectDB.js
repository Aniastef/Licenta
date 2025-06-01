// backend/__mocks__/config/connectDB.js
// This mocks the connectDB module during tests

// Mock the connectDB function to do nothing or return a resolved promise
// when called in a test environment.
const connectDB = jest.fn(() => Promise.resolve());

// You might also want to mock other exports if connectDB.js has them
export default connectDB;