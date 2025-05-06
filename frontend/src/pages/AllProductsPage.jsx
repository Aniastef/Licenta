// Pagina de produse cu filtre avansate, rating, taguri și paginare

import React, { useState, useEffect } from "react";
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
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { StarIcon } from "@chakra-ui/icons";

const PRODUCTS_PER_PAGE = 60;
const ALL_TAGS = ["Painting", "Music", "Dancing", "Acting", "BrrBrrPatatim", "a"];
const PRICE_RANGES = [
  { label: "Sub 1000", min: 0, max: 999 },
  { label: "1000 - 1500", min: 1000, max: 1500 },
  { label: "1500 - 2000", min: 1500, max: 2000 },
  { label: "2000 - 3000", min: 2000, max: 3000 },
  { label: "Peste 3000", min: 3001, max: Infinity },
];

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [searchBy, setSearchBy] = useState("name");
  const [filterForSale, setFilterForSale] = useState("");
  const [sortOption, setSortOption] = useState("createdAt");
  const [availability, setAvailability] = useState([]);
  const [mediaTypes, setMediaTypes] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [priceFilters, setPriceFilters] = useState([]);
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortDirection, setSortDirection] = useState("desc"); // "asc" | "desc"
  const [customMin, setCustomMin] = useState(0);
  const [customMax, setCustomMax] = useState(10000);
  
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products", {
        credentials: "include",
      });
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error("Error fetching products:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let updated = [...products];

    updated = updated.filter((p) => {
      const matchSearch =
        searchBy === "name"
          ? p.name.toLowerCase().includes(filterText.toLowerCase())
          : `${p.user?.firstName || ""} ${p.user?.lastName || ""}`
              .toLowerCase()
              .includes(filterText.toLowerCase());

      const matchSale =
        filterForSale === "forsale"
          ? p.forSale
          : filterForSale === "notforsale"
          ? !p.forSale
          : true;

      const matchAvailability = availability.every((val) => {
        if (val === "inStock") return p.quantity > 0;
        if (val === "forSale") return p.forSale;
        return true;
      });

      const matchMedia = mediaTypes.every((m) => {
        if (m === "images") return p.images?.length > 0;
        if (m === "videos") return p.videos?.length > 0;
        if (m === "audios") return p.audios?.length > 0;
        if (m === "writing") return p.writing?.length > 0;
        return true;
      });

      const price = p.price || 0;
      const matchPriceSlider = price >= priceRange[0] && price <= priceRange[1];
      const matchPriceFilters =
        priceFilters.length === 0 || priceFilters.some((range) => price >= range.min && price <= range.max);
      const matchRating =
        selectedRatings.length === 0 || selectedRatings.some((r) => Math.floor(p.averageRating || 0) === r);

      const matchTags =
        selectedTags.length === 0 || selectedTags.some((tag) => p.tags?.includes(tag));

        return (
          matchSearch &&
          matchSale &&
          matchAvailability &&
          matchMedia &&
          matchPriceSlider &&
          matchPriceFilters &&
          matchRating &&
          matchTags
        );
        
    });

    if (sortOption === "price") {
      updated.sort((a, b) =>
        sortDirection === "asc"
          ? (a.price || 0) - (b.price || 0)
          : (b.price || 0) - (a.price || 0)
      );
    } else if (sortOption === "rating") {
      updated.sort((a, b) =>
        sortDirection === "asc"
          ? (a.averageRating || 0) - (b.averageRating || 0)
          : (b.averageRating || 0) - (a.averageRating || 0)
      );
    } else if (sortOption === "stock") {
      updated.sort((a, b) =>
        sortDirection === "asc"
          ? (a.quantity || 0) - (b.quantity || 0)
          : (b.quantity || 0) - (a.quantity || 0)
      );
    } else if (sortOption === "likes") {
      updated.sort((a, b) =>
        sortDirection === "asc"
          ? (a.favoritedBy?.length || 0) - (b.favoritedBy?.length || 0)
          : (b.favoritedBy?.length || 0) - (a.favoritedBy?.length || 0)
      );
    } else if (sortOption === "name") {
      updated.sort((a, b) =>
        sortDirection === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name)
      );
    } else {
      updated.sort((a, b) =>
        sortDirection === "asc"
          ? new Date(a.createdAt) - new Date(b.createdAt)
          : new Date(b.createdAt) - new Date(a.createdAt)
      );
    }
    
    

    setFilteredProducts(updated);
    setCurrentPage(1);
  }, [products, filterText, searchBy, filterForSale, sortOption, sortDirection, availability, mediaTypes, priceRange, priceFilters, selectedRatings, selectedTags]);

  const togglePriceFilter = (range) => {
    setPriceFilters((prev) =>
      prev.some((r) => r.label === range.label)
        ? prev.filter((r) => r.label !== range.label)
        : [...prev, range]
    );
  };

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);

  return (
    <Box p={4}>
       <Flex justifyContent="center" alignItems="center" px={4} pt={4} position="relative">
             <Text fontWeight="bold" fontSize="2xl" textAlign="center">
                All Products
             </Text>
             <Flex position="absolute" right={4} gap={2}>
               <Circle size="30px" bg="yellow.400" />
               <Circle size="30px" bg="green.400" />
             </Flex>
           </Flex>
      <Flex justify="space-between" align="center" mb={4} wrap="wrap">
        <HStack spacing={4} mb={2}>
          <Text>Search by:</Text>
          <Select value={searchBy} onChange={(e) => setSearchBy(e.target.value)} w="160px">
            <option value="name">Product Name</option>
            <option value="creator">Creator</option>
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
  <Select
  value={sortOption}
  onChange={(e) => setSortOption(e.target.value)}
  w="180px"
>
  <option value="createdAt">Created</option>
  <option value="name">Name</option>
  <option value="price">Price</option>
  <option value="rating">Rating</option>
  <option value="stock">Stock</option>
  <option value="likes">Likes</option>
</Select>


  <Button onClick={() => setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))}>
    {sortDirection === "asc" ? "↑" : "↓"}
  </Button>
