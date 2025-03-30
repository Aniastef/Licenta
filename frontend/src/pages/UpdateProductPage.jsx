// src/pages/EditProductPage.jsx
import {
    Box,
    Button,
    Container,
    Heading,
    Input,
    Textarea,
    VStack,
    Switch,
    FormControl,
    FormLabel,
    useToast,
    Spinner,
    Flex,
    Image,
  } from "@chakra-ui/react";
  import { useEffect, useState } from "react";
  import { useParams, useNavigate } from "react-router-dom";
  
  const UpdateProductPage = () => {
    const { id } = useParams();
    const toast = useToast();
    const navigate = useNavigate();
  
    const [product, setProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [newImages, setNewImages] = useState([]);
    const [newVideos, setNewVideos] = useState([]);
    const [newAudios, setNewAudios] = useState([]);
  
    useEffect(() => {
      const fetchProduct = async () => {
        try {
          const res = await fetch(`/api/products/${id}`, { credentials: "include" });
          const data = await res.json();
          if (res.ok) setProduct(data.product);
          else toast({ title: "Error", description: data.error, status: "error" });
        } catch (err) {
          toast({ title: "Error", description: err.message, status: "error" });
        } finally {
          setIsLoading(false);
        }
      };
      fetchProduct();
    }, [id]);
  
    const convertToBase64 = (file) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
  
    const handleMediaChange = async (e, typeSetter) => {
      const files = [...e.target.files];
      const base64Files = await Promise.all(files.map(file => convertToBase64(file)));
      typeSetter((prev) => [...prev, ...base64Files]);
    };
  
    const handleUpdate = async () => {
      if (!product.name || product.price <= 0) {
        toast({ title: "Validation error", description: "Name and price are required.", status: "error" });
        return;
      }
  
      setUpdating(true);
  
      try {
        const updatedProduct = {
          ...product,
          images: [...product.images, ...newImages],
          videos: [...(product.videos || []), ...newVideos],
          audios: [...(product.audios || []), ...newAudios],
        };
  
        const res = await fetch(`/api/products/update/${product._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(updatedProduct),
        });
  
        const data = await res.json();
        if (res.ok) {
          toast({ title: "Product updated!", status: "success" });
          navigate(`/products/${product._id}`);
        } else {
          toast({ title: "Update failed", description: data.error, status: "error" });
        }
      } catch (err) {
        toast({ title: "Error", description: err.message, status: "error" });
      } finally {
        setUpdating(false);
      }
    };
  
    if (isLoading) {
      return <Container py={10}><Spinner /></Container>;
    }
  
    if (!product) {
      return <Container py={10}><Heading size="md">Product not found.</Heading></Container>;
    }
  
    return (
      <Container maxW="container.md" py={8}>
        <VStack spacing={6}>
          <Heading>Edit Product</Heading>
  
          <Input value={product.name} onChange={(e) => setProduct({ ...product, name: e.target.value })} />
          <Textarea value={product.description} onChange={(e) => setProduct({ ...product, description: e.target.value })} />
          <Input type="number" value={product.price} onChange={(e) => setProduct({ ...product, price: parseFloat(e.target.value) })} />
          <Input type="number" value={product.quantity} onChange={(e) => setProduct({ ...product, quantity: parseInt(e.target.value) })} />
  
          <FormControl display="flex" alignItems="center">
            <FormLabel mb="0">For Sale</FormLabel>
            <Switch isChecked={product.forSale} onChange={(e) => setProduct({ ...product, forSale: e.target.checked })} />
          </FormControl>
  
          {/* Upload imagini */}
          <Input type="file" accept="image/*" multiple onChange={(e) => handleMediaChange(e, setNewImages)} />
          <Flex gap={3} wrap="wrap">
            {newImages.map((img, i) => (
              <Image key={i} src={img} boxSize="100px" objectFit="cover" borderRadius="md" />
            ))}
          </Flex>
  
          {/* Upload video */}
          <Input type="file" accept="video/*" multiple onChange={(e) => handleMediaChange(e, setNewVideos)} />
          <Flex gap={3} wrap="wrap">
            {newVideos.map((video, i) => (
              <video key={i} src={video} controls width="200" />
            ))}
          </Flex>
  
          {/* Upload audio */}
          <Input type="file" accept="audio/*" multiple onChange={(e) => handleMediaChange(e, setNewAudios)} />
          <Flex gap={3} wrap="wrap">
            {newAudios.map((audio, i) => (
              <audio key={i} src={audio} controls />
            ))}
          </Flex>
  
          <Button colorScheme="blue" onClick={handleUpdate} isLoading={updating}>Save Changes</Button>
        </VStack>
      </Container>
    );
  };
  
  export default UpdateProductPage;
  