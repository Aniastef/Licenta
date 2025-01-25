import {
	Box,
	Button,
	Container,
	Heading,
	Input,
	Textarea,
	VStack,
	Stack,
	Image,
	Flex,
	Select,
  } from "@chakra-ui/react";
  import { useState } from "react";
  import useShowToast from "../hooks/useShowToast";
  import productAtom from "../atoms/productAtom";
  import { useSetRecoilState } from "recoil";
  import { useNavigate } from "react-router-dom";
  
  const CreateProductPage = () => {
	const setProduct = useSetRecoilState(productAtom);
	const [newProduct, setNewProduct] = useState({
	  name: "",
	  description: "",
	  price: "",
	  gallery: "", // Adăugat câmp pentru categorie
	  images: [],
	});
	const [imageFiles, setImageFiles] = useState([]);
	const showToast = useShowToast();
	const [isLoading, setIsLoading] = useState(false);
	const navigate = useNavigate();
  
	const handleAddProduct = async () => {
	  if (
		!newProduct.name ||
		!newProduct.price ||
		newProduct.price <= 0 ||
		!newProduct.gallery
	  ) {
		showToast(
		  "Error",
		  "Name, valid price, and gallery category are required",
		  "error"
		);
		return;
	  }
  
	  setIsLoading(true);
  
	  try {
		const formData = new FormData();
		formData.append("name", newProduct.name);
		formData.append("description", newProduct.description);
		formData.append("price", newProduct.price);
		formData.append("gallery", newProduct.gallery); // Adaugă categoria în payload
		imageFiles.forEach((file) => formData.append("images", file));
  
		const res = await fetch("/api/products/create", {
		  method: "POST",
		  body: formData,
		});
  
		const data = await res.json();
  
		if (data.error) {
		  showToast("Error creating product", data.error, "error");
		  setIsLoading(false);
		  return;
		}
  
		setProduct(data);
		showToast("Product created successfully", "", "success");
		navigate(`/products/${data._id}`); // Redirecționează către pagina produsului
	  } catch (error) {
		showToast("Error", error.message, "error");
	  } finally {
		setIsLoading(false);
	  }
	};
  
	const handleFileChange = (e) => {
	  const selectedFiles = [...e.target.files];
	  if (imageFiles.length + selectedFiles.length > 5) {
		showToast("Error", "You can upload a maximum of 5 images", "error");
		return;
	  }
	  setImageFiles([...imageFiles, ...selectedFiles]);
	};
  
	return (
	  <Container maxW="container.md" py={8}>
		<VStack spacing={8}>
		  <Heading as="h1" size="2xl">
			Create New Product
		  </Heading>
  
		  <Box w="full" p={6} rounded="lg" shadow="md">
			<VStack spacing={4}>
			  <Input
				placeholder="Product Name"
				value={newProduct.name}
				onChange={(e) =>
				  setNewProduct({ ...newProduct, name: e.target.value })
				}
			  />
			  <Textarea
				placeholder="Product Description"
				value={newProduct.description}
				onChange={(e) =>
				  setNewProduct({ ...newProduct, description: e.target.value })
				}
			  />
			  <Input
				placeholder="Price"
				type="number"
				value={newProduct.price}
				onChange={(e) =>
				  setNewProduct({ ...newProduct, price: e.target.value })
				}
			  />
			  <Select
				placeholder="Select gallery category"
				value={newProduct.gallery}
				onChange={(e) =>
				  setNewProduct({ ...newProduct, gallery: e.target.value })
				}
			  >
				<option value="painting">Painting</option>
				<option value="sculpture">Sculpture</option>
				<option value="drawing">Drawing</option>
			  </Select>
			  <Stack spacing={2} w="full">
				<Heading as="h4" size="sm">
				  Images
				</Heading>
				<Input
				  type="file"
				  accept="image/*"
				  multiple
				  onChange={handleFileChange}
				/>
			  </Stack>
  
			  {/* Afișare imagini selectate */}
			  <Flex wrap="wrap" gap={4}>
				{imageFiles.map((file, index) => (
				  <Image
					key={index}
					src={URL.createObjectURL(file)}
					alt={`Preview ${index}`}
					boxSize="100px"
					objectFit="cover"
					borderRadius="md"
				  />
				))}
			  </Flex>
  
			  <Button
				colorScheme="blue"
				onClick={handleAddProduct}
				w="full"
				isLoading={isLoading}
			  >
				Add Product
			  </Button>
			</VStack>
		  </Box>
		</VStack>
	  </Container>
	);
  };
  
  export default CreateProductPage;
  