import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Flex,
  Text,
  Image,
  Select,
  Input,
  Grid,
  Tag,
  TagCloseButton,
  TagLabel,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import RectangleShape from "../assets/RectangleShape";

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [sortOption, setSortOption] = useState("");
  const [filterText, setFilterText] = useState("");
  const [filterGallery, setFilterGallery] = useState("");
  const [searchBy, setSearchBy] = useState("name");
  const [filterTags, setFilterTags] = useState([]); // Pentru tag-uri
  const [tagInput, setTagInput] = useState(""); // Input pentru tag-uri
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

  const handleGalleryFilter = (e) => setFilterGallery(e.target.value);

  const handleTagInputChange = (e) => setTagInput(e.target.value);

  const handleAddTag = () => {
    if (tagInput.trim() && !filterTags.includes(tagInput.trim())) {
      setFilterTags([...filterTags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag) => {
    setFilterTags(filterTags.filter((t) => t !== tag));
  };

  useEffect(() => {
    let updatedEvents = [...events];

    updatedEvents = updatedEvents.filter((event) => {
      const matchesName =
        searchBy === "name"
          ? event.name.toLowerCase().includes(filterText.toLowerCase())
          : true;

      const matchesCreator =
        searchBy === "creator"
          ? `${event.user?.firstName || ""} ${event.user?.lastName || ""}`
              .toLowerCase()
              .includes(filterText.toLowerCase()) ||
            `${event.user?.lastName || ""} ${event.user?.firstName || ""}`
              .toLowerCase()
              .includes(filterText.toLowerCase())
          : true;

      const matchesGallery = filterGallery
        ? event.gallery === filterGallery
        : true;

      const matchesTags =
        filterTags.length > 0
          ? filterTags.every((tag) =>
              event.tags.map((t) => t.toLowerCase()).includes(tag.toLowerCase())
            )
          : true;

      return matchesName && matchesCreator && matchesGallery && matchesTags;
    });

    if (sortOption === "name") {
      updatedEvents.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOption === "date") {
      updatedEvents.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    setFilteredEvents(updatedEvents);
  }, [events, sortOption, filterText, filterGallery, filterTags, searchBy]);

  return (
    <Box>
      <RectangleShape
        bgColor="#62cbe0"
        title="All Events"
        minW="300px"
        maxW="400px"
        textAlign="left"
      />

      {/* Filter and sort bar */}
      <Flex mt={4} direction="row" justify="space-between" gap={4}>
        <Flex direction="row" alignItems="center" gap={4}>
          <Text fontWeight="bold">Search by:</Text>
          <Select
            value={searchBy}
            onChange={(e) => setSearchBy(e.target.value)}
            w="150px"
            bg="gray.100"
          >
            <option value="name">Event Name</option>
            <option value="creator">Creator</option>
          </Select>
          <Input
            placeholder={`Search by ${searchBy}...`}
            value={filterText}
            onChange={handleFilterChange}
            w="200px"
            bg="gray.100"
          />
        </Flex>
        <Select
          placeholder="Filter by gallery"
          value={filterGallery}
          onChange={handleGalleryFilter}
          w="200px"
          bg="gray.100"
        >
          <option value="music">Music</option>
          <option value="art">Art</option>
          <option value="conference">Conference</option>
        </Select>
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

      {/* Tag filter */}
      <Flex mt={4} direction="row" alignItems="center" gap={2}>
        <Input
          placeholder="Add a tag..."
          value={tagInput}
          onChange={handleTagInputChange}
          onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
          w="200px"
          bg="gray.100"
        />
        <button onClick={handleAddTag}>Add Tag</button>
        <Flex gap={2}>
          {filterTags.map((tag) => (
            <Tag key={tag} bg="blue.100" borderRadius="full">
              <TagLabel>{tag}</TagLabel>
              <TagCloseButton onClick={() => handleRemoveTag(tag)} />
            </Tag>
          ))}
        </Flex>
      </Flex>

      {/* Display events */}
      <Box px={4} mt={4}>
        {loading ? (
          <Text>Loading events...</Text>
        ) : filteredEvents.length === 0 ? (
          <Text mt={5} textAlign="center">
            No events found.
          </Text>
        ) : (
          <Grid
            templateColumns={{
              base: "repeat(1, 1fr)",
              md: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
            }}
            gap={6}
          >
            {filteredEvents.map((event) => (
              <Link to={`/events/${event._id}`} key={event._id}>
                <Box
                  bg="gray.200"
                  p={4}
                  borderRadius="md"
                  overflow="hidden"
                  _hover={{ transform: "scale(1.02)", transition: "0.2s" }}
                >
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
                        alt={`${event.name} cover`}
                        width="100%"
                        height="100%"
                        objectFit="cover"
                      />
                    ) : (
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        bg="gray.400"
                        height="100%"
                      >
                        <Text>No cover photo available</Text>
                      </Box>
                    )}
                  </Box>
                  <Heading size="md">{event.name}</Heading>
                  <Text>
                    Taking place on {new Date(event.date).toLocaleDateString()}
                  </Text>
                  <Text>
                    Creator: {event.user?.firstName || "Unknown"}{" "}
                    {event.user?.lastName || ""}
                  </Text>
                </Box>
              </Link>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default EventsPage;
