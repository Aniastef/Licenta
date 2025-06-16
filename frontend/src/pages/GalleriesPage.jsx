import React, { useEffect, useState } from 'react';
import {
  Box,
  Text,
  Flex,
  Input,
  Select,
  Stack,
  Wrap,
  WrapItem,
  Button,
  SimpleGrid,
  HStack,
  Circle,
  Image,
  Tag, // Ensure Tag is imported if you decide to use Option 2 later
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { FaArrowUp } from 'react-icons/fa'; // Import nou

const GALLERIES_PER_PAGE = 12;
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
const galleryCategoryColorMap = {
  General: 'rgb(50, 206, 128)',
  Photography: 'rgb(58, 78, 160)',
  Painting: 'rgb(81, 144, 173)',
  Drawing: 'rgb(198, 175, 218)',
  Sketch: 'rgb(191, 89, 177)',
  Illustration: 'rgb(53, 183, 216)',
  'Digital Art': 'rgb(216, 88, 158)',
  'Pixel Art': 'rgb(220, 161, 218)',
  '3D Art': 'rgb(213, 193, 150)',
  Animation: 'rgb(134, 215, 81)',
  Graffiti: 'rgb(116, 200, 177)',
  Calligraphy: 'rgb(78, 131, 164)',
  Typography: 'rgb(194, 117, 158)',
  Collage: 'rgb(72, 87, 122)',
  'Mixed Media': 'rgb(147, 78, 104)',
  Sculpture: 'rgb(73, 96, 176)',
  Installation: 'rgb(73, 167, 131)',
  Fashion: 'rgb(213, 197, 156)',
  Textile: 'rgb(211, 57, 158)',
  Architecture: 'rgb(194, 67, 86)',
  'Interior Design': 'rgb(203, 140, 77)',
  'Product Design': 'rgb(84, 61, 88)',
  'Graphic Design': 'rgb(167, 144, 200)',
  'UI/UX': 'rgb(106, 101, 172)',
  Music: 'rgb(55, 146, 114)',
  Instrumental: 'rgb(60, 137, 162)',
  Vocal: 'rgb(183, 117, 78)',
  Rap: 'rgb(139, 101, 87)',
  'Spoken Word': 'rgb(69, 175, 160)',
  Podcast: 'rgb(138, 210, 206)',
  'Sound Design': 'rgb(56, 60, 84)',
  Film: 'rgb(96, 165, 74)',
  'Short Film': 'rgb(50, 101, 106)',
  Documentary: 'rgb(135, 209, 120)',
  Cinematography: 'rgb(172, 96, 94)',
  'Video Art': 'rgb(200, 108, 51)',
  Performance: 'rgb(98, 149, 186)',
  Dance: 'rgb(67, 135, 179)',
  Theatre: 'rgb(97, 156, 194)',
  Acting: 'rgb(128, 183, 205)',
  Poetry: 'rgb(107, 116, 220)',
  Writing: 'rgb(122, 114, 166)',
  Essay: 'rgb(77, 201, 96)',
  Prose: 'rgb(172, 78, 89)',
  Fiction: 'rgb(167, 154, 168)',
  'Non-fiction': 'rgb(62, 95, 206)',
  Journal: 'rgb(217, 209, 220)',
  Comics: 'rgb(90, 218, 100)',
  Manga: 'rgb(85, 100, 167)',
  Zine: 'rgb(144, 190, 51)',
  'Fantasy Art': 'rgb(197, 187, 166)',
  Surrealism: 'rgb(187, 188, 168)',
  Realism: 'rgb(106, 182, 215)',
  Abstract: 'rgb(125, 177, 95)',
  Minimalism: 'rgb(183, 213, 183)',
  Expressionism: 'rgb(89, 193, 69)',
  'Pop Art': 'rgb(86, 52, 125)',
  'Concept Art': 'rgb(98, 69, 72)',
  'AI Art': 'rgb(119, 100, 120)',
  Experimental: 'rgb(147, 192, 176)',
  'Political Art': 'rgb(127, 100, 152)',
  'Activist Art': 'rgb(168, 194, 100)',
  'Environmental Art': 'rgb(139, 61, 59)',
};

const ExploreGalleries = () => {
  const [galleries, setGalleries] = useState([]);
  const [filteredGalleries, setFilteredGalleries] = useState([]);
  const [filterText, setFilterText] = useState('');
  const [searchBy, setSearchBy] = useState('name');
  const [filterTags, setFilterTags] = useState([]); // This state is not currently used in filtering, consider removing if not needed.
  const [sortOption, setSortOption] = useState('name');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [sortDirection, setSortDirection] = useState('asc');
  const [filterCategories, setFilterCategories] = useState([]);
  const getCategoryColor = (category) => galleryCategoryColorMap[category] || 'gray';

  const [showScrollButton, setShowScrollButton] = useState(false);

  useEffect(() => {
    fetchGalleries();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollButton(true);
      } else {
        setShowScrollButton(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const fetchGalleries = async () => {
    try {
      const res = await fetch('/api/galleries', { credentials: 'include' });
      const data = await res.json();
      setGalleries(data.galleries || []);
    } catch (err) {
      console.error('Error fetching galleries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let updated = [...galleries];
    const lowerFilterText = filterText.toLowerCase();

    updated = updated.filter((g) => {
      let matchSearch = true;
      let matchCategory = true; // Initialize matchCategory to true

      // Category filtering (always apply if categories are selected)
      if (filterCategories.length > 0) {
        // Here, g.category is an array, so we check if ANY of its categories are in filterCategories
        matchCategory = g.category?.some(cat => filterCategories.includes(cat));
      }

      // Text search filtering based on searchBy
      if (lowerFilterText) { // Only apply text search if filterText is not empty
        if (searchBy === 'name') {
          matchSearch = (g.name || '').toLowerCase().includes(lowerFilterText);
        } else if (searchBy === 'creator') {
          const creatorName = `${g.owner?.firstName || ''} ${g.owner?.lastName || ''}`.toLowerCase();
          matchSearch = creatorName.includes(lowerFilterText);
        } else if (searchBy === 'collaborators') {
          matchSearch = (g.collaborators || []).some((c) =>
            `${c.firstName || ''} ${c.lastName || ''}`.toLowerCase().includes(lowerFilterText)
          );
        } else if (searchBy === 'tags') {
          matchSearch = (g.tags || []).some((tag) => tag.toLowerCase().includes(lowerFilterText));
        }
      }

      return matchSearch && matchCategory;
    });

    updated.sort((a, b) => {
      if (sortOption === 'name') {
        return sortDirection === 'asc'
          ? (a.name || '').localeCompare(b.name || '')
          : (b.name || '').localeCompare(a.name || '');
      } else if (sortOption === 'date') {
        return sortDirection === 'asc'
          ? new Date(a.createdAt) - new Date(b.createdAt)
          : new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortOption === 'products') {
        return sortDirection === 'asc'
          ? (a.products?.length || 0) - (b.products?.length || 0)
          : (b.products?.length || 0) - (a.products?.length || 0);
      } else {
        return 0;
      }
    });

    setFilteredGalleries(updated);
    setCurrentPage(1);
  }, [galleries, filterText, searchBy, sortOption, sortDirection, filterCategories]); // Removed filterTags as it's unused in the filtering logic

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const paginated = filteredGalleries.slice(
    (currentPage - 1) * GALLERIES_PER_PAGE,
    currentPage * GALLERIES_PER_PAGE,
  );

  const totalPages = Math.ceil(filteredGalleries.length / GALLERIES_PER_PAGE);

  return (
    <Box p={4}>
      <Flex justifyContent="center" alignItems="center" px={4} pt={4} position="relative">
        <Text fontWeight="bold" fontSize="2xl" textAlign="center">
          Explore Galleries
        </Text>
        <Flex position="absolute" right={4} gap={2}>
          <Circle size="30px" bg="yellow.400" />
          <Circle size="30px" bg="green.400" />
        </Flex>
      </Flex>

      <Flex justify="space-between" align="center" my={4} wrap="wrap">
        <HStack spacing={4} mb={2}>
          <Text>Search by:</Text>
          <Select value={searchBy} onChange={(e) => setSearchBy(e.target.value)} w="160px">
            <option value="name">Gallery name</option>
            <option value="creator">Creator</option>
            <option value="collaborators">Collaborators</option>
            <option value="tags">Tags</option>
          </Select>
          <Input
            placeholder={`Search by ${searchBy}...`}
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            w="250px"
          />
        </HStack>

        <HStack spacing={2}>
          <Text>Sort by:</Text>
          <Select value={sortOption} onChange={(e) => setSortOption(e.target.value)} w="200px">
            <option value="name">Name</option>
            <option value="products">Number of artworks</option>
            <option value="date">Creation date</option>
          </Select>

          <Button onClick={() => setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))}>
            {sortDirection === 'asc' ? '↑' : '↓'}
          </Button>
        </HStack>
      </Flex>

      <Flex direction={{ base: 'column', md: 'row' }} gap={6}>
        {/* Sidebar */}
        <Box w="220px" p={4} borderWidth={1} borderRadius="lg">
          <Text fontWeight="bold">Filter by Category</Text>
          <Wrap spacing={2} mt={2}>
            {GALLERY_CATEGORIES.map((cat) => {
              const isSelected = filterCategories.includes(cat);
              return (
                <WrapItem key={cat}>
                  <Button
                    size="sm"
                    width="100%"
                    borderRadius="full"
                    bg={isSelected ? '#2B6CB0' : galleryCategoryColorMap[cat]}
                    color={isSelected ? 'white' : 'black'}
                    _hover={{ opacity: 0.8 }}
                    onClick={() =>
                      setFilterCategories((prev) =>
                        prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
                      )
                    }
                  >
                    {cat}
                  </Button>
                </WrapItem>
              );
            })}
          </Wrap>
        </Box>

        {/* Gallery List */}
        <Box flex={1}>
          {loading ? (
            <Text>Loading...</Text>
          ) : paginated.length === 0 ? (
            <Text>No galleries found.</Text>
          ) : (
            <>
<SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>                {paginated.map((gallery) => (
                  <Link to={`/galleries/${gallery._id}`} key={gallery._id}>
                    <Box
                      p={0}
                      bg="gray.100"
                      borderRadius="md"
                      boxShadow="md"
                      overflow="hidden"
                      border="1px solid #ccc"
                      _hover={{ boxShadow: 'lg', transform: 'scale(1.02)' }}
                      transition="all 0.2s"
                      cursor="pointer"
                      h="100%"
                      display="flex"
                      flexDirection="column"
                    >
                      <Box h="200px" bg="gray.300">
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
                          <Flex align="center" justify="center" h="100%">
                            <Text>No image</Text>
                          </Flex>
                        )}
                      </Box>

                      <Box textAlign="center" py={3}>
                        <Text
                          fontWeight="bold"
                          noOfLines={1} // Truncate with ellipsis for gallery name
                        >
                          {gallery.name}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          {gallery.products?.length || 0} products
                        </Text>
                        <Text fontSize="sm" mt={1}>
                          <strong>Creator:</strong> {gallery.owner?.firstName}{' '}
                          {gallery.owner?.lastName}
                        </Text>

                        {/* MODIFIED: Display categories joined by comma */}
                        {gallery.category && gallery.category.length > 0 && (
                          <Text fontSize="sm" color="teal.600">
                            <strong>Category:</strong> {gallery.category.join(', ')}
                          </Text>
                        )}

                        {gallery.collaborators?.length > 0 && (
                          <Text fontSize="sm" color="blue.500">
                            <strong>Collaborators:</strong>{' '}
                            {gallery.collaborators
                              .map((c) => `${c.firstName} ${c.lastName}`)
                              .join(', ')}
                          </Text>
                        )}

                        {gallery.tags?.length > 0 && (
                          <Text fontSize="sm" color="purple.600">
                            <strong>Tags:</strong>{' '}
                            {gallery.tags.slice(0, 2).join(', ')}
                            {gallery.tags.length > 2 && '...'}
                          </Text>
                        )}
                      </Box>
                    </Box>
                  </Link>
                ))}
              </SimpleGrid>

              <Flex mt={6} align="center" justify="space-between">
                <Text>
                  {1 + (currentPage - 1) * GALLERIES_PER_PAGE} -{' '}
                  {Math.min(currentPage * GALLERIES_PER_PAGE, filteredGalleries.length)} of{' '}
                  {filteredGalleries.length} galleries
                </Text>
                <HStack spacing={2}>
                  <Button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    isDisabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  {[...Array(Math.min(3, totalPages)).keys()].map((i) => (
                    <Button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      colorScheme={currentPage === i + 1 ? 'blue' : undefined}
                    >
                      {i + 1}
                    </Button>
                  ))}
                  {totalPages > 3 && <Text>...</Text>}
                  <Button
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    isDisabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </HStack>
              </Flex>
            </>
          )}
        </Box>
      </Flex>

      {/* Butonul flotant de scroll to top */}
      {showScrollButton && (
        <Button
          onClick={scrollToTop}
          position="fixed"
          bottom="4"
          right="4"
          zIndex="banner"
          borderRadius="full"
          boxShadow="lg"
          p={0}
          w="50px"
          h="50px"
          bg="blue.500"
          color="white"
          _hover={{ bg: 'blue.600' }}
          aria-label="Scroll to top"
        >
          <FaArrowUp />
        </Button>
      )}
    </Box>
  );
};

export default ExploreGalleries;