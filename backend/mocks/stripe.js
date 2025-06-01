// backend/__mocks__/stripe.js
// This mocks the 'stripe' npm package for tests

// Mock the Stripe constructor
const mockStripe = jest.fn(() => ({
  // Mock any methods your code calls on the Stripe instance, e.g.,
  checkout: {
    sessions: {
      create: jest.fn(() => ({ id: 'mock_session_id', url: 'http://mock.stripe.com/checkout' })),
    },
  },
  // Add other Stripe API methods your application uses if needed
}));

// If Stripe is typically imported as `import Stripe from 'stripe';`
// then it's a default export.
module.exports = mockStripe;
// If it's imported as `import * as Stripe from 'stripe';` or `const Stripe = require('stripe');`
// you might need `module.exports = { default: mockStripe };` or similar.
// For `const Stripe = require('stripe');`, `module.exports = mockStripe;` should work fine.