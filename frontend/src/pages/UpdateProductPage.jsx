import {
  Box,
  Button,
  Container,
  Heading,
  Input,
  VStack,
  Image,
  Flex,
  Select,
  Switch,
  FormControl,
  FormLabel,
  IconButton,
  Spinner,
  Text,
} from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useShowToast from '../hooks/useShowToast';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import imageCompression from 'browser-image-compression';

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

const EditProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const showToast = useShowToast();

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [videoFiles, setVideoFiles] = useState([]);
  const [audioFiles, setAudioFiles] = useState([]);
  const [userGalleries, setUserGalleries] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`, { credentials: 'include' });
        const data = await res.json();
        if (res.ok) setProduct(data.product);
        else showToast('Error', data.error, 'error');
      } catch (err) {
        showToast('Error', err.message, 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

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
        if (data.galleries) setUserGalleries(data.galleries);
      } catch (err) {
        console.error('Error fetching galleries:', err.message);
      }
    };
    fetchGalleries();
  }, []);

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleRemoveMedia = (type, index) => {
    setProduct((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  };

  const handleUpdate = async () => {
    if (!product.title) {
      showToast('Error', 'Title is required', 'error');
      return;
    }
    const isAddingAudio = audioFiles.length > 0;
    const hasVisualMedia =
      imageFiles.length > 0 ||
      videoFiles.length > 0 ||
      (product.images?.length || 0) > 0 ||
      (product.videos?.length || 0) > 0;

    if (isAddingAudio && !hasVisualMedia) {
      showToast('Error', 'You must have at least one image or video if you add audio.', 'error');
      return;
    }
    setUpdating(true);
    try {
      const compressedImages = await Promise.all(imageFiles.map((file) => compressImage(file)));
      const imagesBase64 = await Promise.all(compressedImages.map(fileToBase64));
      const videosBase64 = await Promise.all(videoFiles.map(fileToBase64));
      const audiosBase64 = await Promise.all(audioFiles.map(fileToBase64));

      const updated = {
        ...product,
        images: [...(product.images || []), ...imagesBase64],
        videos: [...(product.videos || []), ...videosBase64],
        audios: [...(product.audios || []), ...audiosBase64],
      };

      const res = await fetch(`/api/products/update/${product._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updated),
      });

      const data = await res.json();
      if (res.ok) {
        showToast('Product updated', '', 'success');
        navigate(`/products/${product._id}`);
      } else {
        showToast('Update failed', data.error, 'error');
      }
    } catch (err) {
      showToast('Error', err.message, 'error');
    } finally {
      setUpdating(false);
    }
  };

  if (isLoading)
    return (
      <Container py={10}>
        <Spinner />
      </Container>
    );
  if (!product)
    return (
      <Container py={10}>
        <Heading size="md">Product not found.</Heading>
      </Container>
    );

  return (
    <Container maxW="container.md">
      <VStack spacing={8}>
        <Heading>Edit artwork</Heading>
        <Box w="full" p={6} rounded="lg" shadow="md">
          <VStack spacing={4}>
            <Input
              value={product.title ?? ''}
              onChange={(e) => setProduct({ ...product, title: e.target.value })}
            />

            <FormControl>
              <FormLabel>Description</FormLabel>
              <ReactQuill
                theme="snow"
                value={product.description ?? ''}
                onChange={(value) => setProduct({ ...product, description: value })}
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
              <FormLabel mt={2}>Is for sale</FormLabel>
              <Switch
                isChecked={product.forSale}
                onChange={(e) => setProduct({ ...product, forSale: e.target.checked })}
              />
            </FormControl>
            {product.forSale && (
              <>
                <Input
                  type="number"
                  placeholder="Price"
                  value={product.price ?? 0} // fallback la 0
                  onChange={(e) =>
                    setProduct({ ...product, price: parseFloat(e.target.value) || 0 })
                  }
                />

                <Input
                  type="number"
                  min="0"
                  placeholder="Quantity"
                  value={product.quantity}
                  onChange={(e) =>
                    setProduct({
                      ...product,
                      quantity: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </>
            )}

            <FormControl>
              <FormLabel>Category</FormLabel>
              <Select
                value={product.category || 'General'}
                onChange={(e) => setProduct({ ...product, category: e.target.value })}
              >
                {[
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
                ].map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Gallery</FormLabel>
              <Select
                value={product.galleries?.[0] || 'general-placeholder'}
                onChange={(e) => {
                  const selected = e.target.value;
                  setProduct({
                    ...product,
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

            {['images', 'videos', 'audios'].map((mediaType) => (
              <Flex key={mediaType} gap={3} wrap="wrap" align="center">
                {product[mediaType]?.map((src, i) => (
                  <Box key={i} position="relative">
                    {mediaType === 'images' ? (
                      <Image src={src} boxSize="100px" objectFit="cover" borderRadius="md" />
                    ) : mediaType === 'videos' ? (
                      <video src={src} width="160" controls />
                    ) : (
                      <audio src={src} controls />
                    )}
                    <IconButton
                      icon={<CloseIcon />}
                      size="xs"
                      colorScheme="red"
                      position="absolute"
                      top="0"
                      right="0"
                      onClick={() => handleRemoveMedia(mediaType, i)}
                      aria-label="Remove media"
                    />
                  </Box>
                ))}
              </Flex>
            ))}

            {/* Upload new files */}
            <FormControl>
              <FormLabel mt={-5}>Images</FormLabel>
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
              <FormLabel>Writing / Poem</FormLabel>
              <ReactQuill
                theme="snow"
                value={product.writing ?? ''}
                onChange={(value) => setProduct({ ...product, writing: value })}
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
                style={{ height: '200px', width: '100%', marginBottom: '30px' }}
              />
            </FormControl>

            <Button colorScheme="orange" onClick={handleUpdate} isLoading={updating} w="full">
              Save Changes
            </Button>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
};

export default EditProductPage;
