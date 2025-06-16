import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { RecoilRoot, useSetRecoilState } from 'recoil';
import SignupCard from '../src/components/SignupCard';
import authAtom from '../src/atoms/authAtom';
import userAtom from '../src/atoms/userAtom';
import useShowToast from '../src/hooks/useShowToast';

global.fetch = jest.fn();

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../src/hooks/useShowToast', () => jest.fn(() => jest.fn()));

jest.mock('recoil', () => ({
  ...jest.requireActual('recoil'),
  useSetRecoilState: jest.fn(),
  RecoilRoot: jest.fn(({ children }) => <div>{children}</div>),
}));

jest.mock('../src/assets/p1.jpg', () => 'mock-image.jpg');
jest.mock('../src/assets/p2.jpg', () => 'mock-image.jpg');
jest.mock('../src/assets/p3.jpg', () => 'mock-image.jpg');
jest.mock('../src/assets/p4.jpg', () => 'mock-image.jpg');
jest.mock('../src/assets/p5.jpg', () => 'mock-image.jpg');
jest.mock('../src/assets/p6.jpg', () => 'mock-image.jpg');
jest.mock('../src/assets/p7.jpg', () => 'mock-image.jpg');
jest.mock('../src/assets/p8.jpg', () => 'mock-image.jpg');

