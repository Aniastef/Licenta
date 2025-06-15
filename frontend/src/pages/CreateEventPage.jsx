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
  HStack,
  Flex,
  IconButton,
  CloseButton,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import useShowToast from '../hooks/useShowToast';
import { useSetRecoilState } from 'recoil';
import eventAtom from '../atoms/eventAtom';
import { useNavigate } from 'react-router-dom';
import { AddIcon } from '@chakra-ui/icons';
import useLoadGoogleMapsScript from '../hooks/useLoadGoogleMapsScript';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';
import imageCompression from 'browser-image-compression';
import EventImageCropModal from '../components/EventImageCropModal';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

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
    console.error('Compression failed:', err);
    return file;
  }
};

const EVENT_CATEGORIES = [
  'Music',
  'Art',
  'Tech',
  'Workshop',
  'Theatre',
  'Festival',
  'Literature',
  'Exhibition',
  'Dance',
  'Film',
  'Charity',
  'Community',
  'Education',
  'Universal',
];

const LANGUAGES = [
  { label: '🇬🇧 English', value: 'en' },
  { label: '🇷🇴 Romanian', value: 'ro' },
  { label: '🇫🇷 French', value: 'fr' },
  { label: '🇩🇪 German', value: 'de' },
  { label: '🇪🇸 Spanish', value: 'es' },
  { label: '🇮🇹 Italian', value: 'it' },
  { label: '🇵🇹 Portuguese', value: 'pt' },
  { label: '🇳🇱 Dutch', value: 'nl' },
  { label: '🇸🇪 Swedish', value: 'sv' },
  { label: '🇯🇵 Japanese', value: 'ja' },
  { label: '🇨🇳 Chinese', value: 'zh' },
  { label: '🌐 Other', value: 'other' },
];

