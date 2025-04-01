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
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import RectangleShape from "../assets/rectangleShape";

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [sortOption, setSortOption] = useState("");
  const [filterText, setFilterText] = useState("");
  const [filterGallery, setFilterGallery] = useState("");
  const [searchBy, setSearchBy] = useState("name");
  const [filterForSale, setFilterForSale] = useState("");
  const [loading, setLoading] = useState(true);

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
  const handleForSaleFilter = (e) => setFilterForSale(e.target.value);

  useEffect(() => {
    let updatedProducts = [...products];

    updatedProducts = updatedProducts.filter((product) => {
      const matchesName =
        searchBy === "name"
          ? product.name.toLowerCase().includes(filterText.toLowerCase())
          : true;

      const matchesCreator =
        searchBy === "creator"
          ? `${product.user?.firstName || ""} ${product.user?.lastName || ""}`
              .toLowerCase()
              .includes(filterText.toLowerCase()) ||
            `${product.user?.lastName || ""} ${product.user?.firstName || ""}`
              .toLowerCase()
              .includes(filterText.toLowerCase())
          : true;

      const matchesGallery = filterGallery
        ? product.gallery === filterGallery
        : true;

      const matchesForSale =
        filterForSale === "forsale"
          ? product.forSale
          : filterForSale === "notforsale"
          ? !product.forSale
          : true;

      return matchesName && matchesCreator && matchesGallery && matchesForSale;
    });

    if (sortOption === "name") {
      updatedProducts.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOption === "price") {
      updatedProducts.sort((a, b) => a.price - b.price);
    } else if (sortOption === "date") {
      updatedProducts.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    } else if (sortOption === "rating") {
      updatedProducts.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
    }

    setFilteredProducts(updatedProducts);
  }, [products, sortOption, filterText, filterGallery, searchBy, filterForSale]);

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
          onChange={handleGalleryFilter}
          w="200px"
          bg="gray.100"
        >
          <option value="painting">Painting</option>
          <option value="sculpture">Sculpture</option>
          <option value="drawing">Drawing</option>
        </Select>

        <Select
          placeholder="Filter by sale status"
          value={filterForSale}
          onChange={handleForSaleFilter}
          w="200px"
          bg="gray.100"
        >
          <option value="forsale">For Sale</option>
          <option value="notforsale">Not for Sale</option>
        </Select>

        <Select
          placeholder="Sort by"
          value={sortOption}
          onChange={handleSortChange}
          w="200px"
          bg="gray.100"
        >
          <option value="name">Name</option>
          <option value="price">Price</option>
          <option value="date">Date Created</option>
          <option value="rating">Rating</option>
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
              base: "repeat(1, 1fr)",
              md: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
              xl: "repeat(4, 1fr)",
            }}
            gap={6}
          >
            {filteredProducts.map((product) => (
              <Link to={`/products/${product._id}`} key={product._id}>
                <Box
                  bg="gray.200"
                  p={4}
                  borderRadius="md"
                  overflow="hidden"
                  _hover={{ transform: "scale(1.02)", transition: "0.2s" }}
                >
                  <Box
                    width="100%"
                    height="250px"
                    bg="gray.300"
                    mb={4}
                    borderRadius="md"
                    overflow="hidden"
                  >
                    {product.images?.length > 0 ? (
                      <Image
                        src={product.images[0]}
                        alt={`${product.name} cover`}
                        width="100%"
                        height="100%"
                        objectFit="cover"
                      />
                    ) : (
                      <Flex
                        width="100%"
                        height="100%"
                        align="center"
                        justify="center"
                        bg="gray.400"
                      >
                        <Text>No image available</Text>
                      </Flex>
                    )}
                  </Box>

                  <Heading size="md" mb={2}>{product.name}</Heading>
                  <Text mb={1}>{product.price} RON</Text>

                  {product.averageRating > 0 && (
                    <Text fontSize="sm" color="yellow.500" fontWeight="semibold" mt={1}>
                      {"★".repeat(Math.round(product.averageRating)) + "☆".repeat(5 - Math.round(product.averageRating))} ({product.averageRating}/5)
                    </Text>
                  )}

                  <Tag 
                    colorScheme={product.forSale ? (product.quantity > 0 ? "green" : "red") : "gray"}
                    mt={2}
                  >
                    {!product.forSale ? "Not for Sale" : product.quantity > 0 ? `Stock: ${product.quantity} left` : "Out of Stock"}
                  </Tag>
                </Box>
              </Link>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default ProductsPage;


//trebuie sa modific filtrele la final aici