</HStack>


      </Flex>

      <Flex direction={{ base: "column", md: "row" }} gap={6}>
        <Box minW="260px" p={4} borderWidth={1} borderRadius="lg">
        <Text fontWeight="bold">Pret</Text>
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
        const parsed = parseInt(val || "0", 10);
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
        const parsed = parseInt(val || "0", 10);
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
                    prev.includes(star)
                      ? prev.filter((s) => s !== star)
                      : [...prev, star]
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

          <Text fontWeight="bold">Art Type</Text>
          <Stack spacing={2} mt={2}>
            {ALL_TAGS.map((tag) => (
              <Button
                key={tag}
                borderRadius={20}
                colorScheme={
                  tag === "Painting" ? "red" :
                  tag === "Music" ? "green" :
                  tag === "Dancing" ? "yellow" :
                  tag === "Acting" ? "cyan" :
                  tag === "BrrBrrPatatim" ? "orange" : "brown"
                }
                size="sm"
                onClick={() =>
                  setSelectedTags((prev) =>
                    prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
                  )
                }
              >
                {tag}
              </Button>
            ))}
          </Stack>
        </Box>

        <Box flex={1}>
          {loading ? (
            <Text>Loading...</Text>
          ) : paginatedProducts.length === 0 ? (
            <Text>No products found.</Text>
          ) : (
            <>
              <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={5}>
                {paginatedProducts.map((product) => (
                  <Link to={`/products/${product._id}`} key={product._id}>
                  <Box
                    p={0}
                    bg="gray.100"
                    borderRadius="md"
                    boxShadow="0 10px 10px rgba(0, 0, 0, 0.1)" // sau folosește Chakra shortcut: boxShadow="md"
                    overflow="hidden"
                    border="1px solid #ccc"
                    _hover={{ boxShadow: "lg", transform: "scale(1.02)" }}
                     transition="all 0.2s"
                      cursor="pointer"
                      h="100%"
                      display="flex"
                      flexDirection="column"
                  >
                    <Box
                       h="250px" bg="gray.100"
                       borderWidth="1px"
                    >
                     {product.images?.[0] ? (
  <Image
    src={product.images[0]}
    alt={product.name}
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
    {product.name}
  </Flex>
)}

                    </Box>
                
<Box textAlign="center" py={3}   minH="150px">
                      <Text fontWeight="bold">{product.name}</Text>
                      <Text color="gray.500" fontSize="sm">
                        <strong>Artist:</strong> {product.user?.firstName || "-"} {product.user?.lastName || ""}
                      </Text>
                      {/* <Text fontSize="xs" color="gray.600">
                        Created: {new Date(product.createdAt).toLocaleString("ro-RO", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Text> */}

                      {product.price >0 && (
                           <Button
                          size="sm"
                          mt={1}
                          bg="green"
                          color="white"
                          borderRadius="20px"
                          _hover={{ bg: "#766a31" }}
                        >
                        Price: {product.forSale ? `${product.price} RON` : "N/A"}
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
                    
                      {product.favoritedBy?.length > 0 && (
                        <Text fontSize="sm" color="red.500">
                          Likes: {product.favoritedBy.length}
                        </Text>
                      )}

                    </Box>
                  </Box>
                </Link>
                
                ))}
              </SimpleGrid>

              <Flex mt={6} align="center" justify="space-between">
                <Text>
                  {1 + (currentPage - 1) * PRODUCTS_PER_PAGE} - {Math.min(currentPage * PRODUCTS_PER_PAGE, filteredProducts.length)} din {filteredProducts.length} produse
                </Text>
                <HStack spacing={2}>
                  <Button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} isDisabled={currentPage === 1}>
                    Pagina anterioară
                  </Button>
                  {[...Array(Math.min(3, totalPages)).keys()].map((i) => (
                    <Button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      colorScheme={currentPage === i + 1 ? "blue" : undefined}
                    >
                      {i + 1}
                    </Button>
                  ))}
                  {totalPages > 3 && <Text>...</Text>}
                  <Button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} isDisabled={currentPage === totalPages}>
                    Pagina următoare
                  </Button>
                </HStack>
              </Flex>
            </>
          )}
        </Box>
      </Flex>
    </Box>
  );
};

export default ProductsPage;
