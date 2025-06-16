import React, { useEffect, useState } from 'react';
import {
  Box,
  Text,
  Input,
  SimpleGrid,
  Spinner,
  Image,
  Flex,
  Circle,
  Select,
  Button,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { useParams, Link } from 'react-router-dom';
import userAtom from '../atoms/userAtom';
import { useRecoilValue } from 'recoil';

const UserAllGalleriesPage = () => {
  const { username } = useParams();
  const [galleries, setGalleries] = useState([]);
  const [filteredGalleries, setFilteredGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState(null);
  const [tagOptions, setTagOptions] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [roleFilter, setRoleFilter] = useState('');
  const currentUser = useRecoilValue(userAtom);

  useEffect(() => {
    fetchUserGalleries();
  }, [username]);

  const fetchUserGalleries = async () => {
    try {
      const res = await fetch(`/api/galleries/user/${username}`, {
        credentials: 'include',
      });
      const data = await res.json();
      setGalleries(data.galleries || []);
      setFilteredGalleries(data.galleries || []);
      if (data.user) setUser(data.user);
    } catch (err) {
      console.error('Error fetching galleries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const allTags = [...new Set(galleries.flatMap((g) => g.tags || []))];
    const shuffled = allTags.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 10); // max 10 random tags
    setTagOptions(selected);
  }, [galleries]);

  useEffect(() => {
    let filtered = [...galleries];

    if (searchTerm.trim()) {
      const terms = searchTerm
        .toLowerCase()
        .split(/[\s,]+/)
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      filtered = filtered.filter((g) =>
        terms.some(
          (term) =>
            g.name.toLowerCase().includes(term) ||
            g.tags?.some((tag) => tag.toLowerCase().includes(term)) ||
            g.collaborators?.some((c) =>
              `${c.firstName} ${c.lastName}`.toLowerCase().includes(term),
            ),
        ),
      );
    }

    if (roleFilter === 'owning') {
      filtered = filtered.filter((g) => g.owner?._id === user?._id);
    } else if (roleFilter === 'collaborating') {
      filtered = filtered.filter((g) => g.collaborators?.some((c) => c._id === user?._id));
    }

    if (selectedTags.length > 0) {
      filtered = filtered.filter((g) => selectedTags.every((tag) => g.tags?.includes(tag)));
    }

    setFilteredGalleries(filtered);
  }, [searchTerm, galleries, roleFilter, selectedTags, user]);

  const handleDeleteGallery = async (galleryId) => {
    if (!window.confirm('Are you sure you want to delete this gallery?')) return;

    try {
      const res = await fetch(`/api/galleries/${galleryId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await res.json();
      if (res.ok) {
        setGalleries((prev) => prev.filter((g) => g._id !== galleryId));
        setFilteredGalleries((prev) => prev.filter((g) => g._id !== galleryId));
      } else {
        alert(data.error || 'Failed to delete gallery');
      }
    } catch (err) {
      console.error('Error deleting gallery:', err.message);
      alert('Error deleting gallery');
    }
  };

  return (
    <Box p={4} maxW="100%" mx="auto">
      <Flex justifyContent="center" alignItems="center" px={4} pt={4} position="relative">
        <Text fontWeight="bold" fontSize="2xl" textAlign="center">
          {user ? `${user.firstName} ${user.lastName}'s Galleries` : `${username}'s Galleries`}
        </Text>

        <Flex position="absolute" right={4} gap={2}>
          {currentUser && currentUser.username === username && (
            <Button
              colorScheme="green"
              ml={5}
              mb={6}
              onClick={() => (window.location.href = '/create/gallery')}
            >
              Create new gallery
            </Button>
          )}

          <Circle size="30px" bg="yellow.400" />
          <Circle size="30px" bg="green.400" />
        </Flex>
      </Flex>

      <Flex mt={4} mb={6} gap={4} wrap="wrap" justify="center">
        <Input
          placeholder="Search by name, tags, or collaborators..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          maxW="350px"
        />
        <Select
          placeholder="Filter by role"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          maxW="200px"
        >
          <option value="owning">Owning</option>
          <option value="collaborating">Collaborating</option>
        </Select>
      </Flex>

      {tagOptions.length > 0 && (
        <Wrap spacing={2} mb={4} justify="center">
          {tagOptions.map((tag) => (
            <WrapItem key={tag}>
              <Button
                size="sm"
                borderRadius="full"
                variant={selectedTags.includes(tag) ? 'solid' : 'outline'}
                colorScheme="purple"
                onClick={() =>
                  setSelectedTags((prev) =>
                    prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
                  )
                }
              >
                {tag}
              </Button>
            </WrapItem>
          ))}
        </Wrap>
      )}

      {loading ? (
        <Flex justify="center">
          <Spinner size="xl" />
        </Flex>
      ) : filteredGalleries.length === 0 ? (
        <Text>No galleries found.</Text>
      ) : (
        <Flex wrap="wrap" justify="center" gap={8}>
          {filteredGalleries.map((gallery) => (
            <Box
              key={gallery._id}
              w="600px"
              bg="gray.100"
              borderRadius="md"
              boxShadow="md"
              overflow="hidden"
              border="1px solid #ccc"
              _hover={{ boxShadow: 'lg', transform: 'scale(1.02)' }}
              transition="all 0.2s"
              display="flex"
              flexDirection="column"
              cursor="pointer"
              onClick={() => (window.location.href = `/galleries/${gallery._id}`)}
            >
              <Box h="210px" bg="gray.300" mb={3}>
                {gallery.coverPhoto ? (
                  <Image
                    src={gallery.coverPhoto}
                    alt={gallery.name}
                    objectFit="cover"
                    w="100%"
                    h="100%"
                  />
                ) : gallery.products?.[0]?.images?.[0] ? (
                  <Image
                    src={gallery.products[0].images[0]}
                    alt={gallery.name}
                    objectFit="cover"
                    w="100%"
                    h="100%"
                  />
                ) : (
                  <Flex align="center" justify="center" h="100%" bg="gray.400">
                    <Text>No cover photo</Text>
                  </Flex>
                )}
              </Box>

              <Box
                textAlign="center"
                py={3}
                px={2}
                display="flex"
                flexDir="column"
                justifyContent="space-between"
                flex="1"
              >
                <Text fontWeight="bold" isTruncated>
                  {gallery.name}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  {gallery.products?.length || 0} products
                </Text>
                <Text fontSize="sm" mt={1} isTruncated>
                  <strong>Creator:</strong> {gallery.owner?.firstName} {gallery.owner?.lastName}
                </Text>
                {gallery.collaborators?.length > 0 && (
                  <Text fontSize="sm" color="blue.500" isTruncated>
                    <strong>Collaborators:</strong>{' '}
                    {gallery.collaborators.map((c) => `${c.firstName} ${c.lastName}`).join(', ')}
                  </Text>
                )}
                {gallery.tags?.length > 0 && (
                  <Text fontSize="sm" color="purple.600" isTruncated>
                    <strong>Tags:</strong> {gallery.tags.join(', ')}
                  </Text>
                )}

                {}
                {currentUser && gallery.owner._id === currentUser._id && (
                  <Button
                    mt={2}
                    maxW={'150px'}
                    alignSelf="center"
                    colorScheme="red"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteGallery(gallery._id);
                    }}
                  >
                    Delete Gallery
                  </Button>
                )}
              </Box>
            </Box>
          ))}
        </Flex>
      )}
    </Box>
  );
};

export default UserAllGalleriesPage;
