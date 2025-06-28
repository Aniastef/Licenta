import {
  Box,
  Button,
  Container,
  Heading,
  Input,
  VStack,
  useToast,
  Text,
  Spinner,
  FormLabel,
  Stack,
  Select,
  FormControl,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import GalleryImageCropModal from '../components/GalleryImageCropModal';
import imageCompression from 'browser-image-compression';

const ARTICLE_CATEGORIES = [
  'Personal',
  'Opinion',
  'Review',
  'Culture',
  'Tutorial',
  'Poetry',
  'Reflection',
  'News',
  'Interview',
  'Tech',
  'Art',
  'Photography',
  'Research',
  'Journal',
  'Story',
];

const CreateOrEditArticlePage = () => {
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(!!id);
  const toast = useToast();
  const navigate = useNavigate();
  const [subtitle, setSubtitle] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [rawCoverImage, setRawCoverImage] = useState(null);
  const [croppedCoverImage, setCroppedCoverImage] = useState(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [category, setCategory] = useState('');

  useEffect(() => {
    if (id) {
      fetch(`/api/articles/${id}`, { credentials: 'include' })
        .then((res) => res.json())
        .then((data) => {
          setTitle(data.title || '');
          setSubtitle(data.subtitle || '');
          setContent(data.content || '');
          setCoverImage(data.coverImage || '');
          setCategory(data.category || '');
        })
        .catch((err) => {
          toast({
            title: 'Error loading article',
            description: err.message,
            status: 'error',
            duration: 3000,
          });
        })
        .finally(() => setLoadingExisting(false));
    }
  }, [id, toast]);

  const handleSubmit = async (asDraft = false) => {
    if (!title || !content) {
      toast({
        title: 'Error',
        description: 'Title and content are required.',
        status: 'error',
        duration: 3000,
      });
      return;
    }
    if (!category) {
      toast({
        title: 'Error',
        description: 'Please select a category.',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`/api/articles${id ? `/${id}` : ''}`, {
        method: id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title, subtitle, content, coverImage, category, draft: asDraft }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save article');

      toast({
        title: id ? 'Article updated' : 'Article created',
        description: asDraft ? 'Saved as draft.' : 'Published successfully.',
        status: 'success',
        duration: 3000,
      });

      navigate(`/articles/${data._id}`);
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message,
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingExisting)
    return (
      <Container maxW="container.md" py={10} centerContent>
        <Spinner size="xl" />
      </Container>
    );

  return (
    <Container maxW="container.md">
      <VStack spacing={8} py={4}>
        <Heading textAlign="center">{id ? 'Edit ARTicle' : 'Create new ARTicle'}</Heading>
        <Box w="full" p={6} rounded="lg" shadow="md">
          <VStack spacing={4} align="stretch">
            <Input
              placeholder="Article Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Input
              placeholder="Subtitle"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
            />
            <FormControl>
              <FormLabel htmlFor="article-category-select">Category</FormLabel>
              <Select
                id="article-category-select"
                placeholder="Select category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {ARTICLE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </Select>
            </FormControl>

            <Stack w="full">
              <FormLabel htmlFor="article-cover-image">Cover image</FormLabel>
              <Input
                id="article-cover-image"
                type="file"
                accept="image/*"
                p={1.5}
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setRawCoverImage(reader.result);
                      setIsCropModalOpen(true);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                data-testid="cover-image-input"
              />
            </Stack>

            {croppedCoverImage && (
              <Box mt={2}>
                <Text fontSize="sm" mb={2}>
                  Cover Preview:
                </Text>
                <img
                  src={croppedCoverImage}
                  alt="Cover Preview"
                  style={{
                    maxHeight: '250px',
                    width: '100%',
                    objectFit: 'cover',
                    borderRadius: '6px',
                  }}
                />
              </Box>
            )}

            <FormControl>
              <FormLabel>Content</FormLabel>
              <ReactQuill
                value={content}
                onChange={setContent}
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
                style={{ height: '200px', marginBottom: '50px' }}
              />
            </FormControl>

            <Button
              colorScheme="pink"
              onClick={() => handleSubmit(false)}
              isLoading={isLoading}
              w="full"
            >
              {id ? 'Update Article' : 'Publish Article'}
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
          setCoverImage(cropped);
        }}
      />
    </Container>
  );
};

export default CreateOrEditArticlePage;
