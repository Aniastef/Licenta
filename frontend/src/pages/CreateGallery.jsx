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
} from "@chakra-ui/react";
import { useState } from "react";
import useShowToast from "../hooks/useShowToast";
import { useNavigate } from "react-router-dom";

const CreateGalleryPage = () => {
	const navigate = useNavigate();

	const [newGallery, setNewGallery] = useState({
		name: "",
		category: "General",
		description: "",
		tags: "",
	});
	const [coverPhoto, setCoverPhoto] = useState(null);
	const showToast = useShowToast();
	const [isLoading, setIsLoading] = useState(false);

	const [collaborators, setCollaborators] = useState([]);
	const [searchText, setSearchText] = useState("");
	const [suggestions, setSuggestions] = useState([]);

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

	const handleAddGallery = async () => {
		if (!newGallery.name) {
			showToast("Error", "Gallery name is required", "error");
			return;
		}

		setIsLoading(true);

		try {
			const formData = new FormData();
			formData.append("name", newGallery.name);
			formData.append("category", newGallery.category);
			formData.append("description", newGallery.description);
			formData.append("tags", newGallery.tags);
			formData.append("collaborators", collaborators.map((u) => u._id).join(","));

			if (coverPhoto) {
				formData.append("coverPhoto", coverPhoto);
			}

			const res = await fetch("/api/galleries/create", {
				method: "POST",
				body: formData,
				credentials: "include",
			});

			const data = await res.json();

			if (data.error) {
				showToast("Error creating gallery", data.error, "error");
				setIsLoading(false);
				return;
			}

			showToast("Gallery created successfully", "", "success");
			navigate(`/galleries/${data._id}`);
		} catch (error) {
			showToast("Error", error.message, "error");
		} finally {
			setIsLoading(false);
		}
	};

	const handleFileChange = (e) => {
		setCoverPhoto(e.target.files[0]);
	};

	return (
		<Container maxW="container.md" py={8}>
			<VStack spacing={8}>
				<Heading as="h1" size="2xl">
					Create New Gallery
				</Heading>

				<Box w="full" p={6} rounded="lg" shadow="md">
					<VStack spacing={4}>
						<Input
							placeholder="Gallery Name"
							value={newGallery.name}
							onChange={(e) =>
								setNewGallery({ ...newGallery, name: e.target.value })
							}
						/>
						<Input
							placeholder="Category"
							value={newGallery.category}
							onChange={(e) =>
								setNewGallery({ ...newGallery, category: e.target.value })
							}
						/>
						<Textarea
							placeholder="Gallery Description"
							value={newGallery.description}
							onChange={(e) =>
								setNewGallery({ ...newGallery, description: e.target.value })
							}
						/>
						<Input
							placeholder="Tags (comma-separated)"
							value={newGallery.tags}
							onChange={(e) =>
								setNewGallery({ ...newGallery, tags: e.target.value })
							}
						/>

						{/* 🔍 Căutare colaboratori */}
						<Input
							placeholder="Search collaborators by username"
							value={searchText}
							onChange={(e) => setSearchText(e.target.value)}
							onKeyDown={(e) => e.key === "Enter" && handleSearchUsers()}
						/>

						{suggestions.length > 0 && (
							<Box bg="gray.100" p={2} borderRadius="md" w="full">
								{suggestions.map((user) => (
									<HStack
										key={user._id}
										onClick={() => addCollaborator(user)}
										_hover={{ bg: "gray.200" }}
										p={2}
										cursor="pointer"
									>
										<Avatar size="sm" name={user.username} />
										<Text>{user.username}</Text>
									</HStack>
								))}
							</Box>
						)}

						{collaborators.length > 0 && (
							<Box w="full">
								<Text fontWeight="bold" mt={2}>Selected collaborators:</Text>
								<Flex wrap="wrap" gap={2} mt={2}>
									{collaborators.map((user) => (
										<HStack key={user._id} p={1} bg="gray.200" borderRadius="md">
											<Text>{user.username}</Text>
											<Button
												size="xs"
												colorScheme="red"
												onClick={() => removeCollaborator(user._id)}
											>
												✕
											</Button>
										</HStack>
									))}
								</Flex>
							</Box>
						)}

						<Stack spacing={2} w="full">
							<Heading as="h4" size="sm">
								Cover Photo
							</Heading>
							<Input
								type="file"
								accept="image/*"
								onChange={handleFileChange}
							/>
						</Stack>

						<Button
							colorScheme="blue"
							onClick={handleAddGallery}
							w="full"
							isLoading={isLoading}
						>
							Add Gallery
						</Button>
					</VStack>
				</Box>
			</VStack>
		</Container>
	);
};

export default CreateGalleryPage;