describe('SignupCard', () => {
  const mockSetAuthScreen = jest.fn();
  const mockSetUser = jest.fn();
  const mockShowToast = jest.fn();

  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch.mockClear();

    mockSetAuthScreen.mockClear();
    mockSetUser.mockClear();
    mockShowToast.mockClear();
    mockNavigate.mockClear();

    window.localStorage.clear();

    window.localStorage.setItem.mockClear();
    window.localStorage.getItem.mockClear();
    window.localStorage.removeItem.mockClear();
    window.localStorage.clear.mockClear();

    useSetRecoilState.mockImplementation((atom) => {
      if (atom === authAtom) return mockSetAuthScreen;
      if (atom === userAtom) return mockSetUser;
      return jest.fn();
    });
    useShowToast.mockImplementation(() => mockShowToast);

    global.fetch.mockImplementation((url) => {
      if (url.includes('api.cloudinary.com')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ secure_url: 'http://mock-cloudinary.com/image.jpg' }),
        });
      }
      return Promise.reject(new Error(`Unhandled fetch for URL: ${url}`));
    });
  });

  const renderSignupCard = () => {
    let renderResult;
    act(() => {
      renderResult = render(
        <RecoilRoot>
          <ChakraProvider>
            <BrowserRouter>
              <SignupCard />
            </BrowserRouter>
          </ChakraProvider>
        </RecoilRoot>,
      );
    });

    act(() => {
      jest.runAllTimers();
    });
    return renderResult;
  };

  const fillRequiredFields = (customInputs = {}) => {
    fireEvent.change(screen.getByLabelText(/First name/i), {
      target: { value: customInputs.firstName || 'Test' },
    });
    fireEvent.change(screen.getByLabelText(/Last name/i), {
      target: { value: customInputs.lastName || 'User' },
    });
    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { value: customInputs.username || 'testuser' },
    });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: customInputs.email || 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^Password/i), {
      target: { value: customInputs.password || 'Password123!' },
    });
    fireEvent.change(screen.getByLabelText(/Confirm password/i), {
      target: { value: customInputs.confirmPassword || 'Password123!' },
    });
    fireEvent.click(screen.getByLabelText(/I agree to the terms and conditions/i));
  };

  test('should render all main signup fields', () => {
    renderSignupCard();
    expect(screen.getByLabelText(/First name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign up/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
  });

  test('should show password toggle buttons', () => {
    renderSignupCard();
    const passwordInput = screen.getByLabelText(/^Password/i);
    const confirmPasswordInput = screen.getByLabelText(/Confirm password/i);

    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');

    const showButtons = screen.getAllByRole('button', { name: /show/i });
    expect(showButtons.length).toBe(2);

    fireEvent.click(showButtons[0]);
    expect(passwordInput).toHaveAttribute('type', 'text');
    fireEvent.click(showButtons[1]);
    expect(confirmPasswordInput).toHaveAttribute('type', 'text');
  });

  test('should display validation errors for empty required fields on signup attempt', async () => {
    renderSignupCard();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Sign up/i }));
    });

    await waitFor(() => {
      expect(screen.getByText(/First name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Last name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Username is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Password is required/i)).toBeInTheDocument();
      expect(screen.getByText(/You must agree to the terms and conditions/i)).toBeInTheDocument();
      expect(mockShowToast).toHaveBeenCalledWith(
        'Error',
        'Please complete the required fields.',
        'error',
      );
    });
  });

  test('should display validation errors for invalid email format', async () => {
    renderSignupCard();
    fillRequiredFields({ email: 'invalid-email' });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Sign up/i }));
    });

    await waitFor(() => {
      expect(screen.getByText(/Invalid email format/i)).toBeInTheDocument();
    });
  });

  test('should display at least one validation error for weak password', async () => {
    renderSignupCard();
    fillRequiredFields({ password: 'short', confirmPassword: 'short' });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Sign up/i }));
    });

    await waitFor(async () => {
      await screen.findByText(/Password must be at least 6 characters/i);
    });
  });

  test('should display validation error if passwords do not match', async () => {
    renderSignupCard();
    fillRequiredFields({ password: 'Password123!', confirmPassword: 'Password123' });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Sign up/i }));
    });

    await waitFor(() => {
      expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
    });
  });

  test('should successfully sign up with valid credentials', async () => {
    renderSignupCard();
    fillRequiredFields();

    global.fetch.mockImplementationOnce((url) => {
      if (url.includes('/api/users/signup')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({ _id: 'user123', username: 'testuser', token: 'mock-token' }),
        });
      }
      return Promise.reject(new Error(`Unhandled fetch for URL: ${url}`));
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Sign up/i }));
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/users/signup',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: expect.stringContaining('"firstName":"Test"'),
        }),
      );
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        'art-corner',
        JSON.stringify({ _id: 'user123', username: 'testuser', token: 'mock-token' }),
      );
      expect(mockSetUser).toHaveBeenCalledWith({
        _id: 'user123',
        username: 'testuser',
        token: 'mock-token',
      });
      expect(mockSetAuthScreen).toHaveBeenCalledWith('login');
      expect(mockShowToast).toHaveBeenCalledWith(
        'Success',
        'User signed up successfully',
        'success',
      );
    });
  });

  test('should show error toast on signup failure from API', async () => {
    renderSignupCard();
    fillRequiredFields();

    global.fetch.mockImplementationOnce((url) => {
      if (url.includes('/api/users/signup')) {
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ error: 'Username already taken' }),
        });
      }
      return Promise.reject(new Error(`Unhandled fetch for URL: ${url}`));
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Sign up/i }));
    });

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith('Error', 'Username already taken', 'error');
      expect(mockSetUser).not.toHaveBeenCalled();
    });
  });

  test('should show error toast on network error during signup', async () => {
    renderSignupCard();
    fillRequiredFields();

    global.fetch.mockImplementationOnce(() => {
      return Promise.reject(new Error('Network error'));
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Sign up/i }));
    });

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(
        'Error',
        'Something went wrong. Please try again.',
        'error',
      );
      expect(mockSetUser).not.toHaveBeenCalled();
    });
  });

  test('should navigate to login screen on "Login" button click', async () => {
    renderSignupCard();
    const loginButton = screen.getByRole('button', { name: 'Login' });

    await act(async () => {
      fireEvent.click(loginButton);
    });

    expect(mockSetAuthScreen).toHaveBeenCalledWith('login');
  });
});
