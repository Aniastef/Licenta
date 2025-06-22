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
  Alert,
  AlertIcon,
  Checkbox,
  CheckboxGroup,
  Wrap,
  WrapItem,
  Textarea,
} from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useShowToast from '../hooks/useShowToast';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import imageCompression from 'browser-image-compression';
import { useRecoilValue } from 'recoil';
import userAtom from '../atoms/userAtom';

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
];

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
  const { id: productId } = useParams();
  const navigate = useNavigate();
  const showToast = useShowToast();
  const currentUser = useRecoilValue(userAtom);
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [newVideoFiles, setNewVideoFiles] = useState([]);
  const [newAudioFiles, setNewAudioFiles] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [newVideoPreviews, setNewVideoPreviews] = useState([]);
  const [newAudioPreviews, setNewAudioPreviews] = useState([]);
  const [userGalleries, setUserGalleries] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/products/${productId}`, { credentials: 'include' });
        const data = await res.json();

        if (res.ok) {
          const initialCategories = Array.isArray(data.product.category)
            ? data.product.category
            : data.product.category
              ? [data.product.category]
              : [];

          setProduct({
            ...data.product,
            category: initialCategories.length > 0 ? initialCategories : ['General'],
          });

        } else {
          showToast('Error', data.error, 'error');
          setProduct(null);
        }
      } catch (err) {
        showToast('Error', err.message, 'error');
        setProduct(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId, showToast]);

  useEffect(() => {
    const fetchGalleries = async () => {
      try {
        if (currentUser && currentUser.username) {
          const res = await fetch(`/api/galleries/user/${currentUser.username}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          });
          const data = await res.json();
          if (data.galleries) {
            setUserGalleries(data.galleries);
          } else if (data.error) {
            showToast('Error fetching galleries', data.error, 'error');
          }
        }
      } catch (err) {
        console.error('Error fetching galleries:', err.message);
        showToast('Error', 'Failed to fetch galleries: ' + err.message, 'error');
      }
    };
    if (currentUser) {
      fetchGalleries();
    }
  }, [currentUser, showToast]);

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleRemoveExistingMedia = (type, indexToRemove) => {
    setProduct((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== indexToRemove),
    }));
  };

  const handleRemoveNewMedia = (type, indexToRemove) => {
    if (type === 'images') {
      setNewImageFiles((prev) => prev.filter((_, i) => i !== indexToRemove));
      setNewImagePreviews((prev) => prev.filter((_, i) => i !== indexToRemove));
    } else if (type === 'videos') {
      setNewVideoFiles((prev) => prev.filter((_, i) => i !== indexToRemove));
      setNewVideoPreviews((prev) => prev.filter((_, i) => i !== indexToRemove));
    } else if (type === 'audios') {
      setNewAudioFiles((prev) => prev.filter((_, i) => i !== indexToRemove));
      setNewAudioPreviews((prev) => prev.filter((_, i) => i !== indexToRemove));
    }
  };

  const handleFileChange = (e, type) => {
    const files = Array.from(e.target.files);

    const newPreviewsToAdd = [];
    const newFilesToAdd = [];

    files.forEach((file) => {
      newFilesToAdd.push(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviewsToAdd.push(reader.result);
        if (newPreviewsToAdd.length === files.length) {
          if (type === 'images') {
            setNewImageFiles((prev) => [...prev, ...newFilesToAdd]);
            setNewImagePreviews((prev) => [...prev, ...newPreviewsToAdd]);
          } else if (type === 'videos') {
            setNewVideoFiles((prev) => [...prev, ...newFilesToAdd]);
            setNewVideoPreviews((prev) => [...prev, ...newPreviewsToAdd]);
          } else if (type === 'audios') {
            setNewAudioFiles((prev) => [...prev, ...newFilesToAdd]);
            setNewAudioPreviews((prev) => [...prev, ...newPreviewsToAdd]);
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleCategoryChange = (selectedCategories) => {
    if (selectedCategories.length === 0) {
      setProduct({ ...product, category: ['General'] });
    } else {
      setProduct({ ...product, category: selectedCategories });
    }
  };

    const handleGalleryChange = (selectedIds) => {
    const newGalleries = selectedIds.map(id => ({
        gallery: { _id: id },
        order: 0
    }));
    setProduct({ ...product, galleries: newGalleries });
  };
  
  if (currentUser && product && product.user && currentUser._id !== product.user._id) {
    showToast('Error', 'You are not authorized to edit this product.', 'error');
    navigate(`/`);
    return null;
  }

  const handleUpdate = async () => {
    if (!product.title) {
      showToast('Error', 'Title is required', 'error');
      return;
    }

    const hasExistingAudio = product.audios && product.audios.length > 0;
    const hasNewAudio = newAudioFiles.length > 0;
    const isAddingAudio = hasExistingAudio || hasNewAudio;

    const hasExistingVisual =
      (product.images && product.images.length > 0) ||
      (product.videos && product.videos.length > 0);
    const hasNewVisual = newImageFiles.length > 0 || newVideoFiles.length > 0;
    const hasVisualMedia = hasExistingVisual || hasNewVisual;

    if (isAddingAudio && !hasVisualMedia) {
      showToast('Error', 'You must have at least one image or video if you add audio.', 'error');
      return;
    }

    setUpdating(true);
    try {
      const compressedImages = await Promise.all(newImageFiles.map((file) => compressImage(file)));
      const imagesBase64 = await Promise.all(compressedImages.map(fileToBase64));
      const videosBase64 = await Promise.all(newVideoFiles.map(fileToBase64));
      const audiosBase64 = await Promise.all(newAudioFiles.map(fileToBase64));

      const galleriesToSend = product.galleries.map(g => ({
        gallery: g.gallery._id,
        order: g.order || 0
      }));

      const updated = {
        ...product,
        images: [...(product.images || []), ...imagesBase64],
        videos: [...(product.videos || []), ...videosBase64],
        audios: [...(product.audios || []), ...audiosBase64],
        galleries: galleriesToSend,
        category: product.category.length > 0 ? product.category : ['General'],
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

  if (currentUser && product && product.user && currentUser._id !== product.user._id) {
    showToast('Error', 'You are not authorized to edit this product.', 'error');
    navigate(`/`);
    return null;
  }

  return (
    product && (
      <Container maxW="container.md" py={10}>
        <VStack spacing={8}>
          <Heading size="xl">Edit artwork</Heading>
          <Box w="full" p={6} rounded="lg" shadow="md">
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>Title</FormLabel>
                <Input
                  placeholder="Artwork title"
                  value={product.title ?? ''}
                  onChange={(e) => setProduct({ ...product, title: e.target.value })}
                />
              </FormControl>

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
                  style={{ height: '200px', width: '100%', marginBottom: '50px' }}
                />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="for-sale-switch" mb="0">
                  Is for sale?
                </FormLabel>
                <Switch
                  id="for-sale-switch"
                  isChecked={product.forSale}
                  onChange={(e) => setProduct({ ...product, forSale: e.target.checked })}
                />
              </FormControl>

              {product.forSale && (
                <>
                  <FormControl>
                    <FormLabel>Price (EUR)</FormLabel>
                    <Input
                      type="number"
                      placeholder="e.g., 99.99"
                      value={product.price ?? 0}
                      onChange={(e) =>
                        setProduct({ ...product, price: parseFloat(e.target.value) || 0 })
                      }
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Quantity</FormLabel>
                    <Input
                      type="number"
                      min="0"
                      placeholder="e.g., 10"
                      value={product.quantity}
                      onChange={(e) =>
                        setProduct({
                          ...product,
                          quantity: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </FormControl>
                </>
              )}

              <FormControl>
                <FormLabel>Categories</FormLabel>
                <CheckboxGroup
                  colorScheme="orange"
                  value={product.category || ['General']}
                  onChange={handleCategoryChange}
                >
                  <Wrap spacing={3}>
                    {ALL_CATEGORIES.map((cat) => (
                      <WrapItem key={cat}>
                        <Checkbox value={cat}>{cat}</Checkbox>
                      </WrapItem>
                    ))}
                  </Wrap>
                </CheckboxGroup>
              </FormControl>

        <FormControl>
                <FormLabel>Galleries</FormLabel>
                <CheckboxGroup
                  colorScheme="orange"
                  value={product.galleries?.map(g => g.gallery._id) || []}
                  onChange={handleGalleryChange}
                >
                  <Wrap spacing={4} mt={2}>
                    {userGalleries.map((gallery) => (
                      <WrapItem key={gallery._id}>
                        <Checkbox value={gallery._id}>{gallery.name}</Checkbox>
                      </WrapItem>
                    ))}
                  </Wrap>
                </CheckboxGroup>
              </FormControl>

              {}
              {(product.images?.length > 0 ||
                product.videos?.length > 0 ||
                product.audios?.length > 0) && (
                <Box>
                  <Text fontSize="lg" fontWeight="bold" mb={2}>
                    Existing Media:
                  </Text>
                  <Flex gap={3} wrap="wrap" align="center">
                    {product.images?.map((src, i) => (
                      <Box key={`existing-img-${i}`} position="relative">
                        <Image src={src} boxSize="100px" objectFit="cover" borderRadius="md" />
                        <IconButton
                          icon={<CloseIcon />}
                          size="xs"
                          colorScheme="red"
                          position="absolute"
                          top="0"
                          right="0"
                          onClick={() => handleRemoveExistingMedia('images', i)}
                          aria-label="Remove image"
                        />
                      </Box>
                    ))}
                    {product.videos?.map((src, i) => (
                      <Box key={`existing-vid-${i}`} position="relative">
                        <video src={src} width="160" controls style={{ borderRadius: '8px' }} />
                        <IconButton
                          icon={<CloseIcon />}
                          size="xs"
                          colorScheme="red"
                          position="absolute"
                          top="0"
                          right="0"
                          onClick={() => handleRemoveExistingMedia('videos', i)}
                          aria-label="Remove video"
                        />
                      </Box>
                    ))}
                    {product.audios?.map((src, i) => (
                      <Box key={`existing-aud-${i}`} position="relative">
                        <audio src={src} controls style={{ borderRadius: '8px' }} />
                        <IconButton
                          icon={<CloseIcon />}
                          size="xs"
                          colorScheme="red"
                          position="absolute"
                          top="0"
                          right="0"
                          onClick={() => handleRemoveExistingMedia('audios', i)}
                          aria-label="Remove audio"
                        />
                      </Box>
                    ))}
                  </Flex>
                </Box>
              )}

              {}
              <FormControl>
                <FormLabel>Add Images</FormLabel>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleFileChange(e, 'images')}
                />
                <Flex gap={3} wrap="wrap" mt={2}>
                  {newImagePreviews.map((src, i) => (
                    <Box key={`new-img-${i}`} position="relative">
                      <Image src={src} boxSize="100px" objectFit="cover" borderRadius="md" />
                      <IconButton
                        icon={<CloseIcon />}
                        size="xs"
                        colorScheme="red"
                        position="absolute"
                        top="0"
                        right="0"
                        onClick={() => handleRemoveNewMedia('images', i)}
                        aria-label="Remove new image"
                      />
                    </Box>
                  ))}
                </Flex>
              </FormControl>

              <FormControl>
                <FormLabel>Add Videos</FormLabel>
                <Input
                  type="file"
                  accept="video/*"
                  multiple
                  onChange={(e) => handleFileChange(e, 'videos')}
                />
                <Flex gap={3} wrap="wrap" mt={2}>
                  {newVideoPreviews.map((src, i) => (
                    <Box key={`new-vid-${i}`} position="relative">
                      <video src={src} width="160" controls style={{ borderRadius: '8px' }} />
                      <IconButton
                        icon={<CloseIcon />}
                        size="xs"
                        colorScheme="red"
                        position="absolute"
                        top="0"
                        right="0"
                        onClick={() => handleRemoveNewMedia('videos', i)}
                        aria-label="Remove new video"
                      />
                    </Box>
                  ))}
                </Flex>
              </FormControl>

              <FormControl>
                <FormLabel>Add Audios</FormLabel>
                <Input
                  type="file"
                  accept="audio/*"
                  multiple
                  onChange={(e) => handleFileChange(e, 'audios')}
                />
                <Flex gap={3} wrap="wrap" mt={2}>
                  {newAudioPreviews.map((src, i) => (
                    <Box key={`new-aud-${i}`} position="relative">
                      <audio src={src} controls style={{ borderRadius: '8px' }} />
                      <IconButton
                        icon={<CloseIcon />}
                        size="xs"
                        colorScheme="red"
                        position="absolute"
                        top="0"
                        right="0"
                        onClick={() => handleRemoveNewMedia('audios', i)}
                        aria-label="Remove new audio"
                      />
                    </Box>
                  ))}
                </Flex>
              </FormControl>

              <FormControl>
                <FormLabel>Writing / poem</FormLabel>
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
                  style={{ height: '200px', width: '100%', marginBottom: '50px' }}
                />
              </FormControl>

              <Button colorScheme="orange" onClick={handleUpdate} isLoading={updating} w="full">
                Save Changes
              </Button>
            </VStack>
          </Box>
        </VStack>
      </Container>
    )
  );
};

export default EditProductPage;
