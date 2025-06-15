// EditEventPage.jsx
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
  useToast,
  Image,
  CloseButton,
  Flex,
  HStack,
  Link,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useLoadGoogleMapsScript from '../hooks/useLoadGoogleMapsScript';
import { useRecoilValue } from 'recoil';
import userAtom from '../atoms/userAtom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import imageCompression from 'browser-image-compression';
import EventImageCropModal from '../components/EventImageCropModal';

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
  'Other',
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
  { label: '🇯🇵 Japanese', value: 'ja' },
  { label: '🇨🇳 Chinese', value: 'zh' },
  { label: '🌐 Other', value: 'other' },
];

export default function EditEventPage() {
  const { eventId } = useParams();
  const [eventData, setEventData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const inputRef = useRef(null);
  const mapRef = useRef(null);
  const navigate = useNavigate();
  const toast = useToast();
  const { isLoaded } = useLoadGoogleMapsScript('YOUR_API_KEY');
  const [coverImage, setCoverImage] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const currentUser = useRecoilValue(userAtom);
  const [rawCoverImage, setRawCoverImage] = useState(null);
  const [croppedCoverImage, setCroppedCoverImage] = useState(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleDownload = (fileName, base64Data) => {
    const byteString = atob(base64Data.split(',')[1]);
    const mimeString = base64Data.split(',')[0].split(':')[1].split(';')[0];

    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    const blob = new Blob([ab], { type: mimeString });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`/api/events/${eventId}`, { credentials: 'include' });
        const data = await res.json();
        if (!res.ok || !data.event) throw new Error(data.error || 'Failed to load event');
        if (data.event.user._id !== currentUser._id) {
          toast({ title: 'Unauthorized', status: 'error' });
          navigate('/');
          return;
        }
        setEventData(data.event);
      } catch (err) {
        toast({ title: 'Error loading event', description: err.message, status: 'error' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvent();
  }, [eventId, currentUser, navigate]);

  useEffect(() => {
    if (isLoaded && inputRef.current) {
      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['geocode'],
      });
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.geometry?.location) {
          setEventData((prev) => ({
            ...prev,
            location: place.formatted_address,
            coordinates: {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
            },
          }));
        }
      });
    }
  }, [isLoaded]);

  useEffect(() => {
    if (
      isLoaded &&
      eventData?.coordinates &&
      typeof eventData.coordinates.lat === 'number' &&
      typeof eventData.coordinates.lng === 'number' &&
      mapRef.current
    ) {
      const map = new window.google.maps.Map(mapRef.current, {
        center: eventData.coordinates,
        zoom: 14,
      });
      new window.google.maps.Marker({ position: eventData.coordinates, map });
    }
  }, [isLoaded, eventData?.coordinates]);

  const handleChange = (field, value) => {
    setEventData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRemoveGalleryImage = (index) => {
    setEventData((prev) => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index),
    }));
  };

  const handleRemoveAttachment = (index) => {
    setEventData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const handleUpdate = async () => {
    try {
      const base64Image = croppedCoverImage || eventData.coverImage;
      const galleryBase64 = await Promise.all(galleryFiles.map(fileToBase64));

      const attachmentsData = await Promise.all(
        attachments.map(async (file) => ({
          fileName: file.name,
          fileData: await fileToBase64(file),
        })),
      );

      const combinedAttachments = [...(eventData.attachments || []), ...attachmentsData];

      const res = await fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...eventData,
          coordinates: eventData.coordinates,
          coverImage: base64Image,
          gallery: [...(eventData.gallery || []), ...galleryBase64],
          attachments: combinedAttachments,
        }),
      });

      const data = await res.json();
      if (data.error) {
        toast({ title: 'Update failed', description: data.error, status: 'error' });
      } else {
        toast({ title: 'Event updated', status: 'success' });
        navigate(`/events/${eventId}`);
      }
    } catch (err) {
      toast({ title: 'Error updating', description: err.message, status: 'error' });
    }
  };

  if (isLoading || !eventData) return <Text>Loading...</Text>;

  return (
    <Container maxW="container.md">
      <VStack spacing={8}>
        <Heading>Edit Event</Heading>

        <Box w="full" p={6} rounded="lg" shadow="md">
          <VStack spacing={4}>
            <Input
              placeholder="Event Name"
              value={eventData.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
            <FormControl w="full">
              <FormLabel>Description</FormLabel>

              <ReactQuill
                theme="snow"
                value={eventData.description}
                onChange={(value) => handleChange('description', value)}
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
              <HStack align="start" spacing={4}>
                <FormLabel mb={-1} mt={2}>
                  Date
                </FormLabel>

                <Input
                  type="date"
                  value={eventData.date ? eventData.date.substring(0, 10) : ''}
                  onChange={(e) => handleChange('date', e.target.value)}
                />
                <Input
                  type="time"
                  value={eventData.time || ''}
                  onChange={(e) => handleChange('time', e.target.value)}
                />
              </HStack>
            </Stack>

            <Stack w="full">
              <FormLabel mb={-1}>Location</FormLabel>
              <HStack align="start" spacing={4}>
                <Input
                  ref={inputRef}
                  value={eventData.location || ''}
                  onChange={(e) => handleChange('location', e.target.value)}
                  placeholder="Search for a new location"
                  flex="1"
                />
                {eventData.coordinates && <Box w="50%" h="200px" ref={mapRef} borderRadius="md" />}
              </HStack>
            </Stack>
            <Stack w="full">
              <FormLabel mb={-1}>Category</FormLabel>
              <Select
                placeholder="Select category"
                value={eventData.category || ''}
                onChange={(e) => handleChange('category', e.target.value)}
              >
                {EVENT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </Select>
            </Stack>

            <Input
              placeholder="Tags"
              value={eventData.tags?.join(', ') || ''}
              onChange={(e) =>
                handleChange(
                  'tags',
                  e.target.value.split(',').map((t) => t.trim()),
                )
              }
            />
            <Input
              placeholder="Max Capacity"
              type="number"
              value={eventData.capacity || ''}
              onChange={(e) => handleChange('capacity', Number(e.target.value))}
            />

            <Stack w="full">
              <FormLabel mb={-1}>Ticket type</FormLabel>
              <Select
                value={eventData.ticketType}
                onChange={(e) => handleChange('ticketType', e.target.value)}
              >
                <option value="free">Free</option>
                <option value="paid">Paid</option>
                <option value="donation">Donation</option>
              </Select>
            </Stack>

            <Input
              placeholder="Price"
              type="number"
              value={eventData.price || ''}
              onChange={(e) => handleChange('price', Number(e.target.value))}
            />
            <Stack w="full">
              <FormLabel mb={-1}>Language</FormLabel>
              <Select
                placeholder="Select language"
                value={eventData.language || ''}
                onChange={(e) => handleChange('language', e.target.value)}
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
              {(croppedCoverImage || eventData.coverImage) && (
                <Image
                  src={croppedCoverImage || eventData.coverImage}
                  alt="Cover Preview"
                  boxWidth="200px"
                  boxHeight="100%"
                  objectFit="cover"
                />
              )}
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setRawCoverImage(reader.result);
                      setCropModalOpen(true);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </Stack>

            <Stack w="full">
              <FormLabel mb={-1}>Gallery images</FormLabel>
              <Flex wrap="wrap" gap={3}>
                {eventData.gallery?.map((imgUrl, idx) => (
                  <Box key={idx} position="relative">
                    <Image src={imgUrl} boxSize="120px" objectFit="cover" borderRadius="md" />
                    <CloseButton
                      size="sm"
                      position="absolute"
                      top={1}
                      right={1}
                      onClick={() => handleRemoveGalleryImage(idx)}
                    />
                  </Box>
                ))}
              </Flex>
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setGalleryFiles(Array.from(e.target.files))}
              />
            </Stack>

            <Stack w="full">
              <FormLabel mb={-1}>Attachments</FormLabel>
              {eventData.attachments?.map((att, idx) => (
                <Flex key={idx} align="center" justify="space-between">
                  <Button
                    variant="link"
                    color="blue.500"
                    onClick={() => window.open(att.fileUrl, '_blank')}
                  >
                    {att.fileName}
                  </Button>
                  <CloseButton onClick={() => handleRemoveAttachment(idx)} />
                </Flex>
              ))}
              <Input
                type="file"
                multiple
                onChange={(e) => setAttachments(Array.from(e.target.files))}
              />
            </Stack>

            <Button colorScheme="purple" onClick={handleUpdate} isLoading={isLoading}>
              Save Changes
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
}
