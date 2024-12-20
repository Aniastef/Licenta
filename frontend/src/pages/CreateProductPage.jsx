import {
	Box,
	Button,
	Container,
	Heading,
	Input,
	Textarea,
	VStack,
	Stack,
  } from "@chakra-ui/react";
  import { useState } from "react";
  import { useProductStore } from "../store/product";
  import useShowToast from "../hooks/useShowToast";
  
  const CreateProductPage = () => {
	const [newProduct, setNewProduct] = useState({
	  name: "",
	  description: "",
	  price: "",
	  images: [""],
	});
  
	const toast = useShowToast();
	const { createProduct } = useProductStore();
  
	const handleAddProduct = async () => {
	  try {
		const { success, message } = await createProduct(newProduct);
		if (!success) {
		  toast("Error", message || "Failed to create product", "error");
		} else {
		  toast("Success", "Product created successfully!", "success");
		  setNewProduct({
			name: "",
			description: "",
			price: "",
			images: [""],
		  });
		}
	  } catch (error) {
		toast("Error", error.message || "An unexpected error occurred", "error");
	  }
	};
  
	const handleImageChange = (index, value) => {
	  const updatedImages = [...newProduct.images];
	  updatedImages[index] = value;
	  setNewProduct({ ...newProduct, images: updatedImages });
	};
  
	const addNewImageField = () => {
	  setNewProduct({ ...newProduct, images: [...newProduct.images, ""] });
	};
  
	return (
	  <Container maxW={"container.sm"} py={8}>
		<VStack spacing={8}>
		  <Heading as={"h1"} size={"2xl"} textAlign={"center"}>
			Create New Product
		  </Heading>
  
		  <Box w={"full"} p={6} rounded={"lg"} shadow={"md"}>
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
			  <Stack spacing={2} w="full">
				<Heading as="h4" size="sm">
				  Images
				</Heading>
				{newProduct.images.map((image, index) => (
				  <Input
					key={index}
					placeholder={`Image URL ${index + 1}`}
					value={image}
					onChange={(e) => handleImageChange(index, e.target.value)}
				  />
				))}
				<Button
				  size="sm"
				  colorScheme="teal"
				  variant="outline"
				  onClick={addNewImageField}
				>
				  Add More Images
				</Button>
			  </Stack>
  
			  <Button colorScheme="blue" onClick={handleAddProduct} w="full">
				Add Product
			  </Button>
			</VStack>
		  </Box>
		</VStack>
	  </Container>
	);
  };
  
  export default CreateProductPage;
  