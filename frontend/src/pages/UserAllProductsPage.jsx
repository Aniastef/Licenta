import React, { useEffect, useState } from "react";
import {
  Box,
  Text,
  Flex,
  Input,
  Select,
  Checkbox,
  CheckboxGroup,
  Stack,
  Image,
  Spinner,
  Heading,
  Button,
  SimpleGrid,
  Circle,
} from "@chakra-ui/react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";

const UserAllProductsPage = () => {
  const { username } = useParams();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("latest");
  const [selectedMediaTypes, setSelectedMediaTypes] = useState([]);
  const [saleStatuses, setSaleStatuses] = useState([]); // ["forSale", "notForSale"]
  const [user, setUser] = useState(null); // nouă stare
  const currentUser = useRecoilValue(userAtom);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProducts();
  }, [username]);

  const fetchUserProducts = async () => {
    try {
      const res = await fetch(`/api/products/user/${username}`, {
        credentials: "include",
      });
      const data = await res.json();
      setProducts(data.products || []);
      setFilteredProducts(data.products || []);
      if (data.user) setUser(data.user); // salvează obiectul user
    } catch (err) {
      console.error("Error fetching user products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let updated = [...products];

    if (searchTerm.trim()) {
      updated = updated.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (sortOption === "price-asc") {
      updated.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortOption === "price-desc") {
      updated.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else {
      updated.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    if (selectedMediaTypes.length > 0) {
      updated = updated.filter((p) => {
        return selectedMediaTypes.every((type) => {
          if (type === "images") return Array.isArray(p.images) && p.images.length > 0;
          if (type === "videos") return Array.isArray(p.videos) && p.videos.length > 0;
          if (type === "audios") return Array.isArray(p.audios) && p.audios.length > 0;
          if (type === "writing") return Array.isArray(p.writing) && p.writing.length > 0;
          return false;
        });
      });
    }
    
    if (saleStatuses.length > 0) {
      updated = updated.filter((p) => {
        const isForSale = p.price > 0;
        return (
          (isForSale && saleStatuses.includes("forSale")) ||
          (!isForSale && saleStatuses.includes("notForSale"))
        );
      });
    }
    
    

    setFilteredProducts(updated);
  }, [searchTerm, sortOption, selectedMediaTypes, saleStatuses, products]);

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
  
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
        credentials: "include",
      });
  
      const data = await res.json();
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p._id !== productId));
      } else {
        alert(data.error || "Failed to delete product");
      }
    } catch (err) {
      console.error("Error deleting product:", err.message);
      alert("Error deleting product.");
    }
  };
  
  return (
    <Box p={4} maxW="1200px" mx="auto">
      <Flex justifyContent="center" alignItems="center" px={4} pt={4} position="relative">
  <Text fontWeight="bold" fontSize="2xl" textAlign="center">
  {user ? `${user.firstName} ${user.lastName}'s art pieces` : `${username}'s Products`}
</Text>

  <Flex position="absolute" right={4} gap={2}>
  {currentUser?.username?.toLowerCase() === username?.toLowerCase() && (
  <Button
    colorScheme="orange"
    ml={5}
    mb={4}
    onClick={() => window.location.href = "/create/product"}
  >
    Create new art piece
  </Button>
)}

    <Circle size="30px" bg="yellow.400" />
    <Circle size="30px" bg="green.400" />
  </Flex>
</Flex>
      <Flex mt={2} justify="space-between" align="center" mb={6} wrap="wrap" gap={4}>
        <Input
          placeholder="Search art pieces..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          maxW="300px"
        />
        <Select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          maxW="200px"
        >
          <option value="latest">Newest</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        
        </Select>
        <CheckboxGroup value={saleStatuses} onChange={setSaleStatuses}>
  <Stack direction="row" spacing={4}>
    <Checkbox value="forSale">For Sale</Checkbox>
    <Checkbox value="notForSale">Not For Sale</Checkbox>
  </Stack>
</CheckboxGroup>

        <CheckboxGroup
          value={selectedMediaTypes}
          onChange={setSelectedMediaTypes}
        >
          <Stack direction="row" spacing={4}>
            <Checkbox value="images">Image</Checkbox>
            <Checkbox value="videos">Video</Checkbox>
            <Checkbox value="audios">Audio</Checkbox>
            <Checkbox value="writing">Writing</Checkbox>
          </Stack>
        </CheckboxGroup>
      </Flex>

      {loading ? (
        <Flex justify="center">
          <Spinner size="xl" />
        </Flex>
      ) :filteredProducts.length === 1 ? (
        <Flex justify="center">
          <Link to={`/products/${filteredProducts[0]._id}`}>
            <Box
              bg="gray.100"
              borderRadius="md"
              boxShadow="md"
              overflow="hidden"
              border="1px solid #ccc"
              _hover={{ boxShadow: "lg", transform: "scale(1.02)" }}
              transition="all 0.2s"
              cursor="pointer"
              w="300px"
            >
       <Box
  w="270px"
  bg="gray.100"
  borderRadius="md"
  boxShadow="md"
  overflow="hidden"
  border="1px solid #ccc"
  _hover={{ boxShadow: "lg", transform: "scale(1.02)" }}
  transition="all 0.2s"
  cursor="pointer"
  onClick={() => navigate(`/products/${product._id}`)}
>
  <Box h="270px" bg="gray.200">
    {product.images?.[0] ? (
      <Image
        src={product.images[0]}
        alt={product.name}
        w="100%"
        h="100%"
        objectFit="cover"
      />
    ) : (
      <Flex align="center" justify="center" h="100%">
        <Text fontWeight="bold" fontSize="lg" color="gray.600">
          {product.name}
        </Text>
      </Flex>
    )}
  </Box>

  <Box py={3} px={2} textAlign="center">
    <Text fontWeight="bold" noOfLines={1}>{product.name}</Text>

    {product.forSale && (
      <Text fontSize="sm" color="green.600">
        {product.price} RON
      </Text>
    )}

    {product.quantity > 0 && (
      <Text fontSize="sm" color="gray.600">
        Stock: {product.quantity}
      </Text>
    )}

    {product.galleries?.length > 0 && (
      <Text fontSize="xs" color="purple.500">
        Gallery: {product.galleries[0].name}
      </Text>
    )}

    {currentUser?._id === user?._id && (
      <Button
        mt={2}
        size="sm"
        colorScheme="red"
        onClick={(e) => {
          e.stopPropagation(); // prevenim navigarea
          handleDeleteProduct(product._id);
        }}
      >
        Delete
      </Button>
    )}
  </Box>
</Box>


      
              <Box textAlign="center" py={3} px={2}>
                <Text fontWeight="bold" noOfLines={1}>{filteredProducts[0].name}</Text>
      
                {filteredProducts[0].forSale && filteredProducts[0].price > 0 && (
                  <Text fontSize="sm" color="green.600">
                    For Sale: {filteredProducts[0].price} RON
                  </Text>
                )}
      
                {filteredProducts[0].forSale && filteredProducts[0].price > 0 && (
                  <Text fontSize="sm" color="gray.600">
                    Stock: {filteredProducts[0].quantity}
                  </Text>
                )}
      
                {filteredProducts[0].galleries?.length > 0 && (
                  <Text fontSize="xs" color="purple.500" mt={1}>
                    Gallery: {filteredProducts[0].galleries[0].name || "-"}
                  </Text>
                )}
              
              {currentUser?._id === product.user?._id && (
  <Button
  mt={2}
  size="sm"
  colorScheme="red"
  variant="solid"
  onClick={() => handleDeleteProduct(product._id)}
>
  Delete
</Button>

)}



              </Box>
            </Box>
          </Link>
        </Flex>
      ) : (
        <Flex wrap="wrap" justify="center" gap={4}>
      <Flex wrap="wrap" justify="center" gap={4}>
  {filteredProducts.map((product) => (
    <Box
      key={product._id}
      w="270px"
      bg="gray.100"
      borderRadius="md"
      boxShadow="md"
      overflow="hidden"
      border="1px solid #ccc"
      _hover={{ boxShadow: "lg", transform: "scale(1.02)" }}
      transition="all 0.2s"
      cursor="pointer"
      onClick={() => navigate(`/products/${product._id}`)}
    >
      {/* imagine */}
      <Box h="270px" bg="gray.200">
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
            h="100%"
            color="gray.600"
            fontWeight="bold"
            fontSize="lg"
          >
            {product.name}
          </Flex>
        )}
      </Box>

      {/* detalii + buton */}
      <Box textAlign="center" py={3} px={2}>
        <Text fontWeight="bold" noOfLines={1}>{product.name}</Text>
        {product.forSale && product.price > 0 && (
          <Text fontSize="sm" color="green.600">
            For Sale: {product.price} RON
          </Text>
        )}
        {product.forSale && product.price > 0 && (
          <Text fontSize="sm" color="gray.600">
            Stock: {product.quantity}
          </Text>
        )}
        {product.galleries?.length > 0 && (
          <Text fontSize="xs" color="purple.500" mt={1}>
            Gallery: {product.galleries[0].name || "-"}
          </Text>
        )}

        {/* buton delete vizibil doar pentru owner */}
        {currentUser?._id === user?._id && (
          <Button
            mt={2}
            size="sm"
            colorScheme="red"
            onClick={(e) => {
              e.stopPropagation(); // oprește navigarea spre produs
              handleDeleteProduct(product._id);
            }}
          >
            Delete
          </Button>
        )}
      </Box>
    </Box>
  ))}
</Flex>


      </Flex>
      
      )}
      
    </Box>
  );
};

export default UserAllProductsPage;
