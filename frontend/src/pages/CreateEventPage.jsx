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
import { useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import eventAtom from "../atoms/eventAtom";

const CreateEventPage = () => {
	const setEvent = useSetRecoilState(eventAtom);

	const [newEvent, setNewEvent] = useState({
		name: "",
		description: "",
		date: "",
		tags: "",
	});
	const [coverImage, setCoverImage] = useState(null);
	const showToast = useShowToast();
	const [isLoading, setIsLoading] = useState(false);

	const handleAddEvent = async () => {
		if (!newEvent.name || !newEvent.date) {
			showToast("Error", "Name and date are required", "error");
			return;
		}

		setIsLoading(true);

		try {
			const formData = new FormData();
			formData.append("name", newEvent.name);
			formData.append("description", newEvent.description);
			formData.append("date", newEvent.date);
			formData.append("tags", newEvent.tags);
			if (coverImage) {
				formData.append("coverImage", coverImage);
			}

			const res = await fetch("/api/events/create", {
				method: "POST",
				body: formData,
			});

			const data = await res.json();

			if (data.error) {
				showToast("Error creating event", data.error, "error");
				setIsLoading(false);
				return;
			}

			setEvent(data);
			showToast("Event created successfully", "", "success");
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
							placeholder="Event Date"
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
