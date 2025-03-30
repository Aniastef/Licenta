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
import { useSetRecoilState } from "recoil";
import eventAtom from "../atoms/eventAtom";
import { useNavigate } from "react-router-dom";

const CreateEventPage = () => {
	const setEvent = useSetRecoilState(eventAtom);
	const navigate = useNavigate();

	const [newEvent, setNewEvent] = useState({
		name: "",
		description: "",
		date: "",
		tags: "",
	});
	const [coverImage, setCoverImage] = useState(null);
	const showToast = useShowToast();
	const [isLoading, setIsLoading] = useState(false);

	// 🔹 Convert file to Base64
	const fileToBase64 = (file) => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = () => resolve(reader.result);
			reader.onerror = (error) => reject(error);
		});
	};

	const handleAddEvent = async () => {
		if (!newEvent.name || !newEvent.date) {
			showToast("Error", "Name and date are required", "error");
			return;
		}

		setIsLoading(true);

		try {
			let base64Image = null;
			if (coverImage) {
				base64Image = await fileToBase64(coverImage);
			}

			const res = await fetch("/api/events/create", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
				body: JSON.stringify({
					...newEvent,
					coverImage: base64Image, // 🔹 trimite ca string Base64
				}),
			});

			const data = await res.json();

			if (data.error) {
				showToast("Error creating event", data.error, "error");
				setIsLoading(false);
				return;
			}

			setEvent(data);
			showToast("Event created successfully", "", "success");
			navigate(`/events/${data._id}`);
		} catch (error) {
			showToast("Error", error.message, "error");
		} finally {
			setIsLoading(false);
		}
	};

	const handleFileChange = (e) => {
		setCoverImage(e.target.files[0]);
	};

	return (
		<Container maxW="container.md" py={8}>
			<VStack spacing={8}>
				<Heading as="h1" size="2xl">
					Create New Event
				</Heading>

				<Box w="full" p={6} rounded="lg" shadow="md">
					<VStack spacing={4}>
						<Input
							placeholder="Event Name"
							value={newEvent.name}
							onChange={(e) =>
								setNewEvent({ ...newEvent, name: e.target.value })
							}
						/>
						<Textarea
							placeholder="Event Description"
							value={newEvent.description}
							onChange={(e) =>
								setNewEvent({ ...newEvent, description: e.target.value })
							}
						/>
						<Input
							type="date"
							value={newEvent.date}
							onChange={(e) =>
								setNewEvent({ ...newEvent, date: e.target.value })
							}
						/>
						<Input
							placeholder="Tags (comma-separated)"
							value={newEvent.tags}
							onChange={(e) =>
								setNewEvent({ ...newEvent, tags: e.target.value })
							}
						/>
						<Stack spacing={2} w="full">
							<Heading as="h4" size="sm">
								Cover Image
							</Heading>
							<Input
								type="file"
								accept="image/*"
								onChange={handleFileChange}
							/>
						</Stack>

						<Button
							colorScheme="blue"
							onClick={handleAddEvent}
							w="full"
							isLoading={isLoading}
						>
							Add Event
						</Button>
					</VStack>
				</Box>
			</VStack>
		</Container>
	);
};

export default CreateEventPage;
