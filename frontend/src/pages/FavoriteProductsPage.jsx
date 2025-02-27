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
  useToast, // ✅ Importăm useToast
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

export default function FavoriteProductsPage() {
  const { username } = useParams();
  const toast = useToast(); // ✅ Inițializăm toast-ul
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState("");
  const [sortOption, setSortOption] = useState("");

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await fetch(`/api/users/favorites/${username}`);
        const data = await res.json();
        setFavoriteProducts(data);
      } catch (error) {
        console.error("Error fetching favorite products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [username]);

  const handleRemoveFavorite = async (productId) => {
    try {
      const res = await fetch(`/api/products/favorites/${productId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to remove product from favorites");
      }

      // Obținem produsul eliminat pentru notificare
      const removedProduct = favoriteProducts.find((product) => product._id === productId);

      // ✅ Afișăm notificarea (Toast)
      toast({
        title: "Removed from Favorites",
        description: `${removedProduct?.name || "Product"} was removed from your favorites.`,
        status: "warning",
        duration: 2000,
        isClosable: true,
        position: "top-right",
      });

      // Actualizează lista eliminând produsul
      setFavoriteProducts((prevProducts) =>
        prevProducts.filter((product) => product._id !== productId)
      );

      console.log(`Product ${productId} removed from favorites`);
    } catch (error) {
      console.error("Error removing product from favorites:", error);

      // ❌ Afișăm o notificare de eroare dacă eliminarea eșuează
      toast({
        title: "Error",
        description: "Failed to remove product from favorites.",
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "top-right",
      });
    }
  };

  // Funcție de filtrare după nume
  const filteredProducts = favoriteProducts.filter((product) =>
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
      <Heading size="lg" mb={4}>Favorite Products</Heading>

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
        <Text>No favorite products found.</Text>
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
                    onClick={() => handleRemoveFavorite(product._id)}
                    >
                    Remove from Favorites
                 </Button>

            </Box>
          ))}
        </Grid>
      )}
    </Box>
  );
}
