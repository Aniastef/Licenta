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
	Switch,
	FormControl,
	FormLabel,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
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
		quantity: 1,
		forSale: true,
		galleries: [],
		images: [],
		videos: [],
		audios: [],
	});
	const [imageFiles, setImageFiles] = useState([]);
	const [videoFiles, setVideoFiles] = useState([]);
	const [audioFiles, setAudioFiles] = useState([]);
	const [userGalleries, setUserGalleries] = useState([]);
	const showToast = useShowToast();
	const [isLoading, setIsLoading] = useState(false);
	const navigate = useNavigate();

	// ✅ Preluare galerii ale utilizatorului
	useEffect(() => {
		const fetchGalleries = async () => {
			try {
				const res = await fetch("/api/users/galleries", {
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
						"Content-Type": "application/json",
					},
					credentials: "include" // ✅ Include cookies (like jwt)
				});

				const data = await res.json();
				if (data.galleries) {
					console.log("Fetched galleries:", data.galleries);
					setUserGalleries(data.galleries);
				} else {
					console.error("No galleries found:", data.error);
				}
			} catch (error) {
				console.error("Error fetching galleries:", error.message);
			}
		};
		fetchGalleries();
	}, []);

	const fileToBase64 = (file) =>
		new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onloadend = () => resolve(reader.result);
			reader.onerror = reject;
			reader.readAsDataURL(file);
		});

	const handleAddProduct = async () => {
		if (!newProduct.name || !newProduct.price || newProduct.price <= 0 || newProduct.quantity < 0) {
			showToast("Error", "Name, valid price, and quantity are required", "error");
			return;
		}

		setIsLoading(true);

		try {
			const imagesBase64 = await Promise.all(imageFiles.map(fileToBase64));
			const videosBase64 = await Promise.all(videoFiles.map(fileToBase64));
			const audiosBase64 = await Promise.all(audioFiles.map(fileToBase64));

			const res = await fetch("/api/products/create", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({
					...newProduct,
					images: imagesBase64,
					videos: videosBase64,
					audios: audiosBase64,
				}),
			});

			const data = await res.json();

			if (data.error) {
				showToast("Error creating product", data.error, "error");
			} else {
				setProduct(data);
				showToast("Product created successfully", "", "success");
				navigate(`/products/${data._id}`);
			}
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
				<Heading>Create New Product</Heading>
				<Box w="full" p={6} rounded="lg" shadow="md">
					<VStack spacing={4}>
						<Input placeholder="Product Name" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} />
						<Textarea placeholder="Product Description" value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} />
						<Input type="number" placeholder="Price" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} />
						<Input type="number" placeholder="Quantity" min="0" value={newProduct.quantity} onChange={(e) => setNewProduct({ ...newProduct, quantity: parseInt(e.target.value) || 0 })} />

						<FormControl display="flex" alignItems="center">
							<FormLabel mb="0">For Sale</FormLabel>
							<Switch isChecked={newProduct.forSale} onChange={(e) => setNewProduct({ ...newProduct, forSale: e.target.checked })} />
						</FormControl>

						<Select
							placeholder="Select a gallery"
							value={newProduct.galleries[0] || ""}
							onChange={(e) => setNewProduct({ ...newProduct, galleries: [e.target.value] })}
						>
							<option value="">All Products</option>
							{userGalleries.map((gallery) => (
								<option key={gallery._id} value={gallery._id}>{gallery.name}</option>
							))}
						</Select>

						{/* 🔽 Upload fields */}
						<Input type="file" accept="image/*" multiple onChange={(e) => setImageFiles([...e.target.files])} />
						<Input type="file" accept="video/*" multiple onChange={(e) => setVideoFiles([...e.target.files])} />
						<Input type="file" accept="audio/*" multiple onChange={(e) => setAudioFiles([...e.target.files])} />

						<Button colorScheme="blue" onClick={handleAddProduct} w="full" isLoading={isLoading}>
							Add Product
						</Button>
					</VStack>
				</Box>
			</VStack>
		</Container>
	);
};

export default CreateProductPage;