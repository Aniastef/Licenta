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
		images: [],
	});
	const [imageFiles, setImageFiles] = useState([]);
	const showToast = useShowToast();
	const [isLoading, setIsLoading] = useState(false);

	const handleAddProduct = async () => {
		if (!newProduct.name || !newProduct.price) {
			showToast("Error", "Name and price are required", "error");
			return;
		}

		setIsLoading(true);

		try {
			const formData = new FormData();
			formData.append("name", newProduct.name);
			formData.append("description", newProduct.description);
			formData.append("price", newProduct.price);
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
		} catch (error) {
			showToast("Error", error.message, "error");
		} finally {
			setIsLoading(false);
		}
	};

	const handleFileChange = (e) => {
		setImageFiles([...imageFiles, ...e.target.files]);
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
							<Input
								type="file"
								accept="image/*"
								multiple
								onChange={handleFileChange}
							/>
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
