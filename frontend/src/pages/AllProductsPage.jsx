// Pagina de produse cu filtre avansate, rating, taguri și paginare

import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Flex,
  Text,
  Image,
  Select,
  Input,
  Grid,
  Tag,
  Checkbox,
  CheckboxGroup,
  Stack,
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  VStack,
  Button,
  HStack,
  Divider,
  SimpleGrid,
  Icon,
  Circle,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { StarIcon } from '@chakra-ui/icons';
import { useLocation } from 'react-router-dom';
import { FaArrowUp } from 'react-icons/fa'; // Import nou

const PRODUCTS_PER_PAGE = 60;
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

const categoryColorMap = {
  General: 'rgb(13,179,119)',
  Photography: 'rgb(162,165,195)',
  Painting: 'rgb(40,117,236)',
  Drawing: 'rgb(104,29,114)',
  Sketch: 'rgb(77,190,167)',
  Illustration: 'rgb(51,220,166)',
  'Digital Art': 'rgb(10,5,110)',
  'Pixel Art': 'rgb(63,109,249)',
  '3D Art': 'rgb(90,161,188)',
  Animation: 'rgb(214,182,182)',
  Graffiti: 'rgb(3,241,128)',
  Calligraphy: 'rgb(210,232,99)',
  Typography: 'rgb(96,56,80)',
  Collage: 'rgb(194,175,189)',
  'Mixed Media': 'rgb(103,189,162)',
  Sculpture: 'rgb(129,126,137)',
  Installation: 'rgb(124,216,251)',
  Fashion: 'rgb(147,224,2)',
  Textile: 'rgb(146,44,136)',
  Architecture: 'rgb(45,36,43)',
  'Interior Design': 'rgb(183,13,57)',
  'Product Design': 'rgb(53,43,177)',
  'Graphic Design': 'rgb(243,106,119)',
  'UI/UX': 'rgb(18,33,172)',
  Music: 'rgb(71,220,189)',
  Instrumental: 'rgb(198,128,17)',
  Vocal: 'rgb(54,56,30)',
  Rap: 'rgb(174,79,22)',
  'Spoken Word': 'rgb(218,183,29)',
  Podcast: 'rgb(71,150,63)',
  'Sound Design': 'rgb(234,245,185)',
  Film: 'rgb(186,233,2)',
  'Short Film': 'rgb(193,56,119)',
  Documentary: 'rgb(12,39,99)',
  Cinematography: 'rgb(216,194,21)',
  'Video Art': 'rgb(135,205,229)',
  Performance: 'rgb(148,70,169)',
  Dance: 'rgb(122,229,235)',
  Theatre: 'rgb(70,171,175)',
  Acting: 'rgb(135,83,247)',
  Poetry: 'rgb(248,236,89)',
  Writing: 'rgb(175,150,171)',
  Essay: 'rgb(14,52,206)',
  Prose: 'rgb(62,42,215)',
  Fiction: 'rgb(195,241,31)',
  'Non-fiction': 'rgb(53,192,165)',
  Journal: 'rgb(107,43,86)',
  Comics: 'rgb(38,91,181)',
  Manga: 'rgb(137,226,50)',
  Zine: 'rgb(200,98,250)',
  'Fantasy Art': 'rgb(19,241,5)',
  Surrealism: 'rgb(205,55,208)',
  Realism: 'rgb(171,194,101)',
  Abstract: 'rgb(227,83,219)',
  Minimalism: 'rgb(182,127,46)',
  Expressionism: 'rgb(151,30,82)',
  'Pop Art': 'rgb(222,216,170)',
  'Concept Art': 'rgb(249,133,177)',
  'AI Art': 'rgb(49,49,255)',
  Experimental: 'rgb(112,75,85)',
  'Political Art': 'rgb(50,14,57)',
  'Activist Art': 'rgb(246,20,155)',
  'Environmental Art': 'rgb(3,92,232)',
};
const PRICE_RANGES = [
  { label: 'Under 1000', min: 0, max: 999 },
  { label: '1000 - 1500', min: 1000, max: 1500 },
  { label: '1500 - 2000', min: 1500, max: 2000 },
  { label: '2000 - 3000', min: 2000, max: 3000 },
  { label: 'Over 3000', min: 3001, max: Infinity },
];

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [filterText, setFilterText] = useState('');
  const [searchBy, setSearchBy] = useState('title');
  const [filterForSale, setFilterForSale] = useState('');
  const [sortOption, setSortOption] = useState('createdAt');
  const [availability, setAvailability] = useState([]);
  const [mediaTypes, setMediaTypes] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [priceFilters, setPriceFilters] = useState([]);
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortDirection, setSortDirection] = useState('desc'); // "asc" | "desc"
  const [customMin, setCustomMin] = useState(0);
  const [customMax, setCustomMax] = useState(10000);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialCategory = queryParams.get('category');

  // Noul state pentru vizibilitatea butonului de scroll
  const [showScrollButton, setShowScrollButton] = useState(false);

  useEffect(() => {
    if (initialCategory && ALL_CATEGORIES.includes(initialCategory)) {
      setSelectedCategories([initialCategory]);
    }
  }, [initialCategory]);

  useEffect(() => {
    fetchProducts();
  }, []);

  // Noul useEffect pentru a gestiona vizibilitatea butonului de scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollButton(true);
      } else {
        setShowScrollButton(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    // Funcție de cleanup pentru a elimina event listener-ul la demontarea componentei
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products', {
        credentials: 'include',
      });
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let updated = [...products];

    updated = updated.filter((p) => {
      const matchSearch =
        searchBy === 'title'
          ? (p.title || '').toLowerCase().includes(filterText.toLowerCase())
          : searchBy === 'creator'
          ? `${p.user?.firstName || ''} ${p.user?.lastName || ''}`
              .toLowerCase()
              .includes(filterText.toLowerCase())
          : searchBy === 'tags'
          ? Array.isArray(p.tags) &&
            p.tags.some((tag) => (tag || '').toLowerCase().includes(filterText.toLowerCase()))
          : true;

      const matchSale =
        filterForSale === 'forsale'
          ? p.forSale
          : filterForSale === 'notforsale'
          ? !p.forSale
          : true;

      const matchAvailability = availability.every((val) => {
        if (val === 'inStock') return p.quantity > 0;
        if (val === 'forSale') return p.forSale;
        return true;
      });

      const matchMedia = mediaTypes.every((m) => {
        if (m === 'images') return p.images?.length > 0;
        if (m === 'videos') return p.videos?.length > 0;
        if (m === 'audios') return p.audios?.length > 0;
        if (m === 'writing') return p.writing?.length > 0;
        return true;
      });

      const price = p.price || 0;
      const matchPriceSlider = price >= priceRange[0] && price <= priceRange[1];
      const matchPriceFilters =
        priceFilters.length === 0 ||
        priceFilters.some((range) => price >= range.min && price <= range.max);
      const matchRating =
        selectedRatings.length === 0 ||
        selectedRatings.some((r) => Math.floor(p.averageRating || 0) === r);

      // MODIFICARE AICI: Permite selectarea mai multor categorii cu logica AND
      const matchCategories =
        selectedCategories.length === 0 ||
        (Array.isArray(p.category) &&
          selectedCategories.every((selectedCat) => p.category.includes(selectedCat)));

      return (
        matchSearch &&
        matchSale &&
        matchAvailability &&
        matchMedia &&
        matchPriceSlider &&
        matchPriceFilters &&
        matchRating &&
        matchCategories
      );
    });

    if (sortOption === 'price') {
      updated.sort((a, b) =>
        sortDirection === 'asc' ? (a.price || 0) - (b.price || 0) : (b.price || 0) - (a.price || 0),
      );
    } else if (sortOption === 'rating') {
      updated.sort((a, b) =>
        sortDirection === 'asc'
          ? (a.averageRating || 0) - (b.averageRating || 0)
          : (b.averageRating || 0) - (a.averageRating || 0),
      );
    } else if (sortOption === 'stock') {
      updated.sort((a, b) =>
        sortDirection === 'asc'
          ? (a.quantity || 0) - (b.quantity || 0)
          : (b.quantity || 0) - (a.quantity || 0),
      );
    } else if (sortOption === 'title') {
      updated.sort((a, b) =>
        sortDirection === 'asc' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title),
      );
    } else {
      updated.sort((a, b) =>
        sortDirection === 'asc'
          ? new Date(a.createdAt) - new Date(b.createdAt)
          : new Date(b.createdAt) - new Date(a.createdAt),
      );
    }

    setFilteredProducts(updated);
    setCurrentPage(1);
  }, [
    products,
    filterText,
    searchBy,
    filterForSale,
    sortOption,
    sortDirection,
    availability,
    mediaTypes,
    priceRange,
    priceFilters,
    selectedRatings,
    selectedCategories,
  ]);

  const togglePriceFilter = (range) => {
    setPriceFilters((prev) =>
      prev.some((r) => r.label === range.label)
        ? prev.filter((r) => r.label !== range.label)
        : [...prev, range],
    );
  };

  const toggleCategoryFilter = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    );
  };

  // Noua funcție pentru a derula la începutul paginii
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE,
  );

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);

  return (
    <Box p={4}>
      <Flex justifyContent="center" alignItems="center" px={4} pt={4} position="relative">
        <Text fontWeight="bold" fontSize="2xl" textAlign="center">
          All artworks
        </Text>
        <Flex position="absolute" right={4} gap={2}>
          <Circle size="30px" bg="yellow.400" />
          <Circle size="30px" bg="green.400" />
        </Flex>
      </Flex>
      <Flex justify="space-between" align="center" mb={4} wrap="wrap">
        <HStack spacing={4} mb={2}>
          <Text>Search by:</Text>
          <Select value={searchBy} onChange={(e) => setSearchBy(e.target.value)} w="180px">
            <option value="title">Artwork title</option>
            <option value="creator">Creator</option>
            <option value="tags">Tags</option>
          </Select>
          <Input
            placeholder={`Search this ${searchBy}...`}
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            w="250px"
          />
        </HStack>

        <HStack spacing={2}>
          <Text>Sort by:</Text>
          <Select value={sortOption} onChange={(e) => setSortOption(e.target.value)} w="180px">
            <option value="createdAt">Created</option>
            <option value="title">Title</option>
            <option value="price">Price</option>
            <option value="rating">Rating</option>
            <option value="stock">Stock</option>
          </Select>

          <Button onClick={() => setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))}>
            {sortDirection === 'asc' ? '↑' : '↓'}
          </Button>
        </HStack>
      </Flex>

      <Flex direction={{ base: 'column', md: 'row' }} gap={6}>
        <Box minW="260px" p={4} borderWidth={1} borderRadius="lg">
          <Text fontWeight="bold">Price</Text>
          <Stack spacing={1} mt={2}>
            {PRICE_RANGES.map((range) => (
              <Checkbox
                key={range.label}
                isChecked={priceFilters.some((r) => r.label === range.label)}
                onChange={() => togglePriceFilter(range)}
              >
                {range.label}
              </Checkbox>
            ))}
          </Stack>
          <Divider my={4} />
          <Text fontWeight="bold">Price Range</Text>
          <RangeSlider
            value={priceRange}
            min={0}
            max={10000}
            step={100}
            onChange={(val) => {
              setPriceRange(val);
              setCustomMin(val[0]);
              setCustomMax(val[1]);
            }}
          >
            <RangeSliderTrack>
              <RangeSliderFilledTrack />
            </RangeSliderTrack>
            <RangeSliderThumb index={0} />
            <RangeSliderThumb index={1} />
          </RangeSlider>

          <Flex mt={2} gap={2} align="center">
            <Input
              size="sm"
              type="text"
              w="80px"
              value={customMin}
              onChange={(e) => {
                const val = e.target.value;
                if (/^\d*$/.test(val)) {
                  setCustomMin(val);
                  const parsed = parseInt(val || '0', 10);
                  setPriceRange([parsed, priceRange[1]]);
                }
              }}
            />
            <Text>-</Text>
            <Input
              size="sm"
              type="text"
              w="80px"
              value={customMax}
              onChange={(e) => {
                const val = e.target.value;
                if (/^\d*$/.test(val)) {
                  setCustomMax(val);
                  const parsed = parseInt(val || '0', 10);
                  setPriceRange([priceRange[0], parsed]);
                }
              }}
            />
          </Flex>

          <Divider my={4} />

          <Text fontWeight="bold">Availability</Text>
          <CheckboxGroup value={availability} onChange={setAvailability}>
            <Stack spacing={1}>
              <Checkbox value="inStock">In Stock</Checkbox>
              <Checkbox value="forSale">For Sale</Checkbox>
            </Stack>
          </CheckboxGroup>

          <Divider my={4} />

          <Text fontWeight="bold">Media Type</Text>
          <CheckboxGroup value={mediaTypes} onChange={setMediaTypes}>
            <Stack spacing={1}>
              <Checkbox value="images">Images</Checkbox>
              <Checkbox value="videos">Videos</Checkbox>
              <Checkbox value="audios">Audio</Checkbox>
              <Checkbox value="writing">Writing</Checkbox>
            </Stack>
          </CheckboxGroup>

          <Divider my={4} />

          <Text fontWeight="bold">Review</Text>
          <Stack spacing={1}>
            {[5, 4, 3, 2, 1].map((star) => (
              <Checkbox
                key={star}
                isChecked={selectedRatings.includes(star)}
                onChange={() =>
                  setSelectedRatings((prev) =>
                    prev.includes(star) ? prev.filter((s) => s !== star) : [...prev, star],
                  )
                }
              >
                {Array(star)
                  .fill(null)
                  .map((_, i) => (
                    <StarIcon key={i} color="yellow.400" />
                  ))}
              </Checkbox>
            ))}
          </Stack>

          <Divider my={4} />

          <Text fontWeight="bold">Categories</Text>
          <Wrap spacing={2} mt={2} maxW="240px">
            {ALL_CATEGORIES.map((cat) => {
              const isSelected = selectedCategories.includes(cat);
              const bgColor = isSelected ? '#2B6CB0' : categoryColorMap[cat];
              const textColor = isSelected ? 'white' : 'black';

              return (
                <WrapItem key={cat}>
                  <Button
                    size="sm"
                    borderRadius="md"
                    bg={bgColor}
                    color={textColor}
                    _hover={{ opacity: 0.8 }}
                    onClick={() => toggleCategoryFilter(cat)}
                  >
                    {cat}
                  </Button>
                </WrapItem>
              );
            })}
          </Wrap>
        </Box>

        <Box flex={1}>
          {loading ? (
            <Text>Loading...</Text>
          ) : paginatedProducts.length === 0 ? (
            <Text>No artworks found.</Text>
          ) : (
            <>
              <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={5}>
                {paginatedProducts.map((product) => (
                  <Link to={`/products/${product._id}`} key={product._id}>
                    <Box
                      p={0}
                      bg="gray.100"
                      borderRadius="md"
                      boxShadow="0 10px 10px rgba(0, 0, 0, 0.1)"
                      overflow="hidden"
                      border="1px solid #ccc"
                      _hover={{ boxShadow: 'lg', transform: 'scale(1.02)' }}
                      transition="all 0.2s"
                      cursor="pointer"
                      h="100%"
                      display="flex"
                      flexDirection="column"
                    >
                      <Box h="280px" bg="gray.100" borderWidth="1px">
                        {product.images?.[0] ? (
                          <Image
                            src={product.images[0]}
                            alt={product.title}
                            w="100%"
                            h="100%"
                            objectFit="cover"
                          />
                        ) : product.videos?.[0] ? (
                          <Box
                            as="video"
                            src={product.videos[0]}
                            poster={
                              product.videos[0].includes('/upload/')
                                ? product.videos[0]
                                    .replace('/upload/', '/upload/so_1/')
                                    .replace(/\.(mp4|webm)$/, '.jpg')
                                : ''
                            }
                            muted
                            loop
                            autoPlay
                            playsInline
                            preload="none"
                            w="100%"
                            h="100%"
                            objectFit="cover"
                          />
                        ) : (
                          <Flex
                            align="center"
                            justify="center"
                            w="100%"
                            h="100%"
                            bg="gray.200"
                            color="gray.600"
                            fontWeight="bold"
                            fontSize="lg"
                          >
                            {product.title}
                          </Flex>
                        )}
                      </Box>

                      <Box textAlign="center" py={3} minH="150px">
                        {/* Apply truncation here */}
                        <Text
                          fontWeight="bold"
                          isTruncated // This Chakra UI prop applies overflow: hidden, white-space: nowrap, text-overflow: ellipsis
                          px={2} // Add some horizontal padding for better appearance
                        >
                          {product.title}
                        </Text>
                        <Text color="gray.500" fontSize="sm">
                          <strong>Artist:</strong> {product.user?.firstName || '-'}{' '}
                          {product.user?.lastName || ''}
                        </Text>
                        {Array.isArray(product.category) && product.category.length > 0 && (
                          <Text fontSize="sm" color="gray.600" mt={1}>
                            <strong>Category:</strong>{' '}
                            {product.category.slice(0, 2).join(', ')}
                            {product.category.length > 2 && '...'}
                          </Text>
                        )}

                        {product.forSale && product.price > 0 && (
                          <Button
                            size="sm"
                            mt={1}
                            bg="green"
                            color="white"
                            borderRadius="20px"
                            _hover={{ bg: '#766a31' }}
                          >
                            Price: {product.price.toFixed(2)} EUR
                          </Button>
                        )}

                        {product.averageRating > 0 && (
                          <Text mt={2} fontSize="sm" color="yellow.500">
                            ★ {product.averageRating.toFixed(1)}
                          </Text>
                        )}
                        {product.price > 0 && (
                          <Text mt={2} fontSize="sm" color="green">
                            <strong>Stock:</strong> {product.quantity} left
                          </Text>
                        )}
                      </Box>
                    </Box>
                  </Link>
                ))}
              </SimpleGrid>

              <Flex mt={6} align="center" justify="space-between">
                <Text>
                  {1 + (currentPage - 1) * PRODUCTS_PER_PAGE} -{' '}
                  {Math.min(currentPage * PRODUCTS_PER_PAGE, filteredProducts.length)} din{' '}
                  {filteredProducts.length} produse
                </Text>
                <HStack spacing={2}>
                  <Button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    isDisabled={currentPage === 1}
                  >
                    Last page
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
                    Next page
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

export default ProductsPage;