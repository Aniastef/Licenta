import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';

// CORRECTED IMPORT PATHS for original components:
// ProductPage.jsx is in src/
import ProductPage from '../src/pages/ProductPage';
// CartContext.jsx is in src/components/
import { CartProvider, useCart } from '../src/components/CartContext';
import { RecoilRoot } from 'recoil';

// Mock the global fetch function
global.fetch = jest.fn();

// Mock useParams from react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    id: 'mockProductId123',
  }),
}));

// Mock useToast from Chakra UI
jest.mock('@chakra-ui/react', () => ({
  ...jest.requireActual('@chakra-ui/react'),
  useToast: () => jest.fn(), // Mock useToast to return a mockable function
}));

// MOCKING ProductCard:
// The path here MUST point to the ACTUAL ProductCard.jsx file: src/components/ProductCard.jsx
// From tests/ProductPage.test.jsx, the path to src/components/ProductCard.jsx is ../src/components/ProductCard
jest.mock('../src/components/ProductCard', () => ({ // <-- **THIS IS THE CRITICAL LINE**
  __esModule: true,
  // The 'default' export function inside this mock definition will act as the mock.
  // When this mock function requires actual modules (like CartContext), its paths
  // should be relative to the mock function's definition location, which is
  // currently *inside* the test file (tests/ProductPage.test.jsx).
  // So, to reach src/components/CartContext from tests/ProductPage.test.jsx, use ../src/components/CartContext.
  default: ({ product, ...props }) => {
    const { addToCart } = jest.requireActual('../src/components/CartContext').useCart();
    if (!product) return <div>Loading ProductCard...</div>;
    return (
      <div data-testid="mock-product-card">
        <h2 data-testid="product-name">{product.name}</h2>
        <p data-testid="product-price">{product.price} EUR</p>
        <button data-testid="add-to-cart-button" onClick={() => addToCart({ product, quantity: 1 })}>
          Add to Cart
        </button>
      </div>
    );
  },
}));

// MOCKING Recoil:
// The path here for 'recoil' refers to the npm package, so it's just 'recoil'.
// The mock for recoil.js you put in __mocks__/recoil.js will automatically be picked up
// because it's in the __mocks__ folder at the project root.
jest.mock('recoil', () => ({
  ...jest.requireActual('recoil'),
  useRecoilValue: jest.fn(() => ({ _id: 'mockUserId123' })),
  RecoilRoot: jest.fn(({ children }) => <div>{children}</div>),
}));


describe('ProductPage - Add to Cart functionality', () => {
  const mockProduct = {
    _id: 'mockProductId123',
    name: 'Test Artwork',
    price: 100,
    quantity: 5, // Important for stock check
    images: ['mock-image.jpg'],
    user: { firstName: 'Artist', lastName: 'Mock' },
  };

  beforeEach(() => {
    fetch.mockClear();
    jest.clearAllMocks(); // Clear all mocks, including any from ProductCard mock

    // Set up mock for product details fetch
    fetch.mockImplementation((url) => {
      if (url.includes(`/api/products/${mockProduct._id}`)) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ product: mockProduct }),
        });
      }
      // Set up mock for cart add-to-cart API call
      if (url.includes('/api/cart/add-to-cart')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            { product: mockProduct, quantity: 1, itemType: 'Product' } // Simulate cart with one item
          ]),
        });
      }
      // Default fallback for any other unhandled fetch calls
      return Promise.reject(new Error(`Unhandled fetch for URL: ${url}`));
    });

    // Set up mock for the initial cart fetch by CartProvider (should return empty)
    fetch.mockImplementationOnce((url) => {
      if (url.includes(`/api/cart/mockUserId123`)) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      }
      return Promise.reject(new Error(`Unhandled initial cart fetch for URL: ${url}`));
    });
  });

  const renderProductPage = () => {
    return render(
      <RecoilRoot>
        <ChakraProvider>
          <BrowserRouter>
            <CartProvider>
              <ProductPage />
            </CartProvider>
          </BrowserRouter>
        </ChakraProvider>
      </RecoilRoot>
    );
  };

  test('should display product details and allow adding to cart', async () => {
    renderProductPage();

    await waitFor(() => {
      expect(screen.getByTestId('product-name')).toHaveTextContent(mockProduct.name);
      expect(screen.getByTestId('product-price')).toHaveTextContent(`${mockProduct.price} EUR`);
    });

    const addToCartButton = screen.getByTestId('add-to-cart-button');
    expect(addToCartButton).toBeInTheDocument();

    fireEvent.click(addToCartButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/cart/add-to-cart',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            userId: 'mockUserId123',
            itemId: mockProduct._id,
            quantity: 1,
            itemType: 'Product',
          }),
        })
      );
    });
  });

  test('should not add to cart if product quantity is 0', async () => {
    const zeroStockProduct = { ...mockProduct, quantity: 0 };

    fetch.mockClear(); // Clear all mocks to set specific mocks for this test
    // Mock the product fetch to return the zero-stock product
    fetch.mockImplementation((url) => {
      if (url.includes(`/api/products/${zeroStockProduct._id}`)) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ product: zeroStockProduct }),
        });
      }
      // Also mock the initial cart fetch for CartProvider setup
      if (url.includes(`/api/cart/mockUserId123`)) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      }
      return Promise.reject(new Error(`Unhandled fetch for URL: ${url}`));
    });

    renderProductPage();

    await waitFor(() => {
      expect(screen.getByTestId('product-name')).toHaveTextContent(zeroStockProduct.name);
    });

    const addToCartButton = screen.getByTestId('add-to-cart-button');
    expect(addToCartButton).toBeInTheDocument();

    fireEvent.click(addToCartButton);

    await waitFor(() => {
      expect(fetch).not.toHaveBeenCalledWith(
        '/api/cart/add-to-cart',
        expect.any(Object)
      );
    }, { timeout: 100 });
  });
});