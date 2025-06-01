// backend/__mocks__/routes/auditRoutes.js
// This mocks the auditRoutes module during tests

// Express routers are functions. Jest will replace this with a mock function.
// For Supertest, it just needs something that doesn't crash immediately.
// We can provide a mock router that does nothing.
const express = require('express');
const router = express.Router();

// You can optionally mock the specific routes if you need to test their behavior later,
// but for now, just preventing the crash is enough.
// router.get('/logs', jest.fn()); // Example if you needed to test a specific route
// router.post('/some-other-route', jest.fn());

module.exports = router;