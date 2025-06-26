import {
  Box,
  Button,
  Container,
  Heading,
  Input,
  Textarea,
  VStack,
  Stack,
  HStack,
  Avatar,
  Text,
  Flex,
  Checkbox,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  FormControl,
  FormLabel,
  CheckboxGroup,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { useState } from 'react';
import useShowToast from '../hooks/useShowToast';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import userAtom from '../atoms/userAtom';
import imageCompression from 'browser-image-compression';
import GalleryImageCropModal from '../components/GalleryImageCropModal';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

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

const compressImage = async (file) => {
  try {
    const options = {
      maxSizeMB: 5,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };
    const compressed = await imageCompression(file, options);
    return compressed;
  } catch (err) {
    console.error('Compression failed:', err);
    return file;
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

const CreateGalleryPage = () => {
  const navigate = useNavigate();
  const currentUser = useRecoilValue(userAtom);
  const [rawCoverImage, setRawCoverImage] = useState(null);
  const [croppedCoverImage, setCroppedCoverImage] = useState(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);

  const [newGallery, setNewGallery] = useState({
    name: '',
    category: ['General'],
    description: '',
    tags: '',
    isPublic: true,
  });

  const [coverPhoto, setCoverPhoto] = useState(null);
  const showToast = useShowToast();
  const [isLoading, setIsLoading] = useState(false);

  const [collaborators, setCollaborators] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState([]);

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

  const handleAddGallery = async () => {
    if (!newGallery.name) {
      showToast('Error', 'Gallery name is required', 'error');
      return;
    }

    if (newGallery.category.length === 0) {
      showToast('Error', 'Please select at least one category', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', newGallery.name);
      formData.append('category', JSON.stringify(newGallery.category));
      formData.append('description', newGallery.description);
      formData.append('tags', newGallery.tags);
      formData.append('collaborators', JSON.stringify(collaborators.map((u) => u._id)));
      formData.append('isPublic', newGallery.isPublic);

      if (croppedCoverImage) {
        const compressed = await compressImage(dataURLtoFile(croppedCoverImage, 'cover.jpg'));
        formData.append('coverPhoto', compressed);
      }

      const res = await fetch('/api/galleries/create', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const data = await res.json();

      if (data.error) {
        showToast('Error creating gallery', data.error, 'error');
        return;
      }

      console.log('➡️ Collaborators being sent:', collaborators);
      showToast('Gallery created successfully', '', 'success');

      if (data._id) {
        navigate(`/galleries/${data._id}`);
        showToast('Gallery created', 'Waiting for approval or invite acceptance', 'info');
      }
    } catch (error) {
      showToast('Error', error.message, 'error');
    } finally {
      setIsLoading(false);
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

  return (
    <Container maxW="container.md">
      <VStack spacing={8}>
        <Heading mb={4} textAlign="center">
          Create new gallery
        </Heading>

        <Box w="full" p={6} rounded="lg" shadow="md" overflow="visible">
          <VStack spacing={4}>
            <Input
              placeholder="Gallery Name"
              value={newGallery.name}
              onChange={(e) => setNewGallery({ ...newGallery, name: e.target.value })}
            />
            <FormControl>
              <FormLabel>Categories</FormLabel> {}
              <CheckboxGroup
                colorScheme="blue"
                value={newGallery.category}
                onChange={(values) => setNewGallery({ ...newGallery, category: values })}
              >
                <Wrap spacing={2}>
                  {' '}
                  {}
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
                value={newGallery.description}
                onChange={(value) => setNewGallery({ ...newGallery, description: value })}
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
                style={{ height: '200px', width: '100%', marginBottom: '40px' }}
              />
            </FormControl>

            <Input
              placeholder="Tags (comma-separated)"
              value={newGallery.tags}
              onChange={(e) => setNewGallery({ ...newGallery, tags: e.target.value })}
            />

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
                  Selected collaborators:
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

              <Input type="file" accept="image/*" onChange={handleFileChange} />
            </Stack>

            <Button colorScheme="green" onClick={handleAddGallery} w="full" isLoading={isLoading}>
              Add Gallery
            </Button>
          </VStack>
        </Box>
      </VStack>
      <GalleryImageCropModal
        isOpen={isCropModalOpen}
        onClose={() => setIsCropModalOpen(false)}
        imageSrc={rawCoverImage}
        onCropComplete={(cropped) => setCroppedCoverImage(cropped)}
      />
    </Container>
  );
};

export default CreateGalleryPage;
