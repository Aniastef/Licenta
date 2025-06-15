import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';

import ProductPage from '../src/pages/ProductPage';
import { CartProvider, useCart } from '../src/components/CartContext';
import { RecoilRoot } from 'recoil';

global.fetch = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    id: 'mockProductId123',
  }),
}));

jest.mock('@chakra-ui/react', () => ({
  ...jest.requireActual('@chakra-ui/react'),
  useToast: () => jest.fn(), 
}));

jest.mock('../src/components/ProductCard', () => ({
  __esModule: true,
  default: ({ product, ...props }) => {
    const { addToCart } = jest.requireActual('../src/components/CartContext').useCart();
    if (!product) return <div>Loading ProductCard...</div>;
    return (
      <div data-testid="mock-product-card">
        <h2 data-testid="product-name">{product.name}</h2>
        <p data-testid="product-price">{product.price} EUR</p>
        <button
          data-testid="add-to-cart-button"
          onClick={() => addToCart({ product, quantity: 1 })}
        >
          Add to Cart
        </button>
      </div>
    );
  },
}));

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
    quantity: 5, 
    images: ['mock-image.jpg'],
    user: { firstName: 'Artist', lastName: 'Mock' },
  };

  beforeEach(() => {
    fetch.mockClear();
    jest.clearAllMocks(); 

    fetch.mockImplementation((url) => {
      if (url.includes(`/api/products/${mockProduct._id}`)) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ product: mockProduct }),
        });
      }
      if (url.includes('/api/cart/add-to-cart')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              { product: mockProduct, quantity: 1, itemType: 'Product' },
            ]),
        });
      }
      return Promise.reject(new Error(`Unhandled fetch for URL: ${url}`));
    });

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
      </RecoilRoot>,
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
        }),
      );
    });
  });

  test('should not add to cart if product quantity is 0', async () => {
    const zeroStockProduct = { ...mockProduct, quantity: 0 };

    fetch.mockClear();
    fetch.mockImplementation((url) => {
      if (url.includes(`/api/products/${zeroStockProduct._id}`)) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ product: zeroStockProduct }),
        });
      }
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

    await waitFor(
      () => {
        expect(fetch).not.toHaveBeenCalledWith('/api/cart/add-to-cart', expect.any(Object));
      },
      { timeout: 100 },
    );
  });
});
