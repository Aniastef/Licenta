import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import CreateOrEditArticlePage from '../src/pages/CreateArticle'; // Adjusted path

// --- GLOBAL MOCKS (apply to all tests) ---
// Mock-uiește hook-ul useNavigate din react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  // Default useParams for CREATE scenario. Will be overridden by spyOn in specific tests.
  useParams: jest.fn(() => ({ id: undefined })),
}));

// Mock-uiește global.fetch
global.fetch = jest.fn();

// Mock-uiește useToast de la Chakra UI
jest.mock('@chakra-ui/react', () => ({
  ...jest.requireActual('@chakra-ui/react'),
  useToast: () => jest.fn(), // Returnează o funcție goală pentru toast
}));

// Mock-uiește componenta ReactQuill pentru a evita erori de mediu de test
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

// Mock-uiește componenta GalleryImageCropModal
jest.mock('../src/components/GalleryImageCropModal', () => { // Adjusted path based on your project structure
  const MockModal = ({ isOpen, onClose, onCropComplete }) => {
    if (!isOpen) return null;
    return (
      <div data-testid="mock-crop-modal">
        {/* Simulate cropping and closing when a button is clicked within the modal */}
        <button onClick={() => { onCropComplete('mock-cropped-image-url'); onClose(); }}>Simulate Crop</button>
        <button onClick={onClose}>Close Crop Modal</button>
      </div>
    );
  };
  return MockModal;
});

// Mock-uiește browser-image-compression
jest.mock('browser-image-compression', () => ({
  default: jest.fn((file) => Promise.resolve(new File(['mock-compressed-data'], 'mock.jpg', { type: 'image/jpeg' }))),
}));

// Helper function moved to outer scope for better access
const renderComponent = (params = { id: undefined }) => {
  // Use spyOn to temporarily override useParams for the current render/test
  jest.spyOn(require('react-router-dom'), 'useParams').mockReturnValue(params);
  return render(
    <ChakraProvider>
      <BrowserRouter>
        <CreateOrEditArticlePage />
      </BrowserRouter>
    </ChakraProvider>
  );
};

