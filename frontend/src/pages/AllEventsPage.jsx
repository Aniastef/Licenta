import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Flex,
  Text,
  Image,
  Select,
  Input,
  Button,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import RectangleShape from "../assets/RectangleShape";

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [sortOption, setSortOption] = useState("");
  const [filterText, setFilterText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/events");
      const data = await response.json();
      setEvents(data.events || []);
      setFilteredEvents(data.events || []);
    } catch (error) {
      console.error("Error fetching events:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSortChange = (e) => setSortOption(e.target.value);

  const handleFilterChange = (e) => setFilterText(e.target.value);

  useEffect(() => {
    let updatedEvents = [...events];

    updatedEvents = updatedEvents.filter((event) =>
      event.name.toLowerCase().includes(filterText.toLowerCase())
    );

    if (sortOption === "name") {
      updatedEvents.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOption === "date") {
      updatedEvents.sort((a, b) => new Date(b.date) - new Date(a.date)); // Descending by date
    }

    setFilteredEvents(updatedEvents);
  }, [events, sortOption, filterText]);

  const renderEvents = () => {
    if (filteredEvents.length === 0) {
      return (
        <Text mt={5} textAlign="center">
          No events found.
        </Text>
      );
    }

    return filteredEvents.map((event) => (
      <Link to={`/events/${event._id}`} key={event._id}>
        <Box bg="gray.200" p={4} mb={4} borderRadius="md">
          <Box
            width="100%"
            height="200px"
            bg="gray.300"
            mb={4}
            borderRadius="md"
            overflow="hidden"
          >
            {event.coverImage ? (
              <Image
                src={event.coverImage}
                alt={`${event.name} cover photo`}
                width="100%"
                height="100%"
                objectFit="cover"
              />
            ) : (
              <Box
                width="100%"
                height="100%"
                display="flex"
                alignItems="center"
                justifyContent="center"
                bg="gray.400"
              >
                <Text>No cover photo available</Text>
              </Box>
            )}
          </Box>
          <Flex direction="row" justify="space-between">
            <Heading size="md">{event.name}</Heading>
            <Text>Taking place on {new Date(event.date).toLocaleDateString()}</Text>
          </Flex>
          <Text> Creator: {event.user?.firstName || "Unknown"}{" "}
          {event.user?.lastName || ""}</Text>
        </Box>
      </Link>
    ));
  };

  return (
    <>
      <Box mt={8}>
        <RectangleShape
          bgColor="#62cbe0"
          title="All Events"
          minW="300px"
          maxW="400px"
          textAlign="left"
        />
        <Box mt={5} mx={5}>
          <Flex mt={4} direction="row" justify="space-between" gap={4}>
            <Input
              placeholder="Search events..."
              value={filterText}
              onChange={handleFilterChange}
              w="300px"
              bg="gray.100"
            />
            <Select
              placeholder="Sort by"
              value={sortOption}
              onChange={handleSortChange}
              w="200px"
              bg="gray.100"
            >
              <option value="name">Name</option>
              <option value="date">Date</option>
            </Select>
          </Flex>
          <Box mt={4}>{loading ? <Text>Loading events...</Text> : renderEvents()}</Box>
        </Box>
      </Box>
    </>
  );
};

export default EventsPage;
