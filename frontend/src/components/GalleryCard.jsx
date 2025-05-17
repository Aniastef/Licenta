import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Flex,
  Button,
  Text,
  Image,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  Input,
  Circle,
  Collapse,
  Tag,
  useDisclosure,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { ReactSortable } from "react-sortablejs";
import { useToast } from "@chakra-ui/react";


const GalleryCard = ({ gallery, currentUserId, fetchGallery }) => {
  const [availableProducts, setAvailableProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [products, setProducts] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [visibleCount, setVisibleCount] = useState(20);
  const [expanded, setExpanded] = useState(false);
  const toast = useToast();

  const navigate = useNavigate();

  const isOwner = gallery?.owner?._id === currentUserId;
  const isCollaborator = gallery?.collaborators?.some((c) => c._id === currentUserId);
  const canEdit = isOwner || isCollaborator;

  useEffect(() => {
    if (!Array.isArray(gallery?.products)) return;

    const ordered = [...gallery.products].sort((a, b) => a.order - b.order);
    const isDifferent =
      products.length !== ordered.length ||
      products.some((p, i) => p.product._id !== ordered[i]?.product?._id);

    if (isDifferent && ordered.every((p) => p?.product?._id)) {
      setProducts(ordered);
    }
  }, [gallery.products]);

  useEffect(() => {
    const fetchAvailableProducts = async () => {
      try {
        const res = await fetch(`/api/products/not-in-gallery/${gallery._id}`);
        const data = await res.json();
        setAvailableProducts(data.products || []);
        setFilteredProducts(data.products || []);
      } catch (err) {
        console.error("Error fetching available products:", err);
      }
    };

    if (isOpen) {
      fetchAvailableProducts();
    }
  }, [isOpen, gallery._id]);

  const handleFilterChange = (e) => {
    const searchText = e.target.value.toLowerCase();
    setFilterText(searchText);
    const filtered = availableProducts.filter((product) =>
      product.name.toLowerCase().includes(searchText)
    );
    setFilteredProducts(filtered);
  };

  const addGalleryToFavorites = async () => {
    try {
      const res = await fetch("/api/users/favorites/gallery", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ galleryId: gallery._id }),
      });
  
      if (!res.ok) throw new Error("Failed to add gallery to favorites");
  
      toast({
        title: "Gallery added to favorites!",
        description: `${gallery.name} has been added.`,
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
  
      console.log("✅ Gallery added to favorites:", gallery._id);
    } catch (err) {
      console.error("Error adding gallery to favorites:", err);
  
      toast({
        title: "Error",
        description: "Could not add gallery to favorites.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    }
  };
  
 
  
  
  const addProductToGallery = async (productId) => {
    try {
      const res = await fetch(`/api/galleries/${gallery._id}/add-product/${productId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to add product");

      await fetchGallery();
      setAvailableProducts((prev) => prev.filter((product) => product._id !== productId));
      setFilteredProducts((prev) => prev.filter((product) => product._id !== productId));
    } catch (err) {
      console.error("Error adding product:", err);
    }
  };

  const removeProductFromGallery = async (productId) => {
    try {
      const res = await fetch(`/api/galleries/${gallery._id}/remove-product/${productId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to remove product");

      await fetchGallery();
    } catch (err) {
      console.error("Error removing product:", err);
    }
  };

  const addToFavorites = async (productId) => {
    try {
      const res = await fetch(`/api/users/favorites/move`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ productId }),
      });
  
      if (!res.ok) throw new Error("Failed to add to favorites");
  
      console.log("✅ Added to favorites:", productId);
    } catch (err) {
      console.error("Error adding to favorites:", err);
    }
  };
  

  const handleSort = async (newList) => {
    const orderedIds = newList.map((item) => item.product?._id).filter(Boolean);
  
    if (orderedIds.length === 0) {
      console.warn("⚠️ No product IDs to sort.");
      return;
    }
  
    try {
      const res = await fetch(`/api/galleries/${gallery._id}/reorder-products`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ orderedProductIds: orderedIds }),
      });
  
      if (!res.ok) {
        const data = await res.json();
        console.error("❌ Order update failed:", data.error);
      } else {
        await fetchGallery(); // actualizăm datele din server
      }
    } catch (err) {
      console.error("❌ Failed to update order", err);
    }
  };
  
  const handleDeleteGallery = async () => {
    if (!window.confirm("Are you sure you want to delete this gallery?")) return;
    try {
      const res = await fetch(`/api/galleries/${gallery._id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        toast({
          title: "Gallery deleted",
          description: `${gallery.name} was successfully deleted.`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        navigate("/"); // sau o altă rută relevantă după ștergere
      } else {
        alert(data.error || "Failed to delete gallery");
      }
    } catch (err) {
      console.error("Error deleting gallery:", err.message);
      alert("Error deleting gallery");
    }
  };
  
  
  

  return (
    <Flex  direction={"column"} >

<Flex justifyContent="space-between" px={4} pt={4} position="relative">
  <Text fontWeight="bold" fontSize="2xl" textAlign="center">
    {gallery.name || "Gallery Name"}
  </Text>
  
  <Flex alignItems="center" gap={4}>
  {currentUserId && !isOwner && (
  <Button colorScheme="yellow" onClick={addGalleryToFavorites}>
    Add Gallery to Favorites
  </Button>
)}

    {canEdit && (
      <>
        <Button colorScheme="green"  onClick={() => navigate(`/edit-gallery/${gallery._id}`)}>
          Edit Gallery
        </Button>
      </>
    )}
    {isOwner && (
  <>
    <Button
      colorScheme="red"
      onClick={handleDeleteGallery}
    >
      Delete Gallery
    </Button>
  </>
)}
    <Flex gap={2}>
      <Circle size="30px" bg="brown" />
      <Circle size="30px" bg="blue.300" />
    </Flex>
  </Flex>
</Flex>


<Box mt={2} borderRadius="md" overflow="hidden" w="100%" maxW="95%" mx="auto">
  <Box position="relative" paddingTop="30.125%"> {/* Aspect ratio 1200 / 398 */}
    <Image
      src={gallery.coverPhoto || "https://via.placeholder.com/800"}
      alt="Gallery Cover"
      objectFit="cover"
      position="absolute"
      top="0"
      left="0"
      width="100%"
      height="100%"
      borderRadius="md"
    />
  </Box>
</Box>


      <Flex justifyContent="space-between" mt={3}  px={10}>
      <Text fontSize="lg" fontWeight="bold">
       Created by: {`${gallery.owner?.firstName} ${gallery.owner?.lastName}`}
      </Text>
      
      {gallery.category && (
  <Text fontWeight="semibold" color="blue.600">
    Category: {gallery.category}
  </Text>
)}

      {canEdit && (
          <Button colorScheme="orange" onClick={onOpen}>Add Existing Product</Button>
         
      )}
      
      <Flex right={0} gap={2}>
    <Circle size="30px" bg="yellow" />
    <Circle size="30px" bg="green" />
  </Flex>
  

{/* aici chestii in paralel */}
      </Flex>

      <Flex justifyContent="space-between" px={10}>
        
      <Flex width={"100%"} direction="column" gap={2}>
      {gallery.collaborators?.length > 0 && (
        <Flex direction="row" gap={2}>
          <Text color="gray" ontWeight="bold" >Collaborators:</Text>
          {gallery.collaborators.map((user) => (
            <Text color="gray" key={user._id}>{`${user.firstName} ${user.lastName}`}</Text>
          ))}
        </Flex>
      )}
      
        {gallery.tags?.length > 0 && (
      <Flex direction="row" gap={2}>
        {gallery.tags.map((tag, idx) => (
          <Text key={idx} borderRadius="md" bg="gray.100" color="gray" px={2}>
            {tag}
          </Text>
        ))}
      </Flex>
    )}
     {gallery.description && (
  <>
    {gallery.description.length > 300 ? (
      <>
        <Collapse startingHeight={100} in={isDescriptionExpanded}>
          <Text whiteSpace="pre-wrap">{gallery.description}</Text>
        </Collapse>
        <Button
          variant="link"
          colorScheme="blue"

          onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
        >
          {isDescriptionExpanded ? "see less" : "see more"}
        </Button>
      </>
    ) : (
<Box
  className="quill-content"
  dangerouslySetInnerHTML={{ __html: gallery.description }}
/>
    )}
  </>
)}
<Flex direction={"row"} gap={2} mt={gallery.description?.length > 900 ? 4 : 2}>
</Flex>
<ReactSortable
  list={products}
  setList={setProducts}
  animation={200}
  onEnd={({ newIndex, oldIndex }) => {
    const newOrder = [...products];
    const movedItem = newOrder.splice(oldIndex, 1)[0];
    newOrder.splice(newIndex, 0, movedItem);
    setProducts(newOrder);
    handleSort(newOrder); // pasăm noua ordine
  }}
  style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '2rem',
    padding: '2rem',

  }}
>


{(expanded ? products : products.slice(0, visibleCount)).map((item) => {  const p = item.product;
  return (
    <Box
      key={p._id}
      border="2px solid"
      borderColor="gray.300"
      borderRadius="md"
      overflow="hidden"
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      boxShadow="md"
      _hover={{ boxShadow: "lg", transform: "scale(1.02)" }}
        transition="all 0.2s" cursor="pointer"
    onClick={() => navigate(`/products/${p._id}`)} 
    >
      {p.images?.[0] ? (
  <Image
    src={p.images[0]}
    alt={p.name}
    w="100%"
    h="250px"
    objectFit="cover"
  />
) : (
  <Flex
    w="100%"
    h="250px"
    alignItems="center"
    justifyContent="center"
    bg="gray.200"
  >
    <Text color="gray.500">No picture</Text>
  </Flex>
)}

     <Box display="flex" flexDirection="column" alignItems="center" p={3}>
      {/* Afișăm prețul doar dacă e de vânzare */}
        <Text fontWeight="semibold" textAlign="center">
    {p.name}
  </Text>
  <Text fontSize="sm" color="gray.600" textAlign="center">
  {p.forSale && p.price != null ? `Price: ${p.price} RON` : "Not for sale"}
</Text>


        {/* Afișăm tag-urile */}
        {p.tags?.length > 0 && (
  <Flex justifyContent="center" gap={1} mt={2}>
    {p.tags.slice(0, 3).map((tag, idx) => (
      <Tag size="sm" key={idx} colorScheme="gray">
        {tag}
      </Tag>
    ))}
    {p.tags.length > 3 && (
      <Tag size="sm" colorScheme="gray">
        +{p.tags.length - 3} more
      </Tag>
    )}
  </Flex>
)}

   {canEdit && (
                <Button   alignSelf="center"

                  colorScheme="red"
                  size="sm"
                  mt={2}
                  onClick={(e) => {
                    e.stopPropagation(); // 👉 previne propagarea click-ului
                    removeProductFromGallery(p._id);
                  }}
                >
                  Remove from Gallery
                </Button>
              )}
    
      </Box>
    </Box>
  );
})}

      </ReactSortable>
      {products.length > visibleCount && (
  <Flex justify="center" mt={4}>
    {!expanded ? (
      <Button onClick={() => setExpanded(true)} colorScheme="blue" variant="link">
        See more
      </Button>
    ) : (
      <Button onClick={() => setExpanded(false)} colorScheme="blue" variant="link">
        See less
      </Button>
    )}
  </Flex>
)}


      <Modal isOpen={isOpen} onClose={onClose} size="4xl" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalBody p={5}>
            <Heading size="md" mb={4}>Select a product to add</Heading>
            <Input
              placeholder="Filter products by name"
              value={filterText}
              onChange={handleFilterChange}
              mb={4}
            />
            <Flex
  wrap="wrap"
  gap={4}
  justify="center"
>
  {filteredProducts.length > 0 ? (
    filteredProducts.map((product) => (
      <Box
        key={product._id}
        bg="gray.200"
        p={4}
        borderRadius="md"
        width="calc(25% - 1rem)" // 4 pe rând
        minW="200px"
        maxW="250px"
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
      >
        <Image
          src={product.images[0] || "https://i.pravatar.cc/150"}
          alt={product.name}
          w="100%"
          h="150px"
          objectFit="cover"
          borderRadius="md"
        />
        <Heading size="sm" mt={2} textAlign="center">{product.name}</Heading>
        <Text fontSize="sm" color="gray.600" textAlign="center">
          {product.forSale && product.price != null ? `${product.price} RON` : "Not for Sale"}
        </Text>
        <Tag
          colorScheme={product.forSale ? (product.quantity > 0 ? "green" : "red") : "gray"}
          mt={2}
          alignSelf="center"
        >
          {!product.forSale ? "Not for Sale" : product.quantity > 0 ? `Stock: ${product.quantity} left` : "Out of Stock"}
        </Tag>
        <Button
          colorScheme="green"
          size="sm"
          mt={2}
          onClick={() => addProductToGallery(product._id)}
        >
          Add
        </Button>
      </Box>
    ))
  ) : (
    <Text>No products match your search.</Text>
  )}
</Flex>

          </ModalBody>
        </ModalContent>
      </Modal>
      <Flex maxW="800px" direction="column" gap={2}>
    

      </Flex>

      </Flex>
      </Flex>

      </Flex>

  
  );
};

export default GalleryCard;