const CreateEventPage = () => {
  const setEvent = useSetRecoilState(eventAtom);
  const navigate = useNavigate();
  const showToast = useShowToast();
  const [isLoading, setIsLoading] = useState(false);
  const [newEvent, setNewEvent] = useState({
    name: '',
    description: '',
    date: '',
    time: '',
    tags: '',
    location: '',
    capacity: '',
    price: '',
    ticketType: 'free',
    language: '',
    collaborators: [],
    gallery: [],
    attachments: [],
    coordinates: { lat: null, lng: null },
  });
  const [rawCoverImage, setRawCoverImage] = useState(null);
  const [croppedCoverImage, setCroppedCoverImage] = useState(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [coverImage, setCoverImage] = useState(null);
  const [newGalleryFiles, setNewGalleryFiles] = useState([]);
  const [newAttachments, setNewAttachments] = useState([]);

  const apiKey = 'AIzaSyAy0C3aQsACcFAPnO-BK1T4nLpSQ9jmkPs';
  const { isLoaded, error } = useLoadGoogleMapsScript(apiKey); 
  const inputRef = useRef(null); 

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
          showToast('Error', 'Please select a valid location from the suggestions', 'error');
        }
      });
    }
  }, [isLoaded]);

  const handleSubmit = async () => {
    if (
      !newEvent.name ||
      !newEvent.date ||
      !newEvent.coordinates.lat ||
      !newEvent.coordinates.lng
    ) {
      showToast('Error', 'Name, date, and location are required', 'error');
      return;
    }

    setIsLoading(true);
    try {
      // Submit the event data (you can send this to your server)
      console.log(newEvent);
    } catch (error) {
      console.error('Error submitting the event:', error);
      showToast('Error', error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

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
      showToast('Error', 'Please complete all required fields: name and date.', 'error');
      return;
    }

    if (!coverImage) {
      showToast('Error', 'Please upload a cover image.', 'error');
      return;
    }

    if (newEvent.ticketType === 'paid' && (!newEvent.capacity || Number(newEvent.capacity) <= 0)) {
      showToast('Error', 'Please specify a valid capacity for paid tickets.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      let base64Image = null;

      if (coverImage?.startsWith('data:')) {
        base64Image = coverImage;
      } else {
        const compressedCover = await compressImage(coverImage);
        base64Image = await fileToBase64(compressedCover);
      }

      const compressedGallery = await Promise.all(
        newGalleryFiles.map((file) => compressImage(file)),
      );
      const galleryBase64 = await Promise.all(compressedGallery.map(fileToBase64));

      const attachmentsData = await Promise.all(
        newAttachments.map(async (file) => ({
          fileName: file.name,
          fileData: await fileToBase64(file),
        })),
      );

      const res = await fetch('/api/events/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...newEvent,
          coverImage: base64Image,
          gallery: galleryBase64,
          attachments: attachmentsData,
        }),
      });

      const data = await res.json();

      if (data.error) {
        showToast('Error', data.error, 'error');
      } else {
        setEvent(data);
        showToast('Event created successfully', '', 'success');
        navigate(`/events/${data._id}`);
      }
    } catch (error) {
      showToast('Error', error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="container.md">
      <VStack spacing={8}>
        <Heading>Create new event</Heading>

        <Box w="full" p={6} rounded="lg" shadow="md">
          <VStack spacing={4}>
            <Input
              placeholder="Event Name"
              value={newEvent.name}
              onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
            />
            <FormControl>
              <FormLabel>Description</FormLabel>
              <ReactQuill
                theme="snow"
                value={newEvent.description}
                onChange={(value) => setNewEvent({ ...newEvent, description: value })}
                modules={{
                  toolbar: [
                    [{ header: [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ list: 'ordered' }, { list: 'bullet' }],
                    [{ align: [] }],
                    [{ color: [] }, { background: [] }],
                    ['link'],
                    ['clean'],
                  ],
                }}
                formats={[
                  'header',
                  'bold',
                  'italic',
                  'underline',
                  'strike',
                  'list',
                  'bullet',
                  'align',
                  'color',
                  'background',
                  'link',
                ]}
                style={{ height: '200px', width: '100%', marginBottom: '30px' }}
              />
            </FormControl>

            <Stack w="full">
              <FormLabel mb={-1} mt={2}>
                Date
              </FormLabel>
              <HStack align="start" spacing={4}>
                <Input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                />
                <Input
                  type="time"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent((prev) => ({ ...prev, time: e.target.value }))}
                />
              </HStack>
            </Stack>

            <Stack w="full">
              <FormLabel mb={-1}>Location</FormLabel>
              <Input ref={inputRef} placeholder="Search for a location" />
            </Stack>
            <Stack w="full">
              <FormLabel mb={-1}>Category</FormLabel>
              <Select
                placeholder="Select category"
                value={newEvent.category}
                onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
              >
                {EVENT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </Select>
            </Stack>

            <Input
              placeholder="Tags (comma-separated)"
              value={newEvent.tags}
              onChange={(e) => setNewEvent({ ...newEvent, tags: e.target.value })}
            />

            <Stack w="full">
              <FormLabel mb={-1}>Ticket type</FormLabel>

              <Select
                value={newEvent.ticketType}
                onChange={(e) => setNewEvent({ ...newEvent, ticketType: e.target.value })}
              >
                <option value="free">Free</option>
                <option value="paid">Paid</option>
                <option value="donation">Donation</option>
              </Select>
            </Stack>

            {newEvent.ticketType === 'paid' && (
              <>
                <Input
                  placeholder="Price (EUR)"
                  type="number"
                  value={newEvent.price}
                  onChange={(e) => setNewEvent({ ...newEvent, price: e.target.value })}
                />
                <Input
                  placeholder="Max Capacity"
                  type="number"
                  value={newEvent.capacity}
                  onChange={(e) => setNewEvent({ ...newEvent, capacity: e.target.value })}
                />
              </>
            )}
            <Stack w="full">
              <FormLabel mb={-1}>Language</FormLabel>
              <Select
                placeholder="Select language"
                value={newEvent.language}
                onChange={(e) => setNewEvent({ ...newEvent, language: e.target.value })}
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </Select>
            </Stack>
            <Stack w="full">
              <FormLabel mb={-1}>Cover image</FormLabel>

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
              <FormLabel mb={-1}>Gallery images</FormLabel>
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setNewGalleryFiles(Array.from(e.target.files))}
              />
            </Stack>

            <Stack w="full">
              <FormLabel mb={-1}>Attachments</FormLabel>
              <Input
                type="file"
                multiple
                onChange={(e) => setNewAttachments(Array.from(e.target.files))}
              />
            </Stack>

            <Button colorScheme="purple" onClick={handleAddEvent} w="full" isLoading={isLoading}>
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
          setCoverImage(croppedBase64); // ✅ Adaugă această linie!
        }}
      />
    </Container>
  );
};

export default CreateEventPage;
