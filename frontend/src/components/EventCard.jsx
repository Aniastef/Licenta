import {
  Box,
  Button,
  Heading,
  Image,
  Stack,
  Text,
  Tag,
  Wrap,
  Avatar,
  VStack,
  HStack,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function EventCard({ event }) {
  const navigate = useNavigate();
  const [showAllInterested, setShowAllInterested] = useState(false);
  const [showAllGoing, setShowAllGoing] = useState(false);

  const maxToShow = 5;

  const interestedToDisplay = showAllInterested
    ? event.interestedParticipants
    : event.interestedParticipants?.slice(0, maxToShow);

  const goingToDisplay = showAllGoing
    ? event.goingParticipants
    : event.goingParticipants?.slice(0, maxToShow);

  return (
    <Stack
      spacing={6}
      borderWidth="1px"
      borderRadius="md"
      p={4}
      boxShadow="md"
      maxW="800px"
      margin="0 auto"
    >
      {/* Imaginea evenimentului */}
      <Image
        src={event.coverImage || 'https://via.placeholder.com/800x600'}
        alt={`${event.name} - Cover`}
        borderRadius="md"
        objectFit="cover"
        w="100%"
        h="200px"
      />

      {/* Detalii despre eveniment */}
      <Box>
        <Heading as="h2" size="lg">
          {event.name || 'Untitled Event'}
        </Heading>
        <Text fontSize="md" color="gray.500" mt={2}>
          {event.date
            ? new Date(event.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })
            : 'No date provided'}
        </Text>
        <Text fontSize="lg" color="gray.600" mt={2}>
          {event.description || 'No description available.'}
        </Text>
      </Box>

      {/* Afișarea tag-urilor */}
      <Wrap spacing={2}>
        {event.tags?.length > 0 ? (
          event.tags.map((tag, index) => (
            <Tag key={index} colorScheme="purple">
              {tag}
            </Tag>
          ))
        ) : (
          <Text fontSize="sm" color="gray.500">
            No tags available
          </Text>
        )}
      </Wrap>

      {/* Lista participanților interesați */}
      <Box>
        <Text fontWeight="bold" fontSize="md" mb={2}>
          Interested ({event.interestedParticipants?.length || 0})
        </Text>
        <VStack align="start" spacing={4}>
          {interestedToDisplay?.map((participant) => (
            <HStack key={participant._id} spacing={4}>
              <Avatar
                name={`${participant.firstName} ${participant.lastName}`}
                src={participant.profileImage || 'https://via.placeholder.com/150'}
              />
              <Text fontSize="md">
                {participant.firstName} {participant.lastName}
              </Text>
            </HStack>
          ))}
        </VStack>
        {event.interestedParticipants?.length > maxToShow && (
          <Button
            variant="link"
            colorScheme="purple"
            mt={2}
            onClick={() => setShowAllInterested((prev) => !prev)}
          >
            {showAllInterested ? 'Show Less' : 'Show All'}
          </Button>
        )}
      </Box>

      {/* Lista participanților care merg */}
      <Box>
        <Text fontWeight="bold" fontSize="md" mb={2}>
          Going ({event.goingParticipants?.length || 0})
        </Text>
        <VStack align="start" spacing={4}>
          {goingToDisplay?.map((participant) => (
            <HStack key={participant._id} spacing={4}>
              <Avatar
                name={`${participant.firstName} ${participant.lastName}`}
                src={participant.profileImage || 'https://via.placeholder.com/150'}
              />
              <Text fontSize="md">
                {participant.firstName} {participant.lastName}
              </Text>
            </HStack>
          ))}
        </VStack>
        {event.goingParticipants?.length > maxToShow && (
          <Button
            variant="link"
            colorScheme="purple"
            mt={2}
            onClick={() => setShowAllGoing((prev) => !prev)}
          >
            {showAllGoing ? 'Show Less' : 'Show All'}
          </Button>
        )}
      </Box>

      {/* Buton pentru detalii */}
      <Button
        colorScheme="purple"
        onClick={() => navigate(`/events/${event._id}`)} // Navighează la pagina detaliată a evenimentului
        w="full"
      >
        View Event
      </Button>
    </Stack>
  );
}
