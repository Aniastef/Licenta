import {
	Box,
	Button,
	Container,
	Heading,
	Input,
	Textarea,
	VStack,
	Stack,
	Select,
	Text,
	Flex,
	IconButton,
	CloseButton,
	FormControl,
	FormLabel
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import useShowToast from "../hooks/useShowToast";
import { useSetRecoilState } from "recoil";
import eventAtom from "../atoms/eventAtom";
import { useNavigate } from "react-router-dom";
import { AddIcon } from "@chakra-ui/icons";
import useLoadGoogleMapsScript from "../hooks/useLoadGoogleMapsScript";
import usePlacesAutocomplete, { getGeocode, getLatLng } from "use-places-autocomplete";
import imageCompression from "browser-image-compression";
import EventImageCropModal from "../components/EventImageCropModal";


const compressImage = async (file) => {
	try {
		const options = {
			maxSizeMB: 0.5, // 500 KB max
			maxWidthOrHeight: 1080,
			useWebWorker: true,
		};
		const compressed = await imageCompression(file, options);
		return compressed;
	} catch (err) {
		console.error("Compression failed:", err);
		return file;
	}
};


const CreateEventPage = () => {

const setEvent = useSetRecoilState(eventAtom);
const navigate = useNavigate();
const showToast = useShowToast();
const [isLoading, setIsLoading] = useState(false);
const [newEvent, setNewEvent] = useState({
  name: "",
  description: "",
  date: "",
  time: "",
  tags: "",
  location: "",
  capacity: "",
  price: "",
  ticketType: "free",
  language: "",
  collaborators: [],
  gallery: [],
  attachments: [],
  coordinates: { lat: null, lng: null },
});
const [rawCoverImage, setRawCoverImage] = useState(null);
const [croppedCoverImage, setCroppedCoverImage] = useState(null);
const [cropModalOpen, setCropModalOpen] = useState(false);

const apiKey = 'AIzaSyAy0C3aQsACcFAPnO-BK1T4nLpSQ9jmkPs'; // Înlocuiește cu cheia ta reală
const { isLoaded, error } = useLoadGoogleMapsScript(apiKey); // Încărcare script
const inputRef = useRef(null);  // Ref pentru input

useEffect(() => {
	if (isLoaded && inputRef.current) {
	  const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
		types: ['geocode'],
	  });
  
	  autocomplete.addListener('place_changed', () => {
		const place = autocomplete.getPlace();
		if (place.geometry && place.geometry.location) {
		  const { lat, lng } = place.geometry.location;
		  setNewEvent((prev) => ({
			...prev,
			location: place.formatted_address,
			coordinates: { lat: lat(), lng: lng() }, // Set coordinates here
		  }));
		} else {
		  showToast("Error", "Please select a valid location from the suggestions", "error");
		}
	  });
	}
  }, [isLoaded]);
  
  
  

  const handleSubmit = async () => {
	if (!newEvent.name || !newEvent.date || !newEvent.coordinates.lat || !newEvent.coordinates.lng) {
	  showToast("Error", "Name, date, and location are required", "error");
	  return;
	}
  
	setIsLoading(true);
	try {
	  // Submit the event data (you can send this to your server)
	  console.log(newEvent);
	} catch (error) {
	  console.error('Error submitting the event:', error);
	  showToast("Error", error.message, "error");
	} finally {
	  setIsLoading(false);
	}
  };
  

	
	const [coverImage, setCoverImage] = useState(null);
	const [newGalleryFiles, setNewGalleryFiles] = useState([]);
	const [newAttachments, setNewAttachments] = useState([]);

	const fileToBase64 = (file) => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = () => resolve(reader.result);
			reader.onerror = (error) => reject(error);
		});
	};

	const handleAddEvent = async () => {
		if (!newEvent.name) {
			showToast("Error", "Name is required", "error");
			return;
		}
	
		setIsLoading(true);
		try {
			// 🔽 Compresie imagine cover (dacă există)
			let base64Image = croppedCoverImage || null;
			if (coverImage) {
				const compressedCover = await compressImage(coverImage);
				base64Image = await fileToBase64(compressedCover);
			}
	
			// 🔽 Compresie imagini galerie
			const compressedGallery = await Promise.all(
				newGalleryFiles.map((file) => compressImage(file))
			);
			const galleryBase64 = await Promise.all(
				compressedGallery.map(fileToBase64)
			);
	
			// 🔼 Fisierele atașate (PDF, etc.) nu se comprimă
			const attachmentsData = await Promise.all(
				newAttachments.map(async (file) => ({
					fileName: file.name,
					fileData: await fileToBase64(file),
				}))
			);
	
			const res = await fetch("/api/events/create", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({
					...newEvent,
					coverImage: base64Image,
					gallery: galleryBase64,
					attachments: attachmentsData,
				}),
			});
	
			const data = await res.json();
	
			if (data.error) {
				showToast("Error", data.error, "error");
			} else {
				setEvent(data);
				showToast("Event created successfully", "", "success");
				navigate(`/events/${data._id}`);
			}
		} catch (error) {
			showToast("Error", error.message, "error");
		} finally {
			setIsLoading(false);
		}
	};
	
	return (
		<Container maxW="container.md" py={8}>
			<VStack spacing={8}>
				<Heading>Create New Event</Heading>

				<Box w="full" p={6} rounded="lg" shadow="md">
					<VStack spacing={4}>
						<Input placeholder="Event Name" value={newEvent.name} onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })} />
						<Textarea placeholder="Event Description" value={newEvent.description} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} />
						<Input type="date" value={newEvent.date} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })} />
						<FormControl id="time" mt={4}>
  <FormLabel>Time</FormLabel>
  <Input
    type="time"
    value={newEvent.time} // ✅ folosește `newEvent.time`
    onChange={(e) =>
      setNewEvent((prev) => ({ ...prev, time: e.target.value }))
    }
  />
