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
import useShowToast from "../hooks/useShowToast";
import productAtom from "../atoms/productAtom";
import { useSetRecoilState } from "recoil";

const CreateProductPage = () => {
const setProduct = useSetRecoilState(productAtom);
const [newProduct, setNewProduct] = useState({
	name: "",
	description: "",
	price: "",
	images: [""],
});
const showToast = useShowToast();
const [isLoading, setIsLoading] = useState(false);

const handleAddProduct = async () => {
	if (!newProduct.name || !newProduct.price) {
	showToast("Error", "Name and price are required", "error");
	return;
	}

	setIsLoading(true);
	try {
	const res = await fetch("/api/products", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(newProduct),
	});

	const data = await res.json();

	if (data.error) {
		showToast("Error creating product", data.error, "error");
		setIsLoading(false);
		return;
	}

	setProduct(data);
	showToast("Product created successfully", "", "success");
	} catch (error) {
		showToast("Error", error.message, "error");
	} finally {
		setIsLoading(false);
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
