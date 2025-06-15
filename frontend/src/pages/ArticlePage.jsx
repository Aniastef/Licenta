import {
  Box,
  Button,
  Heading,
  Input,
  VStack,
  Text,
  IconButton,
  Spinner,
  Center,
  HStack,
  Circle,
  Flex,
  Divider,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import useShowToast from '../hooks/useShowToast';
import { EditIcon } from '@chakra-ui/icons';
import { Select } from '@chakra-ui/react';
import userAtom from '../atoms/userAtom';
import { useRecoilValue } from 'recoil';
import CommentsSection from '../components/CommentsSection';
import GalleryImageCropModal from '../components/GalleryImageCropModal';
import imageCompression from 'browser-image-compression';
const ARTICLE_CATEGORIES = [
  'Personal',
  'Opinion',
  'Review',
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

const ArticlePage = () => {
  const { articleId } = useParams();
  const showToast = useShowToast();
  const [article, setArticle] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedSubtitle, setEditedSubtitle] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [columnCount, setColumnCount] = useState(1);
  const [coverImage, setCoverImage] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const currentUser = useRecoilValue(userAtom);
  const [isOwner, setIsOwner] = useState(false);
  const [activeSection, setActiveSection] = useState('comments');
  const [rawCoverImage, setRawCoverImage] = useState(null);
  const [croppedCoverImage, setCroppedCoverImage] = useState(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [category, setCategory] = useState('');

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ align: [] }],
      [{ color: [] }, { background: [] }],
      ['link', 'image'],
      ['clean'],
    ],
  };

  const quillFormats = [
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
  ];

  useEffect(() => {
    if (!articleId) {
      showToast('Error', 'Missing article ID', 'error');
      return;
    }

    const fetchArticle = async () => {
      try {
        const res = await fetch(`/api/articles/${articleId}`, {
          credentials: 'include',
        });
        const data = await res.json();
        if (res.ok) {
          setArticle(data);
          setIsOwner(data.user?._id === currentUser?._id);

          setEditedTitle(data.title);
          setEditedSubtitle(data.subtitle || '');
          setEditedContent(data.content);
          setCoverImage(data.coverImage || null);
          setCategory(data.category || '');
        } else {
          showToast('Error', data.error || 'Failed to load article', 'error');
        }
      } catch (err) {
        showToast('Error', err.message, 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [articleId, showToast]);

  useEffect(() => {
    const checkFavorite = async () => {
      if (!articleId) return;
      try {
        const res = await fetch(`/api/users/favorites`, { credentials: 'include' });
        const data = await res.json();
        if (res.ok) {
          setIsFavorite(data.favoriteArticles?.some((a) => a._id === articleId));
        }
      } catch (err) {
        console.error('Error checking favorites', err);
      }
    };
    checkFavorite();
  }, [articleId]);

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/articles/${articleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: editedTitle,
          subtitle: editedSubtitle,
          content: editedContent,
          coverImage, // nou
          category,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setArticle(data);
        setEditMode(false);
        showToast('Success', 'Article updated', 'success');
      } else {
        showToast('Error', data.error || 'Update failed', 'error');
      }
    } catch (err) {
      showToast('Error', err.message, 'error');
    }
  };

  const handleAddToFavorites = async () => {
    try {
      const res = await fetch(`/api/users/favorites/articles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ articleId }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsFavorite(true);
        showToast('Success', 'Article added to favorites', 'success');
      } else {
        showToast('Error', data.error || 'Failed to favorite', 'error');
      }
    } catch (err) {
      showToast('Error', err.message, 'error');
    }
  };

  const handleRemoveFromFavorites = async () => {
    try {
      const res = await fetch('/api/users/favorites/articles/remove', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ articleId }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsFavorite(false);
        showToast('Success', 'Removed from favorites', 'success');
      } else {
        showToast('Error', data.error || 'Failed to remove', 'error');
      }
    } catch (err) {
      showToast('Error', err.message, 'error');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;

    try {
      const res = await fetch(`/api/articles/${articleId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();

      if (res.ok) {
        showToast('Success', 'Article deleted', 'success');
        window.location.href = `/articles`; // sau navigate("/articles")
      } else {
        showToast('Error', data.error || 'Failed to delete', 'error');
      }
    } catch (err) {
      showToast('Error', err.message, 'error');
    }
  };

  const handleCancel = () => {
    if (article) {
      setEditedTitle(article.title);
      setEditedSubtitle(article.subtitle || '');
      setEditedContent(article.content);
    }
    setEditMode(false);
  };

  useEffect(() => {
    if (croppedCoverImage) {
      setCoverImage(croppedCoverImage);
    }
  }, [croppedCoverImage]);

  if (loading)
    return (
      <Center py={20}>
        <Spinner size="xl" />
      </Center>
    );
  if (!article) return <Text>Article not found</Text>;

  return (
    <Box maxW="1700px" mx="auto" py={8}>
      <VStack spacing={4} align="stretch">
        {/* HEADER + EDIT BUTTON */}
        <Box position="relative" textAlign="center">
          {!editMode && isOwner && (
            <IconButton
              icon={<EditIcon />}
              onClick={() => setEditMode(true)}
              aria-label="Edit"
              size="sm"
              position="absolute"
              top={0}
              right={0}
            />
          )}
          {isOwner && !editMode && (
            <Button colorScheme="red" size="sm" onClick={handleDelete} mt={2} mb={2}>
              Delete ARTicle
            </Button>
          )}

          <Text fontSize="sm" color="gray.400">
            Published on{' '}
            {new Date(article.createdAt).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </Text>

          {editMode ? (
            <>
              <Input
                textAlign="center"
                fontSize="2xl"
                fontWeight="bold"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                mb={1}
              />
              <Input
                placeholder="Subtitle"
                value={editedSubtitle}
                onChange={(e) => setEditedSubtitle(e.target.value)}
                textAlign="center"
                mb={2}
              />
              <Select
                placeholder="Select category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                mb={2}
              >
                {ARTICLE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </Select>

              <Input
                type="file"
                accept="image/*"
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
                mb={2}
              />
              {croppedCoverImage && (
                <Box mt={2}>
                  <img
                    src={croppedCoverImage}
                    alt="Cropped cover preview"
                    style={{
                      maxHeight: '100%',
                      width: '650px',
                      objectFit: 'cover',
                      borderRadius: '6px',
                    }}
                  />
                </Box>
              )}
            </>
          ) : (
            <>
              <Heading mt={2}>{article.title}</Heading>
              {article.subtitle && (
                <Text fontSize="lg" color="gray.600" mt={2}>
                  {article.subtitle}
                </Text>
              )}
              {article.category && (
                <Text fontSize="sm" color="teal.600">
                  Category: {article.category}
                </Text>
              )}

              {currentUser && !editMode && !isOwner && (
                <IconButton
                  aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  icon={<Text fontSize="2xl">{isFavorite ? '❤️' : '🤍'}</Text>}
                  variant="ghost"
                  color={isFavorite ? 'red.400' : 'gray.400'}
                  _hover={{ transform: 'scale(1.2)' }}
                  onClick={isFavorite ? handleRemoveFromFavorites : handleAddToFavorites}
                  size="sm"
                  position="absolute"
                  top={0}
                  right="40px"
                />
              )}

              {coverImage && (
                <Box mt={4}>
                  <img
                    src={coverImage}
                    alt="Cover"
                    style={{
                      maxHeight: '400px',
                      objectFit: 'cover',
                      width: '100%',
                      borderRadius: '8px',
                    }}
                  />
                </Box>
              )}
            </>
          )}

          <Text fontSize="sm" color="gray.500" mt={2}>
            by{' '}
            {article.user?.username ? (
              <a
                href={`/profile/${article.user.username}`}
                style={{ color: '#3182CE', textDecoration: 'underline' }}
              >
                {article.user.username}
              </a>
            ) : (
              'Unknown'
            )}
          </Text>

          <Flex mt={7} align="center" justify="center" gap={2}>
            <Circle size="30px" bg="yellow.400" />
            <Circle size="30px" bg="green.400" />
          </Flex>
        </Box>

        {/* CONTENT */}
        {editMode ? (
          <>
            <ReactQuill
              value={editedContent}
              onChange={setEditedContent}
              modules={quillModules}
              formats={quillFormats}
            />

            <HStack justify="center" mt={4}>
              <Button onClick={handleCancel} variant="outline">
                Cancel
              </Button>
              <Button onClick={handleSave} colorScheme="blue">
                Save Changes
              </Button>
            </HStack>
          </>
        ) : (
          <Box
            mt={4}
            px={4}
            sx={{
              columnCount: columnCount,
              columnGap: '40px',
              lineHeight: '1.8',
              wordBreak: 'break-word',
              fontSize: '17px',
              '& .ql-align-center': { textAlign: 'center' },
              '& .ql-align-right': { textAlign: 'right' },
              '& .ql-align-justify': { textAlign: 'justify' },
              '& hr': {
                border: 'none',
                borderTop: '1px solid #ccc',
                marginY: '20px',
              },
            }}
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        )}

        {article && (
          <Box mt={10}>
            <Divider my={4} />

            <CommentsSection resourceId={article._id} resourceType="Article" />
          </Box>
        )}
        <Divider my={4} />
      </VStack>
      <GalleryImageCropModal
        isOpen={isCropModalOpen}
        onClose={() => setIsCropModalOpen(false)}
        imageSrc={rawCoverImage}
        onCropComplete={(cropped) => {
          setCroppedCoverImage(cropped);
          setCoverImage(cropped); // actualizează imaginea de trimis
        }}
      />
    </Box>
  );
};

export default ArticlePage;