</FormControl>


{/* Locație cu Google Places Autocomplete */}
{/* Locație cu Google Places Autocomplete */}
<Stack w="full">
              <Heading as="h4" size="sm">Location</Heading>
              <Input
                ref={inputRef}
                placeholder="Search for a location"
              />
            </Stack>
						<Input placeholder="Tags (comma-separated)" value={newEvent.tags} onChange={(e) => setNewEvent({ ...newEvent, tags: e.target.value })} />
						<Input placeholder="Max Capacity" type="number" value={newEvent.capacity} onChange={(e) => setNewEvent({ ...newEvent, capacity: e.target.value })} />
						<Select value={newEvent.ticketType} onChange={(e) => setNewEvent({ ...newEvent, ticketType: e.target.value })}>
							<option value="free">Free</option>
							<option value="paid">Paid</option>
							<option value="donation">Donation</option>
						</Select>
						<Input placeholder="Price (RON)" type="number" value={newEvent.price} onChange={(e) => setNewEvent({ ...newEvent, price: e.target.value })} />
						<Input placeholder="Language (e.g., en, ro)" value={newEvent.language} onChange={(e) => setNewEvent({ ...newEvent, language: e.target.value })} />
						<Stack w="full">
							<Heading as="h4" size="sm">Cover Image</Heading>
							<Input
  type="file"
  accept="image/*"
  onChange={(e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setRawCoverImage(reader.result); // base64 brut
        setCropModalOpen(true); // deschide popup crop
      };
      reader.readAsDataURL(file);
    }
  }}
/>

						</Stack>

						<Stack w="full">
							<Heading as="h4" size="sm">Gallery Images</Heading>
							<Input type="file" accept="image/*" multiple onChange={(e) => setNewGalleryFiles(Array.from(e.target.files))} />
						</Stack>

						<Stack w="full">
							<Heading as="h4" size="sm">Attachments (PDF, etc.)</Heading>
							<Input type="file" multiple onChange={(e) => setNewAttachments(Array.from(e.target.files))} />
						</Stack>

						<Button colorScheme="blue" onClick={handleAddEvent} w="full" isLoading={isLoading}>
							Add Event
						</Button>
					</VStack>
				</Box>
			</VStack>
			<EventImageCropModal
  isOpen={cropModalOpen}
  onClose={() => setCropModalOpen(false)}
  imageSrc={rawCoverImage}
  onCropComplete={(croppedBase64) => {
    setCroppedCoverImage(croppedBase64);
  }}
/>


		</Container>
	);
};

export default CreateEventPage;
