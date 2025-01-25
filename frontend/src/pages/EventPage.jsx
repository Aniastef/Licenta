import { Flex, Spinner, Text, VStack } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import EventCard from '../components/EventCard';
import CommentsSection from '../components/CommentsSection';

export default function EventPage() {
  const { id } = useParams(); // Obține ID-ul evenimentului din URL
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEvent = async () => {
    try {
      const res = await fetch(`/api/events/${id}`);
      if (!res.ok) throw new Error("Failed to fetch event details");
      const data = await res.json();
      setEvent(data.event);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchEvent();
  }, [id]);

  return (
    <Flex align={'center'} justify={'center'} py={6}>
      <VStack spacing={8} w={'full'} maxW={'container.md'}>
        {isLoading ? (
          <Spinner size="xl" />
        ) : error ? (
          <Text color="red.500">{error}</Text>
        ) : event ? (
          <>
            <EventCard event={event} />
            <CommentsSection resourceId={id} resourceType="Event"/> {/* Comentarii pentru eveniment */}
          </>
        ) : (
          <Text color="gray.500">No event found.</Text>
        )}
      </VStack>
    </Flex>
  );
}
