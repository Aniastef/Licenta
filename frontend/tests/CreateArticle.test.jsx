import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import CreateOrEditArticlePage from '../src/pages/CreateArticle';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: jest.fn(() => ({ id: undefined })),
}));

global.fetch = jest.fn();

jest.mock('@chakra-ui/react', () => ({
  ...jest.requireActual('@chakra-ui/react'),
  useToast: () => jest.fn(),
}));

jest.mock('react-quill-new', () => {
  const MockQuill = ({ value, onChange, ...props }) => (
    <textarea
      data-testid="article-content-editor"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      {...props}
    />
  );
  return MockQuill;
});

jest.mock('../src/components/GalleryImageCropModal', () => {
  const MockModal = ({ isOpen, onClose, onCropComplete }) => {
    if (!isOpen) return null;
    return (
      <div data-testid="mock-crop-modal">
        <button
          onClick={() => {
            onCropComplete('mock-cropped-image-url');
            onClose();
          }}
        >
          Simulate Crop
        </button>
        <button onClick={onClose}>Close Crop Modal</button>
      </div>
    );
  };
  return MockModal;
});

jest.mock('browser-image-compression', () => ({
  default: jest.fn((file) =>
    Promise.resolve(new File(['mock-compressed-data'], 'mock.jpg', { type: 'image/jpeg' })),
  ),
}));

const renderComponent = (params = { id: undefined }) => {
  jest.spyOn(require('react-router-dom'), 'useParams').mockReturnValue(params);
  return render(
    <ChakraProvider>
      <BrowserRouter>
        <CreateOrEditArticlePage />
      </BrowserRouter>
    </ChakraProvider>,
  );
};

describe('CreateOrEditArticlePage - Article Creation/Edit Scenarios', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch.mockReset();
    mockNavigate.mockReset();
    jest.spyOn(require('react-router-dom'), 'useParams').mockReturnValue({ id: undefined });
  });

  test('should render "Create new article" heading and input fields', () => {
    renderComponent();
    expect(screen.getByRole('heading', { name: /Create new article/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Article Title/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Subtitle/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /Category/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Cover image/i)).toBeInTheDocument();
    expect(screen.getByTestId('article-content-editor')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Publish Article/i })).toBeInTheDocument();
  });

  test('should show error toast if title or content is missing on Publish', async () => {
    const mockToast = jest.fn();
    jest.spyOn(require('@chakra-ui/react'), 'useToast').mockImplementation(() => mockToast);

    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: /Publish/i }));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Title and content are required.',
        status: 'error',
        duration: 3000,
      });
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('should show error toast if category is not selected on Publish', async () => {
    const mockToast = jest.fn();
    jest.spyOn(require('@chakra-ui/react'), 'useToast').mockImplementation(() => mockToast);

    renderComponent();

    fireEvent.change(screen.getByPlaceholderText(/Article Title/i), {
      target: { value: 'Test Title' },
    });
    fireEvent.change(screen.getByTestId('article-content-editor'), {
      target: { value: 'Test content' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Publish/i }));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Please select a category.',
        status: 'error',
        duration: 3000,
      });
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('should successfully publish an article with valid data', async () => {
    const mockToast = jest.fn();
    jest.spyOn(require('@chakra-ui/react'), 'useToast').mockImplementation(() => mockToast);

    global.fetch.mockImplementationOnce((url) => {
      if (url === '/api/articles') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ _id: 'new-article-id', title: 'Test Title' }),
        });
      }
      return Promise.reject(new Error(`Unhandled fetch for URL: ${url}`));
    });

    renderComponent();

    fireEvent.change(screen.getByPlaceholderText(/Article Title/i), {
      target: { value: 'My New Article' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Subtitle/i), {
      target: { value: 'A simple subtitle' },
    });
    fireEvent.change(screen.getByTestId('article-content-editor'), {
      target: { value: 'This is the article content.' },
    });
    fireEvent.change(screen.getByRole('combobox', { name: /Category/i }), {
      target: { value: 'Personal' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Publish/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/articles',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            title: 'My New Article',
            subtitle: 'A simple subtitle',
            content: 'This is the article content.',
            coverImage: '',
            category: 'Personal',
            draft: false,
          }),
        }),
      );
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Article created',
        description: 'Published successfully.',
        status: 'success',
        duration: 3000,
      });
      expect(mockNavigate).toHaveBeenCalledWith('/articles/new-article-id');
    });
  });

  test('should display spinner when loading existing article for edit', async () => {
    global.fetch.mockImplementationOnce(() => new Promise(() => {}));
    renderComponent({ id: 'existing-article-id' });

    await screen.findByText(/Loading.../i);
  });

  test('should open and close image crop modal', async () => {
    renderComponent();

    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
    const coverImageInput = screen.getByTestId('cover-image-input');
    fireEvent.change(coverImageInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByTestId('mock-crop-modal')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Simulate Crop'));

    await waitFor(() => {
      expect(screen.queryByTestId('mock-crop-modal')).not.toBeInTheDocument();
      expect(screen.getByAltText('Cover Preview')).toHaveAttribute('src', 'mock-cropped-image-url');
    });
  });
});
