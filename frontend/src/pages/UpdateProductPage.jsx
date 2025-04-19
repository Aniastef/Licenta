import {
	Box,
	Button,
	Container,
	Heading,
	Input,
	Text,
	VStack,
	Select,
	Image,
	Flex,
	Switch,
	FormControl,
	FormLabel,
	IconButton,
	Spinner,
} from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useShowToast from "../hooks/useShowToast";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

const EditProductPage = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const showToast = useShowToast();

	const [product, setProduct] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [updating, setUpdating] = useState(false);
	const [imageFiles, setImageFiles] = useState([]);
	const [videoFiles, setVideoFiles] = useState([]);
	const [audioFiles, setAudioFiles] = useState([]);
	const [userGalleries, setUserGalleries] = useState([]);

	useEffect(() => {
		const fetchProduct = async () => {
			try {
				const res = await fetch(`/api/products/${id}`, { credentials: "include" });
				const data = await res.json();
				if (res.ok) setProduct(data.product);
				else showToast("Error", data.error, "error");
			} catch (err) {
				showToast("Error", err.message, "error");
			} finally {
				setIsLoading(false);
			}
		};
		fetchProduct();
	}, [id]);

	useEffect(() => {
		const fetchGalleries = async () => {
			try {
				const res = await fetch("/api/users/galleries", {
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
						"Content-Type": "application/json",
					},
					credentials: "include",
				});
				const data = await res.json();
				if (data.galleries) setUserGalleries(data.galleries);
			} catch (err) {
				console.error("Error fetching galleries:", err.message);
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

	const handleRemoveMedia = (type, index) => {
		setProduct((prev) => ({
			...prev,
			[type]: prev[type].filter((_, i) => i !== index),
		}));
	};

	const handleUpdate = async () => {
		if (!product.name) {
			showToast("Error", "Name is required", "error");
			return;
		}

		setUpdating(true);
		try {
			const imagesBase64 = await Promise.all(imageFiles.map(fileToBase64));
			const videosBase64 = await Promise.all(videoFiles.map(fileToBase64));
			const audiosBase64 = await Promise.all(audioFiles.map(fileToBase64));

			const updated = {
				...product,
				images: [...(product.images || []), ...imagesBase64],
				videos: [...(product.videos || []), ...videosBase64],
				audios: [...(product.audios || []), ...audiosBase64],
			};

			const res = await fetch(`/api/products/update/${product._id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify(updated),
			});
			const data = await res.json();
			if (res.ok) {
				showToast("Product updated", "", "success");
				navigate(`/products/${product._id}`);
			} else {
				showToast("Update failed", data.error, "error");
			}
		} catch (err) {
			showToast("Error", err.message, "error");
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
			<VStack spacing={8}>
				<Heading>Edit Product</Heading>
				<Box w="full" p={6} rounded="lg" shadow="md">
					<VStack spacing={4}>
						<Input value={product.name ?? ""} onChange={(e) => setProduct({ ...product, name: e.target.value })} />

						<Text fontWeight="bold" alignSelf="start">Description</Text>
						<ReactQuill
							value={product.description ?? ""}
							onChange={(value) => setProduct({ ...product, description: value })}
							theme="snow"
							style={{ height: "200px", width: "700px", marginBottom: "20px" }}
						/>

						<Input type="number" value={product.price ?? ""} onChange={(e) => setProduct({ ...product, price: parseFloat(e.target.value) || 0 })} />
						<Input type="number" min="0" value={product.quantity ?? 0} onChange={(e) => setProduct({ ...product, quantity: parseInt(e.target.value) || 0 })} />

						<FormControl display="flex" alignItems="center">
							<FormLabel mb="0">For Sale</FormLabel>
							<Switch isChecked={product.forSale ?? true} onChange={(e) => setProduct({ ...product, forSale: e.target.checked })} />
						</FormControl>

						<Select value={product.galleries?.[0] ?? ""} onChange={(e) => setProduct({ ...product, galleries: [e.target.value] })}>
							<option value="">All Products</option>
							{userGalleries.map((g) => (
								<option key={g._id} value={g._id}>{g.name}</option>
							))}
						</Select>

						{/* Media previews cu ștergere */}
						{["images", "videos", "audios"].map((mediaType) => (
							<Flex key={mediaType} gap={3} wrap="wrap" align="center">
								{product[mediaType]?.map((src, i) => (
									<Box key={i} position="relative">
										{mediaType === "images" ? (
											<Image src={src} boxSize="100px" objectFit="cover" borderRadius="md" />
										) : mediaType === "videos" ? (
											<video src={src} width="160" controls />
										) : (
											<audio src={src} controls />
										)}
										<IconButton
											icon={<CloseIcon />}
											size="xs"
											colorScheme="red"
											position="absolute"
											top="0"
											right="0"
											onClick={() => handleRemoveMedia(mediaType, i)}
											aria-label="Remove media"
										/>
									</Box>
								))}
							</Flex>
						))}

						{/* Upload new files */}
						<Input type="file" accept="image/*" multiple onChange={(e) => setImageFiles([...e.target.files])} />
						<Input type="file" accept="video/*" multiple onChange={(e) => setVideoFiles([...e.target.files])} />
						<Input type="file" accept="audio/*" multiple onChange={(e) => setAudioFiles([...e.target.files])} />

						<Text fontWeight="bold" alignSelf="start">Writing / Poem</Text>
						<TiptapEditor
  value={product.writing ?? ""}
  onChange={(value) => setProduct({ ...product, writing: value })}
  placeholder="Poem or writing..."
/>


						<Button colorScheme="blue" onClick={handleUpdate} isLoading={updating} w="full">
							Save Changes
						</Button>
					</VStack>
				</Box>
			</VStack>
		</Container>
	);
};

export default EditProductPage;
