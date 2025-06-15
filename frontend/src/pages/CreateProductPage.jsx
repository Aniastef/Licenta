import {
  Box,
  Button,
  Container,
  Heading,
  Input,
  Textarea,
  VStack,
  Stack,
  Image,
  Flex,
  Select, // Keep Select if you want to use it for single-select dropdowns for other things, but it's replaced for Category.
  Switch,
  FormControl,
  FormLabel,
  Text,
  Checkbox, // Add Checkbox
  CheckboxGroup, // Add CheckboxGroup
  Wrap,
  WrapItem, // Add Wrap and WrapItem for better layout of checkboxes
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import useShowToast from '../hooks/useShowToast';
import productAtom from '../atoms/productAtom';
import { useSetRecoilState } from 'recoil';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import imageCompression from 'browser-image-compression';

const ALL_CATEGORIES = [
  'General',
  'Photography',
  'Painting',
  'Drawing',
  'Sketch',
  'Illustration',
  'Digital Art',
  'Pixel Art',
  '3D Art',
  'Animation',
  'Graffiti',
  'Calligraphy',
  'Typography',
  'Collage',
  'Mixed Media',
  'Sculpture',
  'Installation',
  'Fashion',
  'Textile',
  'Architecture',
  'Interior Design',
  'Product Design',
  'Graphic Design',
  'UI/UX',
  'Music',
  'Instrumental',
  'Vocal',
  'Rap',
  'Spoken Word',
  'Podcast',
  'Sound Design',
  'Film',
  'Short Film',
  'Documentary',
  'Cinematography',
  'Video Art',
  'Performance',
  'Dance',
  'Theatre',
  'Acting',
  'Poetry',
  'Writing',
  'Essay',
  'Prose',
  'Fiction',
  'Non-fiction',
  'Journal',
  'Comics',
  'Manga',
  'Zine',
  'Fantasy Art',
  'Surrealism',
  'Realism',
  'Abstract',
  'Minimalism',
  'Expressionism',
  'Pop Art',
  'Concept Art',
  'AI Art',
  'Experimental',
  'Political Art',
  'Activist Art',
  'Environmental Art',
]; //

const compressImage = async (file) => {
  try {
    const options = {
      maxSizeMB: 5.5,
      maxWidthOrHeight: 1280,
      useWebWorker: true,
    };
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (error) {
    console.error('Compression failed:', error);
    return file;
  }
};

const CreateProductPage = () => {
  const setProduct = useSetRecoilState(productAtom);
  const [newProduct, setNewProduct] = useState({
    title: '',
    description: '',
    price: '',
    quantity: null,
    forSale: true,
    category: ['General'], // MODIFICATION: Initialize as an array with "General"
    galleries: [],
    images: [],
    videos: [],
    audios: [],
    writing: '', // assuming writing is a single string for Quill
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [videoFiles, setVideoFiles] = useState([]);
  // const [audioFiles, setAudioFiles] = useState([]);
  const [userGalleries, setUserGalleries] = useState([]);
  const showToast = useShowToast();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ Preluare galerii ale utilizatorului
  useEffect(() => {
    const fetchGalleries = async () => {
      try {
        const res = await fetch('/api/users/galleries', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        const data = await res.json();
        if (data.galleries) {
          console.log('Fetched galleries:', data.galleries);
          setUserGalleries(data.galleries);
        } else {
          console.error('No galleries found:', data.error);
        }
      } catch (error) {
        console.error('Error fetching galleries:', error.message);
      }
    };
    fetchGalleries();
  }, []);

  const [audioFiles, setAudioFiles] = useState([]);

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleAddProduct = async () => {
    if (!newProduct.title) {
      showToast('Error', 'Title is required', 'error');
      return;
    }
    if (audioFiles.length > 0 && imageFiles.length === 0 && videoFiles.length === 0) {
      showToast('Error', 'You must upload at least one image or video if you add audio', 'error');
      return;
    }
    setIsLoading(true);

    try {
      const compressedImages = await Promise.all(imageFiles.map((file) => compressImage(file)));
      const imagesBase64 = await Promise.all(compressedImages.map(fileToBase64));
      const videosBase64 = await Promise.all(videoFiles.map(fileToBase64));
      const audiosBase64 = await Promise.all(audioFiles.map(fileToBase64));

      const res = await fetch('/api/products/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...newProduct,
          images: imagesBase64,
          videos: videosBase64,
          audios: audiosBase64,
        }),
      });

      const data = await res.json();

      if (data.error) {
        showToast('Error creating artwork', data.error, 'error');
      } else {
        setProduct(data);
        showToast('Artwork created successfully', '', 'success');
        navigate(`/products/${data._id}`);
      }
    } catch (error) {
      showToast('Error', error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = [...e.target.files];
    if (imageFiles.length + selectedFiles.length > 5) {
      showToast('Error', 'You can upload a maximum of 5 images', 'error');
      return;
    }
    setImageFiles([...imageFiles, ...selectedFiles]);
  };

  return (
    <Container maxW="container.md">
      <VStack spacing={8}>
        <Heading>Create new artwork</Heading>
        <Box w="full" p={6} rounded="lg" shadow="md">
          <VStack spacing={4}>
            <Input
              placeholder="Artwork title"
              value={newProduct.title}
              onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
            />

            <FormControl>
              <FormLabel>Description</FormLabel>
              <ReactQuill
                theme="snow"
                value={newProduct.description}
                onChange={(value) => setNewProduct({ ...newProduct, description: value })}
                modules={{
                  toolbar: [
                    [{ header: [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ list: 'ordered' }, { list: 'bullet' }],
                    [{ align: [] }],
                    [{ color: [] }, { background: [] }],
                    ['link', 'image'],
                    ['clean'],
                  ],
                }}
                formats={[
                  'header',
                  'bold',
                  'italic',
                  'underline',
                  'strike',
                  'list',
                  'bullet',
                  'align',
                  'color',
                  'background',
                  'link',
                  'image',
                ]}
                style={{ height: '200px', width: '100%', marginBottom: '30px' }}
              />
            </FormControl>

            <FormControl display="flex" alignItems="center">
              <FormLabel mb={-1} mt={2}>
                Is for sale
              </FormLabel>
              <Switch
                isChecked={newProduct.forSale}
                onChange={(e) => setNewProduct({ ...newProduct, forSale: e.target.checked })}
              />
            </FormControl>
            {newProduct.forSale && (
              <>
                <Input
                  type="number"
                  placeholder="Price"
                  value={newProduct.price ?? 0}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, price: parseFloat(e.target.value) || 0 })
                  }
                />

                <FormControl>
                  <FormLabel>Stock / Quantity</FormLabel>
                  <Input
                    type="number"
                    min="0"
                    placeholder="Quantity"
                    value={newProduct.quantity ?? ''}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        quantity: e.target.value === '' ? null : parseInt(e.target.value),
                      })
                    }
                  />
                </FormControl>
              </>
            )}

            <FormControl>
              <FormLabel>Categories</FormLabel> {/* MODIFICATION: Label changed to plural */}
              <CheckboxGroup
                colorScheme="green"
                value={newProduct.category} // MODIFICATION: Bind value to array
                onChange={(
                  selectedValues, // MODIFICATION: Handle array of selected values
                ) => setNewProduct({ ...newProduct, category: selectedValues })}
              >
                <Wrap spacing={2} mt={2} maxW="100%">
                  {' '}
                  {/* Use Wrap for better layout of checkboxes */}
                  {ALL_CATEGORIES.map((cat) => (
                    <WrapItem key={cat}>
                      <Checkbox value={cat}>{cat}</Checkbox>
                    </WrapItem>
                  ))}
                </Wrap>
              </CheckboxGroup>
            </FormControl>

            <FormControl>
              <FormLabel>Gallery</FormLabel>
              <Select
                value={newProduct.galleries[0] || 'general-placeholder'}
                onChange={(e) => {
                  const selected = e.target.value;
                  setNewProduct({
                    ...newProduct,
                    galleries: selected === 'general-placeholder' ? [] : [selected],
                  });
                }}
              >
                <option value="general-placeholder">General</option>
                {userGalleries.map((gallery) => (
                  <option key={gallery._id} value={gallery._id}>
                    {gallery.name}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Images</FormLabel>
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setImageFiles([...e.target.files])}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Videos</FormLabel>
              <Input
                type="file"
                accept="video/*"
                multiple
                onChange={(e) => setVideoFiles([...e.target.files])}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Audios</FormLabel>
              <Input
                type="file"
                accept="audio/*"
                multiple
                onChange={(e) => setAudioFiles([...e.target.files])}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Writing / poem</FormLabel>
              <ReactQuill
                theme="snow"
                value={newProduct.writing}
                onChange={(value) => setNewProduct({ ...newProduct, writing: value })}
                modules={{
                  toolbar: [
                    [{ header: [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ list: 'ordered' }, { list: 'bullet' }],
                    [{ align: [] }],
                    [{ color: [] }, { background: [] }],
                    ['link'],
                    ['clean'],
                  ],
                }}
                formats={[
                  'header',
                  'bold',
                  'italic',
                  'underline',
                  'strike',
                  'list',
                  'bullet',
                  'align',
                  'color',
                  'background',
                  'link',
                ]}
                style={{ height: '200px', width: '100%', marginBottom: '50px' }}
              />
            </FormControl>

            <Button colorScheme="orange" onClick={handleAddProduct} w="full" isLoading={isLoading}>
              Add artwork
            </Button>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
};

export default CreateProductPage;
