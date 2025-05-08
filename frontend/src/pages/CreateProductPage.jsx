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
	Text,
	HStack,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import useShowToast from "../hooks/useShowToast";
import productAtom from "../atoms/productAtom";
import { useSetRecoilState } from "recoil";
import { useNavigate } from "react-router-dom";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import imageCompression from "browser-image-compression";
import ProductImageCropModal from "../components/ProductImageCropModal";


const compressImage = async (file) => {
	try {
		const options = {
			maxSizeMB: 0.5,           // max 500 KB
			maxWidthOrHeight: 1080,   // resize dacă e prea mare
			useWebWorker: true,
		};
		const compressedFile = await imageCompression(file, options);
		return compressedFile;
	} catch (error) {
		console.error("Compression failed:", error);
		return file; // fallback la original
	}
};


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
	const [rawImage, setRawImage] = useState(null);
const [croppedImage, setCroppedImage] = useState(null);
const [isCropOpen, setIsCropOpen] = useState(false);
const [rawImages, setRawImages] = useState([]);
const [cropIndex, setCropIndex] = useState(0);



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
			if (!newProduct.name) {
				showToast("Error", "Name is required", "error");
				return;
			}
		
			setIsLoading(true);
		
			try {
				// 🔽 Comprimă imaginile înainte de conversie
				const imagesBase64 = imageFiles;

		
				// 🔼 Videourile și audio nu se comprimă
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
			const files = Array.from(e.target.files);
			if (imageFiles.length + files.length > 5) {
			  showToast("Error", "You can upload a maximum of 5 images", "error");
			  return;
			}
			setRawImages(files.map(file => URL.createObjectURL(file)));
			setCropIndex(0);
			setIsCropOpen(true);
		  };
		  

	return (
		<Container maxW="container.md" py={8}>
			<VStack spacing={8}>
				<Heading>Create New Product</Heading>
				<Box w="full" p={6} rounded="lg" shadow="md">
					<VStack spacing={4}>
						<Input placeholder="Product Name" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} />
						<Text fontWeight="bold" alignSelf="start">Product Description</Text>
<ReactQuill
  theme="snow"
  value={newProduct.description}
  onChange={(value) => setNewProduct({ ...newProduct, description: value })}
  style={{ height: "200px", 
 width: "700px", // înălțime fixă 
  marginBottom: "20px", overflowY: "auto" }}
/>		
{newProduct.forSale && (
  <Input
    type="number"
    placeholder="Price"
    value={newProduct.price}
    onChange={(e) =>
      setNewProduct({ ...newProduct, price: parseFloat(e.target.value) || 0 })
    }
  />
)}
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
						<Stack w="full">
  <Stack w="full">
  <Heading as="h4" size="sm">Product Images</Heading>
  <Input
    type="file"
    accept="image/*"
    multiple
    onChange={(e) => {
      const files = Array.from(e.target.files);
      if (imageFiles.length + files.length > 5) {
        showToast("Error", "You can upload a maximum of 5 images", "error");
        return;
      }
      const urls = files.map(file => ({
        file,
        url: URL.createObjectURL(file),
      }));
      setRawImages(urls);
      setCropIndex(0);
      setIsCropOpen(true);
    }}
  />
  <HStack wrap="wrap" spacing={2}>
    {imageFiles.map((src, idx) => (
      <Image
        key={idx}
        src={src}
        boxSize="100px"
        objectFit="cover"
        borderRadius="md"
        border="2px solid"
        borderColor="gray.300"
      />
    ))}
  </HStack>
</Stack>


  <HStack wrap="wrap" spacing={2}>
  {imageFiles.map((src, idx) => (
    <Image key={idx} src={src} boxSize="100px" objectFit="cover" borderRadius="md" />
  ))}
</HStack>

</Stack>
						<Input type="file" accept="video/*" multiple onChange={(e) => setVideoFiles([...e.target.files])} />
						<Input type="file" accept="audio/*" multiple onChange={(e) => setAudioFiles([...e.target.files])} />
						<Text fontWeight="bold" alignSelf="start">Writing / Poem</Text>
						<ReactQuill
  theme="snow"
  value={newProduct.writing}
  onChange={(value) => setNewProduct({ ...newProduct, writing: value })}
  style={{
    height: "200px",  
	width: "700px",       // înălțime fixă
    overflowY: "auto",       // scroll vertical
    marginBottom: "20px"
  }}
/>




						<Button colorScheme="blue" onClick={handleAddProduct} w="full" isLoading={isLoading}>
							Add Product
						</Button>
					</VStack>
				</Box>
			</VStack>
			<ProductImageCropModal
  isOpen={isCropOpen}
  onClose={() => setIsCropOpen(false)}
  imageSrc={rawImages[cropIndex]?.url}
  onCropComplete={(croppedBase64) => {
    setImageFiles((prev) => [...prev, croppedBase64]);
    if (cropIndex + 1 < rawImages.length) {
      setCropIndex((prev) => prev + 1);
    } else {
      setIsCropOpen(false);
      setRawImages([]);
    }
  }}
/>


		</Container>
	);
};

export default CreateProductPage;