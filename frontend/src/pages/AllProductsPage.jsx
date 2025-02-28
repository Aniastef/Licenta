import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Text,
  Image,
  Grid,
  Input,
  Select,
  Button,
  Flex,
  Spinner,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

export default function AllProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState("");
  const [sortOption, setSortOption] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`/api/products/all`);
        const data = await res.json();
        setProducts(data.products);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Funcție de filtrare după nume
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(filterText.toLowerCase())
  );

  // Funcție de sortare
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOption === "price-asc") return a.price - b.price;
    if (sortOption === "price-desc") return b.price - a.price;
    return 0;
  });

  if (loading) return <Spinner size="xl" />;

  return (
    <Box p={6}>
      <Heading size="lg" mb={4}>All Products</Heading>

      {/* 🛠️ Căutare și Filtrare */}
      <Flex mb={4} gap={4}>
        <Input
          placeholder="Search for a product..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          width="50%"
        />
        <Select
          placeholder="Sort by"
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          width="30%"
        >
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </Select>
      </Flex>

      {/* 🔥 Afișarea produselor */}
      {sortedProducts.length === 0 ? (
        <Text>No products found.</Text>
      ) : (
        <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4} mt={4}>
          {sortedProducts.map((product) => (
            <Box key={product._id} border="1px solid gray" borderRadius="md" p={3}>
              <RouterLink to={`/products/${product._id}`}>
                <Image
                  src={product.images?.[0] || "/placeholder.jpg"}
                  alt={product.name}
                  borderRadius="md"
                  w="100%"
                  h="150px"
                  objectFit="cover"
                />
                <Text mt={2} fontWeight="bold">{product.name}</Text>
                <Text fontSize="sm">{product.price} RON</Text>
              </RouterLink>
            </Box>
          ))}
        </Grid>
      )}
    </Box>
  );
}
