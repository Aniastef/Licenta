const request = require('supertest');
const app = require('../../app'); // Adjust path to your main Express app file

// Mock the generateTokenAndSetCookie for other tests if needed, but not directly used in logout.
jest.mock('../../utils/generateTokenAndSetCookie', () => jest.fn());

describe('POST /api/users/logout', () => {
  it('should log out a user successfully and clear the cookie', async () => {
    const res = await request(app)
      .post('/api/users/logout'); // Assuming your logout route is /api/users/logout

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'User logged out successfully');

    // Check if the cookie is cleared. Supertest can inspect set-cookie headers.
    // The `maxAge: 1` on the cookie should result in an `Expires` date in the past.
    expect(res.headers['set-cookie']).toEqual(
      expect.arrayContaining([
        // The exact date might vary slightly, but the key parts are the empty value and past expiration
        expect.stringContaining('jwt=; Path=/; Expires=')
      ])
    );
    // You can also check if the expiration date is truly in the past
    const cookieHeader = res.headers['set-cookie'].find(c => c.startsWith('jwt='));
    const expiresMatch = cookieHeader.match(/Expires=([^;]+)/);
    if (expiresMatch && expiresMatch[1]) {
      const expiryDate = new Date(expiresMatch[1]);
      // Compare against current time, allowing for a small buffer
      expect(expiryDate.getTime()).toBeLessThan(Date.now() + 1000); // 1-second buffer
    }
  });

  it('should return 500 on internal server error (e.g., failed to set cookie)', async () => {
    // Temporarily mock res.cookie to throw an error for this test
    // This mocks the `cookie` method on the Express response object prototype
    jest.spyOn(require('express').response, 'cookie').mockImplementationOnce(() => {
      throw new Error('Simulated cookie setting error');
    });

    const res = await request(app)
      .post('/api/users/logout');

    expect(res.statusCode).toEqual(500);
    expect(res.body).toHaveProperty('error', 'Simulated cookie setting error');

    // Restore the original cookie method after this test
    jest.restoreAllMocks();
  });
});