describe('CreateOrEditArticlePage - Article Creation/Edit Scenarios', () => {
  beforeEach(() => {
    // Clear mocks before each test to ensure a clean slate
    jest.clearAllMocks(); // Clears all mock functions including global.fetch and mockNavigate
    global.fetch.mockReset(); // Important: Resets mockImplementation calls
    mockNavigate.mockReset();
    // Reset the useParams mock for each test to its default or initial state
    jest.spyOn(require('react-router-dom'), 'useParams').mockReturnValue({ id: undefined });
  });

  // --- Test 1: Render initial fields ---
  test('should render "Create new article" heading and input fields', () => {
    renderComponent();
    expect(screen.getByRole('heading', { name: /Create new article/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Article Title/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Subtitle/i)).toBeInTheDocument();
    // Targeting the Chakra UI Select component by its role 'combobox' and its associated label "Category"
    expect(screen.getByRole('combobox', { name: /Category/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Cover image/i)).toBeInTheDocument();
    expect(screen.getByTestId('article-content-editor')).toBeInTheDocument(); // Our mocked Quill editor
    expect(screen.getByRole('button', { name: /Save Draft/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Publish/i })).toBeInTheDocument();
  });

  // --- Test 2: Error for missing title/content ---
  test('should show error toast if title or content is missing on Publish', async () => {
    const mockToast = jest.fn();
    jest.spyOn(require('@chakra-ui/react'), 'useToast').mockImplementation(() => mockToast);

    renderComponent();

    // Leave title and content empty
    fireEvent.click(screen.getByRole('button', { name: /Publish/i }));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "Error",
        description: "Title and content are required.",
        status: "error",
        duration: 3000,
      });
    });
    expect(global.fetch).not.toHaveBeenCalled(); // Ensure no API call is made
  });

  // --- Test 3: Error for missing category ---
  test('should show error toast if category is not selected on Publish', async () => {
    const mockToast = jest.fn();
    jest.spyOn(require('@chakra-ui/react'), 'useToast').mockImplementation(() => mockToast);

    renderComponent();

    fireEvent.change(screen.getByPlaceholderText(/Article Title/i), { target: { value: 'Test Title' } });
    fireEvent.change(screen.getByTestId('article-content-editor'), { target: { value: 'Test content' } });
    // Leave category empty (default placeholder value)

    fireEvent.click(screen.getByRole('button', { name: /Publish/i }));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "Error",
        description: "Please select a category.",
        status: "error",
        duration: 3000,
      });
    });
    expect(global.fetch).not.toHaveBeenCalled(); // Ensure no API call is made
  });


  // --- Test 4: Successful article publish ---
  test('should successfully publish an article with valid data', async () => {
    const mockToast = jest.fn();
    jest.spyOn(require('@chakra-ui/react'), 'useToast').mockImplementation(() => mockToast);

    // Mock successful fetch response for POST
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

    fireEvent.change(screen.getByPlaceholderText(/Article Title/i), { target: { value: 'My New Article' } });
    fireEvent.change(screen.getByPlaceholderText(/Subtitle/i), { target: { value: 'A simple subtitle' } });
    fireEvent.change(screen.getByTestId('article-content-editor'), { target: { value: 'This is the article content.' } });
    // Correct way to interact with Chakra UI Select, using its role and associated label "Category"
    fireEvent.change(screen.getByRole('combobox', { name: /Category/i }), { target: { value: 'Personal' } });


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
            coverImage: '', // No cover image uploaded in this specific test
            category: 'Personal',
            draft: false,
          }),
        })
      );
      expect(mockToast).toHaveBeenCalledWith({
        title: "Article created",
        description: "Published successfully.",
        status: "success",
        duration: 3000,
      });
      expect(mockNavigate).toHaveBeenCalledWith('/articles/new-article-id');
    });
  });

  // --- Test 5: Successful draft save ---
  test('should save article as draft with valid data', async () => {
    const mockToast = jest.fn();
    jest.spyOn(require('@chakra-ui/react'), 'useToast').mockImplementation(() => mockToast);

    // Mock successful fetch response for POST
    global.fetch.mockImplementationOnce((url) => {
      if (url === '/api/articles') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ _id: 'draft-article-id', title: 'Draft Title' }),
        });
      }
      return Promise.reject(new Error(`Unhandled fetch for URL: ${url}`));
    });

    renderComponent();

    fireEvent.change(screen.getByPlaceholderText(/Article Title/i), { target: { value: 'My Draft Article' } });
    fireEvent.change(screen.getByTestId('article-content-editor'), { target: { value: 'This is draft content.' } });
    fireEvent.change(screen.getByRole('combobox', { name: /Category/i }), { target: { value: 'Opinion' } });


    fireEvent.click(screen.getByRole('button', { name: /Save Draft/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/articles',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            title: 'My Draft Article',
            subtitle: '', // Default empty
            content: 'This is draft content.',
            coverImage: '', // Default empty
            category: 'Opinion',
            draft: true,
          }),
        })
      );
      expect(mockToast).toHaveBeenCalledWith({
        title: "Article created",
        description: "Saved as draft.",
        status: "success",
        duration: 3000,
      });
      expect(mockNavigate).toHaveBeenCalledWith('/articles/draft-article-id');
    });
  });

  // --- Test 6: Display spinner for edit scenario ---
  test('should display spinner when loading existing article for edit', async () => {
    // Mock the fetch call for the edit scenario to return a pending promise
    global.fetch.mockImplementationOnce(() => new Promise(() => {})); // Mock just for this specific fetch call

    renderComponent({ id: 'existing-article-id' });
    
    // Use findByText to find the "Loading..." text inside the spinner, which is more robust
    await screen.findByText(/Loading.../i); 
  });

  // --- Test 7: Image crop modal interaction ---
  test('should open and close image crop modal', async () => {
    renderComponent();
  
    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
    // Use getByTestId to select the input, as you've now added it in CreateArticle.jsx
    const coverImageInput = screen.getByTestId('cover-image-input');
    fireEvent.change(coverImageInput, { target: { files: [file] } });
  
    // Modal should appear
    await waitFor(() => {
      expect(screen.getByTestId('mock-crop-modal')).toBeInTheDocument();
    });
  
    // Simulate cropping and closing (via clicking the mock modal's button)
    fireEvent.click(screen.getByText('Simulate Crop'));
  
    await waitFor(() => {
      expect(screen.queryByTestId('mock-crop-modal')).not.toBeInTheDocument();
      // Check if the cropped image is displayed
      expect(screen.getByAltText('Cover Preview')).toHaveAttribute('src', 'mock-cropped-image-url');
    });
  });
});