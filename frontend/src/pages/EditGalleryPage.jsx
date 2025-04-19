import {
	Box,
	Button,
	Container,
	Heading,
	Input,
	Textarea,
	VStack,
	Stack,
	HStack,
	Avatar,
	Text,
	Flex,
	Spinner,
	Checkbox,
	Image,
	IconButton,
} from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useShowToast from "../hooks/useShowToast";

const EditGalleryPage = () => {
	const { galleryId } = useParams();
	const navigate = useNavigate();
	const showToast = useShowToast();

	const [galleryData, setGalleryData] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);

	const [coverPhoto, setCoverPhoto] = useState(null);
	const [previewUrl, setPreviewUrl] = useState(null);
	const [collaborators, setCollaborators] = useState([]);
	const [searchText, setSearchText] = useState("");
	const [suggestions, setSuggestions] = useState([]);

	useEffect(() => {
		const fetchGallery = async () => {
			try {
                const res = await fetch(`/api/galleries/${galleryId}`, {
					credentials: "include",
				});
				const data = await res.json();
				if (res.ok) {
					setGalleryData(data);
					setCollaborators(data.collaborators || []);
				} else {
					showToast("Error", data.error || "Failed to fetch gallery", "error");
				}
			} catch (err) {
				console.error(err);
				showToast("Error", err.message, "error");
			} finally {
				setIsLoading(false);
			}
		};
		fetchGallery();
	}, [galleryId]);

	const handleSearchUsers = async () => {
		if (!searchText.trim()) return;
		try {
			const res = await fetch(`/api/users/search?query=${searchText}`, {
				credentials: "include",
			});
			const data = await res.json();
			setSuggestions(data.users || []);
		} catch (err) {
			console.error("User search failed", err);
		}
	};

	const addCollaborator = (user) => {
		if (!collaborators.find((c) => c._id === user._id)) {
			setCollaborators([...collaborators, user]);
		}
		setSearchText("");
		setSuggestions([]);
	};

	const removeCollaborator = (userId) => {
		setCollaborators((prev) => prev.filter((u) => u._id !== userId));
	};

	const handleUpdateGallery = async () => {
		if (!galleryData.name) {
			showToast("Error", "Gallery name is required", "error");
			return;
		}
		setIsSaving(true);
		try {
			const formData = new FormData();
			formData.append("name", galleryData.name);
			formData.append("category", galleryData.category);
			formData.append("description", galleryData.description);
			formData.append("tags", galleryData.tags);
			formData.append("collaborators", JSON.stringify(collaborators.map((u) => u._id)));
			formData.append("isPublic", galleryData.isPublic);

			if (coverPhoto) {
				formData.append("coverPhoto", coverPhoto);
			}

			const res = await fetch(`/api/galleries/${galleryId}`, {
				method: "PUT",
				body: formData,
				credentials: "include",
			});

			const data = await res.json();

			if (res.ok) {
				showToast("Success", "Gallery updated successfully", "success");
				navigate(`/galleries/${data._id}`);
			} else {
				showToast("Error", data.error || "Failed to update gallery", "error");
			}
		} catch (err) {
			console.error(err);
			showToast("Error", err.message, "error");
		} finally {
			setIsSaving(false);
		}
	};

	const handleFileChange = (e) => {
		const file = e.target.files[0];
		setCoverPhoto(file);
		setPreviewUrl(URL.createObjectURL(file));
	};

	if (isLoading || !galleryData) return <Spinner size="xl" />;

	return (
		<Container maxW="container.md" py={8}>
			<VStack spacing={8}>
				<Heading as="h1" size="2xl">Edit Gallery</Heading>
				<Box w="full" p={6} rounded="lg" shadow="md">
					<VStack spacing={4}>
						<Input
							placeholder="Gallery Name"
							value={galleryData.name}
							onChange={(e) => setGalleryData({ ...galleryData, name: e.target.value })}
						/>
						<Input
							placeholder="Category"
							value={galleryData.category}
							onChange={(e) => setGalleryData({ ...galleryData, category: e.target.value })}
						/>
						<Textarea
							placeholder="Description"
							value={galleryData.description}
							onChange={(e) => setGalleryData({ ...galleryData, description: e.target.value })}
						/>
						<Input
							placeholder="Tags (comma-separated)"
							value={galleryData.tags}
							onChange={(e) => setGalleryData({ ...galleryData, tags: e.target.value })}
						/>
<Checkbox
	isChecked={galleryData.isPublic === false}
	onChange={(e) => setGalleryData({ ...galleryData, isPublic: !e.target.checked })}
>
	Make gallery private
</Checkbox>


						<Input
							placeholder="Search collaborators by username"
							value={searchText}
							onChange={(e) => setSearchText(e.target.value)}
							onKeyDown={(e) => e.key === "Enter" && handleSearchUsers()}
						/>

						{suggestions.length > 0 && (
							<Box bg="gray.100" p={2} borderRadius="md" w="full">
								{suggestions.map((user) => (
									<HStack key={user._id} onClick={() => addCollaborator(user)} _hover={{ bg: "gray.200" }} p={2} cursor="pointer">
										<Avatar size="sm" name={user.username} />
										<Text>{user.username}</Text>
									</HStack>
								))}
							</Box>
						)}

						{collaborators.length > 0 && (
							<Box w="full">
								<Text fontWeight="bold" mt={2}>Collaborators:</Text>
								<Flex wrap="wrap" gap={2} mt={2}>
									{collaborators.map((user) => (
										<HStack key={user._id} p={1} bg="gray.200" borderRadius="md">
											<Text>{user.username}</Text>
											<Button size="xs" colorScheme="red" onClick={() => removeCollaborator(user._id)}>
												✕
											</Button>
										</HStack>
									))}
								</Flex>
							</Box>
						)}

						<Stack spacing={2} w="full">
							<Heading as="h4" size="sm">Cover Photo</Heading>
							{(previewUrl || galleryData.coverPhoto) && (
								<Box position="relative" w="full">
									<Image
										src={previewUrl || galleryData.coverPhoto}
										alt="Cover Preview"
										w="100%"
										h="200px"
										objectFit="cover"
										mb={2}
									/>
									<IconButton
										icon={<CloseIcon />}
										size="sm"
										position="absolute"
										top="2"
										right="2"
										aria-label="Remove image"
										onClick={() => {
											setGalleryData({ ...galleryData, coverPhoto: null });
											setPreviewUrl(null);
											setCoverPhoto(null);
										}}
									/>
								</Box>
							)}
							<Input type="file" accept="image/*" onChange={handleFileChange} />
						</Stack>

						<Button colorScheme="blue" onClick={handleUpdateGallery} w="full" isLoading={isSaving}>
							Save Changes
						</Button>
					</VStack>
				</Box>
			</VStack>
		</Container>
	);
};

export default EditGalleryPage;
