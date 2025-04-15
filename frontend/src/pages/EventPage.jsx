import { Flex, Spinner, Text, VStack } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import EventCard from '../components/EventCard';
import CommentsSection from '../components/CommentsSection';
import { useRecoilValue } from 'recoil';
import userAtom from '../atoms/userAtom';

export default function EventPage() {
  const { id } = useParams(); // Obține ID-ul evenimentului din URL
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentUser = useRecoilValue(userAtom);


  const fetchEvent = async () => {
    try {
       const res = await fetch(`/api/events/${id}`, { credentials: "include" });
       if (!res.ok) throw new Error("Failed to fetch event details");
       const data = await res.json();
       console.log("Event data received:", data);
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
    <Flex direction="column">
      <EventCard event={event}  currentUserId={currentUser._id} fetchEvent={fetchEvent} />
      <CommentsSection resourceId={id} resourceType="Event"/>
    </Flex>
      
  );
}
