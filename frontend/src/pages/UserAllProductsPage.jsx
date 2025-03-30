import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
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
  useToast,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

export default function UserAllProductsPage() {
  const { username } = useParams();
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState("");
  const [sortOption, setSortOption] = useState("");

  useEffect(() => {
    const fetchUserProducts = async () => {
      try {
        const res = await fetch(`/api/products/user/${username}`, {
          credentials: "include", // 🔐 dacă folosești cookie-uri pentru autentificare
        });
        const data = await res.json();
        setProducts(data.products);
      } catch (error) {
        console.error("Error fetching user products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProducts();
  }, [username]);

  const handleRemoveProduct = async (productId) => {
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        credentials: "include", // 🔐 adaugă și aici
      });

      if (!res.ok) {
        throw new Error("Failed to remove product");
      }

      const removedProduct = products.find((product) => product._id === productId);

      toast({
        title: "Product Removed",
        description: `${removedProduct?.name || "Product"} was removed successfully.`,
        status: "warning",
        duration: 2000,
        isClosable: true,
        position: "top-right",
      });

      setProducts((prevProducts) => prevProducts.filter((product) => product._id !== productId));
    } catch (error) {
      console.error("Error removing product:", error);
      toast({
        title: "Error",
        description: "Failed to remove product.",
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "top-right",
      });
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(filterText.toLowerCase())
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOption === "price-asc") return a.price - b.price;
    if (sortOption === "price-desc") return b.price - a.price;
    return 0;
  });

  if (loading) return <Spinner size="xl" />;

  return (
    <Box p={6}>
      <Heading size="lg" mb={4}>{username}'s Products</Heading>
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
              <Button
                colorScheme="red"
                size="sm"
                mt={2}
                onClick={() => handleRemoveProduct(product._id)}
              >
                Remove Product
              </Button>
            </Box>
          ))}
        </Grid>
      )}
    </Box>
  );
}
