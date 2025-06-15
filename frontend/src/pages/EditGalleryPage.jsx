import {
  Box,
  Button,
  Container,
  Heading,
  Input,
  VStack,
  Stack,
  HStack,
  // Select, // Remove Select as we are using CheckboxGroup
  Avatar,
  Text,
  Flex,
  Spinner,
  Checkbox,
  Image,
  IconButton,
  FormControl,
  FormLabel,
  CheckboxGroup, // Add CheckboxGroup
  Wrap, // Add Wrap for better layout of checkboxes
  WrapItem, // Add WrapItem
} from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useShowToast from '../hooks/useShowToast';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import imageCompression from 'browser-image-compression';
import GalleryImageCropModal from '../components/GalleryImageCropModal';

const GALLERY_CATEGORIES = [
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

const EditGalleryPage = () => {
  const { galleryId } = useParams();
  const navigate = useNavigate();
  const showToast = useShowToast();

  const [galleryData, setGalleryData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [coverPhoto, setCoverPhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [collaborators, setCollaborators] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [rawCoverImage, setRawCoverImage] = useState(null);
  const [croppedCoverImage, setCroppedCoverImage] = useState(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await fetch(`/api/galleries/${galleryId}`, {
          credentials: 'include',
        });
        const data = await res.json();
        if (res.ok) {
          // Ensure category is an array
          const categories = Array.isArray(data.category)
            ? data.category
            : data.category ? [data.category] : ['General']; // Default to ['General'] if no category or not an array
          setGalleryData({ ...data, category: categories });
          setCollaborators(data.collaborators || []);
          // Set preview URL if coverPhoto exists
          if (data.coverPhoto) {
            setPreviewUrl(data.coverPhoto);
          }
        } else {
          showToast('Error', data.error || 'Failed to fetch gallery', 'error');
        }
      } catch (err) {
        showToast('Error', err.message, 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchGallery();
  }, [galleryId, showToast]); // Added showToast to dependencies

  const handleSearchUsers = async () => {
    if (!searchText.trim()) return;
    try {
      const res = await fetch(`/api/users/search?query=${searchText}`, {
        credentials: 'include',
      });
      const data = await res.json();
      setSuggestions(data.users || []);
    } catch (err) {
      console.error('User search failed', err);
    }
  };

  const dataURLtoFile = (dataUrl, filename) => {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const compressImage = async (file) => {
    try {
      const options = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1080,
        useWebWorker: true,
      };
      const compressed = await imageCompression(file, options);
      return compressed;
    } catch (err) {
      console.error('Compression failed:', err);
      return file;
    }
  };

  const addCollaborator = (user) => {
    if (!collaborators.find((c) => c._id === user._id)) {
      setCollaborators([...collaborators, user]);
    }
    setSearchText('');
    setSuggestions([]);
  };

  const removeCollaborator = (userId) => {
    setCollaborators((prev) => prev.filter((u) => u._id !== userId));
  };

  const handleUpdateGallery = async () => {
    if (!galleryData.name) {
      showToast('Error', 'Gallery name is required', 'error');
      return;
    }

    // Ensure at least one category is selected
    if (galleryData.category.length === 0) {
      showToast('Error', 'Please select at least one category', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', galleryData.name);
      formData.append('category', JSON.stringify(galleryData.category)); // Stringify the array
      formData.append('description', galleryData.description);
      formData.append('tags', galleryData.tags);
      formData.append('collaborators', JSON.stringify(collaborators.map((u) => u._id)));
      formData.append('isPublic', galleryData.isPublic);
      if (croppedCoverImage) {
        const compressed = await compressImage(dataURLtoFile(croppedCoverImage, 'cover.jpg'));
        formData.append('coverPhoto', compressed);
      } else if (galleryData.coverPhoto === null && previewUrl === null) {
        // If coverPhoto was removed and no new one selected
        formData.append('coverPhoto', 'null');
      }


      const res = await fetch(`/api/galleries/${galleryId}`, {
        method: 'PUT',
        body: formData,
        credentials: 'include',
      });

      const data = await res.json();
      if (res.ok) {
        showToast('Success', 'Gallery updated successfully', 'success');
        // Check if data.owner exists before navigating
        if (data.owner && data.owner.username) {
            navigate(`/galleries/${data.owner.username}/${encodeURIComponent(data.name)}`);
        } else {
            // Fallback navigation if owner data is not immediately available
            navigate(`/galleries/${galleryId}`);
        }
      } else {
        showToast('Error', data.error || 'Failed to update gallery', 'error');
      }
    } catch (err) {
      showToast('Error', err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setRawCoverImage(reader.result);
        setIsCropModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  if (isLoading || !galleryData) return <Spinner size="xl" />;

  return (
    <Container maxW="container.md">
      <VStack spacing={8}>
        <Heading>Edit Gallery</Heading>
        <Box w="full" p={6} rounded="lg" shadow="md">
          <VStack spacing={4}>
            <Input
              placeholder="Gallery Name"
              value={galleryData.name}
              onChange={(e) => setGalleryData({ ...galleryData, name: e.target.value })}
            />

            <FormControl>
              <FormLabel>Categories</FormLabel>
              <CheckboxGroup
                colorScheme="blue"
                value={galleryData.category}
                onChange={(values) => setGalleryData({ ...galleryData, category: values })}
              >
                <Wrap spacing={2}>
                  {GALLERY_CATEGORIES.map((cat) => (
                    <WrapItem key={cat}>
                      <Checkbox value={cat}>{cat}</Checkbox>
                    </WrapItem>
                  ))}
                </Wrap>
              </CheckboxGroup>
            </FormControl>

            <FormControl>
              <FormLabel>Description</FormLabel>
              <ReactQuill
                theme="snow"
                value={galleryData.description}
                onChange={(value) => setGalleryData({ ...galleryData, description: value })}
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

            <Input
              placeholder="Tags (comma-separated)"
              value={galleryData.tags}
              onChange={(e) => setGalleryData({ ...galleryData, tags: e.target.value })}
            />

            <Checkbox
              isChecked={galleryData.isPublic === false}
              onChange={(e) => setGalleryData({ ...galleryData, isPublic: !e.target.checked })}
            >
              Make gallery private
            </Checkbox>

            <Input
              placeholder="Search collaborators by username"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchUsers()}
            />

            {suggestions.length > 0 && (
              <Box bg="gray.100" p={2} borderRadius="md" w="full">
                {suggestions.map((user) => (
                  <HStack
                    key={user._id}
                    onClick={() => addCollaborator(user)}
                    _hover={{ bg: 'gray.200' }}
                    p={2}
                    cursor="pointer"
                  >
                    <Avatar size="sm" name={user.username} />
                    <Text>{user.username}</Text>
                  </HStack>
                ))}
              </Box>
            )}

            {collaborators.length > 0 && (
              <Box w="full">
                <Text fontWeight="bold" mt={2}>
                  Collaborators:
                </Text>
                <Flex wrap="wrap" gap={2} mt={2}>
                  {collaborators.map((user) => (
                    <HStack key={user._id} p={1} bg="gray.200" borderRadius="md">
                      <Text>{user.username}</Text>
                      <Button
                        size="xs"
                        colorScheme="red"
                        onClick={() => removeCollaborator(user._id)}
                      >
                        ✕
                      </Button>
                    </HStack>
                  ))}
                </Flex>
              </Box>
            )}

            <Stack spacing={2} w="full">
              <FormLabel mb={-1}>Cover image</FormLabel>
              {(croppedCoverImage || previewUrl) && (
                <Box position="relative" w="full">
                  <Image
                    src={croppedCoverImage || previewUrl}
                    alt="Cover Preview"
                    w="100%"
                    h="200px"
                    objectFit="cover"
                    mb={2}
                  />
                  <IconButton
                    icon={<CloseIcon />}
                    size="sm"
                    position="absolute"
                    top="2"
                    right="2"
                    aria-label="Remove image"
                    onClick={() => {
                      setGalleryData({ ...galleryData, coverPhoto: null }); // Set to null to indicate removal
                      setPreviewUrl(null); // Clear the displayed preview
                      setCroppedCoverImage(null); // Clear any newly cropped image
                    }}
                  />
                </Box>
              )}
              <Input type="file" accept="image/*" onChange={handleFileChange} />
            </Stack>

            <Button
              colorScheme="orange"
              onClick={handleUpdateGallery}
              w="full"
              isLoading={isSaving}
            >
              Save Changes
            </Button>
          </VStack>
        </Box>
      </VStack>
      <GalleryImageCropModal
        isOpen={isCropModalOpen}
        onClose={() => setIsCropModalOpen(false)}
        imageSrc={rawCoverImage}
        onCropComplete={(cropped) => {
          setCroppedCoverImage(cropped);
          setPreviewUrl(cropped); // Update previewUrl with the cropped image
        }}
      />
    </Container>
  );
};

export default EditGalleryPage;