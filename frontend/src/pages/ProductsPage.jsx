import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Flex,
  Text,
  Image,
  Select,
  Input,
  Button,
  Grid,
} from "@chakra-ui/react";
import RectangleShape from "../assets/rectangleShape";

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [sortOption, setSortOption] = useState("");
  const [filterText, setFilterText] = useState("");
  const [filterGallery, setFilterGallery] = useState("");
  const [searchBy, setSearchBy] = useState("name");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      const data = await response.json();
      setProducts(data.products || []);
      setFilteredProducts(data.products || []);
    } catch (error) {
      console.error("Error fetching products:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSortChange = (e) => setSortOption(e.target.value);

  const handleFilterChange = (e) => setFilterText(e.target.value);

  const handleGalleryFilter = (e) => setFilterGallery(e.target.value);

  useEffect(() => {
    let updatedProducts = [...products];

    updatedProducts = updatedProducts.filter((product) => {
      const matchesName =
        searchBy === "name"
          ? product.name.toLowerCase().includes(filterText.toLowerCase())
          : true;
      const matchesCreator =
        searchBy === "creator"
          ? product.user?.firstName
              ?.toLowerCase()
              .includes(filterText.toLowerCase()) ||
            product.user?.lastName?.toLowerCase().includes(filterText.toLowerCase())
          : true;
      const matchesGallery = filterGallery
        ? product.gallery === filterGallery
        : true;

      return matchesName && matchesCreator && matchesGallery;
    });

    if (sortOption === "name") {
      updatedProducts.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOption === "price") {
      updatedProducts.sort((a, b) => a.price - b.price);
    }

    setFilteredProducts(updatedProducts);
  }, [products, sortOption, filterText, filterGallery, searchBy]);

  return (
    <Box>
      <RectangleShape
        bgColor="purple.300"
        title="All Products"
        minW="300px"
        maxW="300px"
        minH="80px"
        textAlign="left"
      />

      {/* Filter and sort bar */}
      <Flex mt={4} direction="row" justify="space-between" gap={4}>
        <Flex direction="row" alignItems="center" gap={4}>
          <RectangleShape
            bgColor="yellow.300"
            title="Search by"
            minW="100px"
            maxW="100px"
            minH="20px"
            textAlign="left"
          />
          <Select
            value={searchBy}
            onChange={(e) => setSearchBy(e.target.value)}
            w="150px"
            bg="gray.100"
          >
            <option value="name">Product Name</option>
            <option value="creator">Creator</option>
          </Select>
          <Input
            placeholder={`${searchBy}...`}
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            w="200px"
            bg="gray.100"
          />
        </Flex>
        <Select
          placeholder="Filter by gallery"
          value={filterGallery}
          onChange={(e) => setFilterGallery(e.target.value)}
          w="200px"
          bg="gray.100"
        >
          <option value="painting">Painting</option>
          <option value="sculpture">Sculpture</option>
          <option value="drawing">Drawing</option>
        </Select>
        <Select
          placeholder="Sort by"
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          w="200px"
          bg="gray.100"
        >
          <option value="name">Name</option>
          <option value="price">Price</option>
        </Select>
      </Flex>

      {/* Display products */}
      <Box px={4} mt={4}>
        {loading ? (
          <Text>Loading products...</Text>
        ) : filteredProducts.length === 0 ? (
          <Text mt={5} textAlign="center">
            No products found.
          </Text>
        ) : (
          <Grid
            templateColumns={{
              base: "repeat(1, 1fr)", // 1 coloană pe ecrane mici
              md: "repeat(2, 1fr)", // 2 coloane pe ecrane medii
              lg: "repeat(3, 1fr)", // 3 coloane pe ecrane mari
              xl: "repeat(4, 1fr)", // 4 coloane pe ecrane foarte mari
            }}
            gap={6}
          >
            {filteredProducts.map((product) => (
              <Box
                key={product._id}
                bg="gray.200"
                p={4}
                borderRadius="md"
                overflow="hidden"
              >
                <Box
                  width="100%"
                  height="300px"
                  bg="gray.300"
                  mb={4}
                  borderRadius="md"
                  overflow="hidden"
                >
                  {product.images?.[0] ? (
                    <Image
                      src={product.images[0]}
                      alt={`${product.name} cover photo`}
                      width="100%"
                      height="100%"
                      objectFit="cover"
                    />
                  ) : (
                    <Box
                      width="100%"
                      height="100%"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      bg="gray.400"
                    >
                      <Text>No cover photo available</Text>
                    </Box>
                  )}
                </Box>
                <Heading size="md" mb={2}>
                  {product.name}
                </Heading>
                <Text mb={1}>${product.price}</Text>
                <Text mb={1}>Gallery: {product.gallery}</Text>
                <Text mb={1}>
                  Creator: {product.user?.firstName || "Unknown"}{" "}
                  {product.user?.lastName || ""}
                </Text>
                <Flex mt={2} justify="space-between">
                  <Button
                    colorScheme="teal"
                    onClick={() => alert(`Added ${product.name} to favorites!`)}
                  >
                    Favorite
                  </Button>
                  <Button
                    colorScheme="blue"
                    onClick={() => alert(`Added ${product.name} to cart!`)}
                  >
                    Add to Cart
                  </Button>
                </Flex>
              </Box>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default ProductsPage;
