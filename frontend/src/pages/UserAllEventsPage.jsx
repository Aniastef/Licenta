import React, { useEffect, useState } from "react";
import {
  Box,
  Text,
  Input,
  SimpleGrid,
  Spinner,
  Image,
  Flex,
  Circle,
  Select,
  Button,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { useParams, Link } from "react-router-dom";

const UserAllEventsPage = () => {
  const { username } = useParams();
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState(null);
  const [tagOptions, setTagOptions] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [roleFilter, setRoleFilter] = useState("");

  useEffect(() => {
    fetchUserEvents();
  }, [username]);

  const fetchUserEvents = async () => {
    try {
      const res = await fetch(`/api/events/user/${username}`, {
        credentials: "include",
      });
      const data = await res.json();
      setEvents(data.events || []);
      setFilteredEvents(data.events || []);
      if (data.user) setUser(data.user);
    } catch (err) {
      console.error("Error fetching events:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const allTags = [...new Set(events.flatMap((e) => e.tags || []))];
    const shuffled = allTags.sort(() => 0.5 - Math.random());
    setTagOptions(shuffled.slice(0, 10));
  }, [events]);

  useEffect(() => {
    let filtered = [...events];

    if (searchTerm.trim()) {
      const terms = searchTerm
        .toLowerCase()
        .split(/[,\s]+/)
        .map((t) => t.trim())
        .filter((t) => t);

      filtered = filtered.filter((e) =>
        terms.some((term) =>
          e.name.toLowerCase().includes(term) ||
          e.tags?.some((tag) => tag.toLowerCase().includes(term)) ||
          e.coHosts?.some((c) => `${c.firstName} ${c.lastName}`.toLowerCase().includes(term))
        )
      );
    }

    if (roleFilter === "organizer") {
      filtered = filtered.filter((e) => e.organizer?._id === user?._id);
    } else if (roleFilter === "cohost") {
      filtered = filtered.filter((e) =>
        e.coHosts?.some((c) => c._id === user?._id)
      );
    }

    if (selectedTags.length > 0) {
      filtered = filtered.filter((e) =>
        selectedTags.every((tag) => e.tags?.includes(tag))
      );
    }

    setFilteredEvents(filtered);
  }, [searchTerm, events, roleFilter, selectedTags, user]);

  return (
    <Box p={4} maxW="1200px" mx="auto">
      <Flex justifyContent="center" alignItems="center" px={4} pt={4} position="relative">
        <Text fontWeight="bold" fontSize="2xl" textAlign="center">
          {user ? `${user.firstName} ${user.lastName}'s Events` : `${username}'s Events`}
        </Text>
        <Flex position="absolute" right={4} gap={2}>
          <Circle size="30px" bg="yellow.400" />
          <Circle size="30px" bg="green.400" />
        </Flex>
      </Flex>

      <Flex mt={4} mb={6} gap={4} wrap="wrap" justify="center">
        <Input
          placeholder="Search by name, tags, or co-hosts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          maxW="350px"
        />
        <Select
          placeholder="Filter by role"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          maxW="200px"
        >
          <option value="organizer">Organizer</option>
          <option value="cohost">Co-Host</option>
        </Select>
      </Flex>

      {tagOptions.length > 0 && (
        <Wrap spacing={2} mb={4} justify="center">
          {tagOptions.map((tag) => (
            <WrapItem key={tag}>
              <Button
                size="sm"
                borderRadius="full"
                variant={selectedTags.includes(tag) ? "solid" : "outline"}
                colorScheme="purple"
                onClick={() =>
                  setSelectedTags((prev) =>
                    prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
                  )
                }
              >
                {tag}
              </Button>
            </WrapItem>
          ))}
        </Wrap>
      )}

      {loading ? (
        <Flex justify="center">
          <Spinner size="xl" />
        </Flex>
      ) : filteredEvents.length === 0 ? (
        <Text>No events found.</Text>
      ) : (
        <>
<Flex wrap="wrap" justify="center" gap={5}>
  {filteredEvents.map((event) => (
    <Link to={`/events/${event._id}`} key={event._id}>
      <Box
        w="350px"
        bg="gray.100"
        borderRadius="md"
        boxShadow="md"
        overflow="hidden"
        border="1px solid #ccc"
        _hover={{ boxShadow: "lg", transform: "scale(1.02)" }}
        transition="all 0.2s"
        cursor="pointer"
        display="flex"
        flexDirection="column"
      >
        <Box h="200px" bg="gray.300" mb={3}>
          {event.coverImage ? (
            <Image
              src={event.coverImage}
              alt={event.name}
              objectFit="cover"
              w="100%"
              h="100%"
            />
          ) : (
            <Flex align="center" justify="center" h="100%" bg="gray.400">
              <Text>No cover image</Text>
            </Flex>
          )}
        </Box>
        <Box textAlign="center" py={2} px={3} minH="120px">
          <Text fontWeight="bold">{event.name}</Text>
          <Text fontSize="sm" color="gray.600">{event.date}</Text>
          <Text fontSize="sm" mt={1}>
            <strong>Organizer:</strong> {event.organizer?.firstName} {event.organizer?.lastName}
          </Text>
          {event.coHosts?.length > 0 && (
            <Text fontSize="sm" color="blue.500">
              <strong>Co-Hosts:</strong>{" "}
              {event.coHosts.map((c) => `${c.firstName} ${c.lastName}`).join(", ")}
            </Text>
          )}
          {event.tags?.length > 0 && (
            <Text fontSize="sm" color="purple.600">
              <strong>Tags:</strong> {event.tags.join(", ")}
            </Text>
          )}
        </Box>
      </Box>
    </Link>
  ))}
</Flex>

</>

          
      )}
    </Box>
  );
};

export default UserAllEventsPage;
