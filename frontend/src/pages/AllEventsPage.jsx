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
  Stack,
  Checkbox,
  HStack,
  SimpleGrid,
  Wrap,
  WrapItem,
  Divider,
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  CheckboxGroup,
  Circle,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";

const EVENTS_PER_PAGE = 12;
const ALL_EVENT_TAGS = ["Music", "Art", "Tech", "Workshop", "Theatre"];
const TICKET_TYPES = ["free", "paid", "donation"];
const LANGUAGES = ["english", "romanian", "french", "german"];
const PRICE_RANGES = [
  { label: "Sub 1000", min: 0, max: 999 },
  { label: "1000 - 1500", min: 1000, max: 1500 },
  { label: "1500 - 2000", min: 1500, max: 2000 },
  { label: "2000 - 3000", min: 2000, max: 3000 },
  { label: "Peste 3000", min: 3001, max: Infinity },
];
const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [sortOption, setSortOption] = useState("date");
  const [filterText, setFilterText] = useState("");
  const [searchBy, setSearchBy] = useState("name");
  const [filterTags, setFilterTags] = useState([]);
  const [filterTicketType, setFilterTicketType] = useState("");
  const [filterLanguage, setFilterLanguage] = useState("");
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [priceFilters, setPriceFilters] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filterTicketTypes, setFilterTicketTypes] = useState([]);


  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/events", { credentials: "include" });
      const data = await response.json();
      setEvents(data.events || []);
    } catch (error) {
      console.error("Error fetching events:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const togglePriceFilter = (range) => {
    setPriceFilters((prev) => {
      const exists = prev.some((r) => r.label === range.label);
      return exists
        ? prev.filter((r) => r.label !== range.label)
        : [...prev, range];
    });
  };
  
  useEffect(() => {
    let updated = [...events];

    updated = updated.filter((event) => {
      const name = event.name || "";
      const userFirstName = event.user?.firstName || "";
      const userLastName = event.user?.lastName || "";

      let matchSearch = true;
const lowerFilter = filterText.toLowerCase();

if (filterText) {
  if (searchBy === "name") {
    matchSearch = (event.name || "").toLowerCase().includes(lowerFilter);
  } else if (searchBy === "creator") {
    const fullName = `${event.user?.firstName || ""} ${event.user?.lastName || ""}`.toLowerCase();
    matchSearch = fullName.includes(lowerFilter);
  } else if (searchBy === "location") {
    const loc = event.location?.toLowerCase() || "";
    // extrage ultimele 2 componente (oraș, țară)
    const parts = loc.split(",").map(p => p.trim());
    const cityCountry = parts.slice(-2).join(" ");
    matchSearch = cityCountry.includes(lowerFilter);
  }
   else if (searchBy === "tags") {
    matchSearch = (event.tags || []).some((tag) => tag.toLowerCase().includes(lowerFilter));
  }
}

      const matchTags =
        filterTags.length === 0 ||
        filterTags.every((tag) => (event.tags || []).includes(tag));
        
        const matchTicketType = 
        filterTicketTypes.length === 0 || filterTicketTypes.includes(event.ticketType);
              const matchLanguage = filterLanguage ? event.language === filterLanguage : true;
        
        const price = event.price || 0;
        const matchPriceSlider = price >= priceRange[0] && price <= priceRange[1];
        const matchPriceFilters =
          priceFilters.length === 0 || priceFilters.some((range) => price >= range.min && price <= range.max);
        

          return (
            matchSearch &&
            matchTags &&
            matchTicketType &&
            matchLanguage &&
            matchPriceSlider &&
            matchPriceFilters
          );
              });

    if (sortOption === "name") updated.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    else if (sortOption === "interested") updated.sort((a, b) => (b.interestedParticipants?.length || 0) - (a.interestedParticipants?.length || 0));
    else if (sortOption === "going") updated.sort((a, b) => (b.goingParticipants?.length || 0) - (a.goingParticipants?.length || 0));
    else updated.sort((a, b) => new Date(b.date) - new Date(a.date));

    setFilteredEvents(updated);
    setCurrentPage(1);
  }, [events, sortOption, filterText, searchBy, filterTags, filterTicketTypes, filterLanguage, priceRange, priceFilters]);

  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * EVENTS_PER_PAGE,
    currentPage * EVENTS_PER_PAGE
  );

  const totalPages = Math.ceil(filteredEvents.length / EVENTS_PER_PAGE);

  return (
    <Box p={4}>
     <Flex justifyContent="center" alignItems="center" px={4} pt={4} position="relative">
       <Text fontWeight="bold" fontSize="2xl" textAlign="center">
          All Events
       </Text>
       <Flex position="absolute" right={4} gap={2}>
         <Circle size="30px" bg="yellow.400" />
         <Circle size="30px" bg="green.400" />
       </Flex>
     </Flex>
    <Flex justify="space-between" align="center" mb={4} wrap="wrap">
      <HStack spacing={4} mb={2}>
        <Text>Search by:</Text>
        <Select value={searchBy} onChange={(e) => setSearchBy(e.target.value)} w="160px">
  <option value="name">Event Name</option>
  <option value="creator">Creator</option>
  <option value="location">Location</option>
  <option value="tags">Tags</option>
</Select>

        <Input
          placeholder={`Search by ${searchBy}...`}
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          w="250px"
        />
      </HStack>
      
      <HStack spacing={2}>
  <Text>Sort by:</Text>
  <Select
    value={sortOption}
    onChange={(e) => setSortOption(e.target.value)}
    w="200px"
  >
    <option value="date">Date</option>
    <option value="name">Name</option>
    <option value="interested">Interested Users</option>
    <option value="going">Going Users</option>
    <option value="location">Location</option>
  </Select>
</HStack>

    </Flex>

    <Flex direction={{ base: "column", md: "row" }} gap={6}>
      {/* Sidebar Filters */}
      <Box w="220px" p={4} borderWidth={1} borderRadius="lg">
        <Text fontWeight="bold">Pret</Text>
        <Stack spacing={1} mt={2}>
          {PRICE_RANGES.map((range) => (
            <Checkbox
              key={range.label}
              isChecked={priceFilters.some((r) => r.label === range.label)}
              onChange={() => togglePriceFilter(range)}
            >
              {range.label}
            </Checkbox>
          ))}
        </Stack>

        <Divider my={3} />
        <Text fontWeight="bold">Price Range</Text>
        <RangeSlider defaultValue={[0, 10000]} min={0} max={10000} onChangeEnd={(val) => setPriceRange(val)}>
          <RangeSliderTrack><RangeSliderFilledTrack /></RangeSliderTrack>
          <RangeSliderThumb index={0} /><RangeSliderThumb index={1} />
        </RangeSlider>
        <Text fontSize="sm">{priceRange[0]} - {priceRange[1]} RON</Text>

        <Divider my={3} />
        <Text fontWeight="bold">Ticket Type</Text>
<CheckboxGroup value={filterTicketTypes} onChange={setFilterTicketTypes}>
  <Stack spacing={1}>
    {TICKET_TYPES.map((type) => (
      <Checkbox key={type} value={type}>
        {type}
      </Checkbox>
    ))}
  </Stack>
</CheckboxGroup>


        <Divider my={3} />
        <Text fontWeight="bold">Language</Text>
        <Select value={filterLanguage} onChange={(e) => setFilterLanguage(e.target.value)} size="sm" mt={1}>
          <option value="">All</option>
          {LANGUAGES.map((lang) => (
            <option key={lang} value={lang}>{lang}</option>
          ))}
        </Select>

        <Divider my={3} />
        <Text fontWeight="bold">Tags</Text>
        <Wrap spacing={2} mt={2} maxW="100%">
          {ALL_EVENT_TAGS.map((tag) => (
            <WrapItem key={tag} w="100%">
              <Button
                size="sm"
                width="100%"
                borderRadius="full"
                colorScheme={filterTags.includes(tag) ? "blue" : "gray"}
                onClick={() =>
                  setFilterTags((prev) =>
                    prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
                  )
                }
              >
                {tag}
              </Button>
            </WrapItem>
          ))}
        </Wrap>
      </Box>

        {/* Events List */}
        <Box flex={1}>
          {loading ? (
            <Text>Loading...</Text>
          ) : paginatedEvents.length === 0 ? (
            <Text>No events found.</Text>
          ) : (
            <>
              <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={5}>
                {paginatedEvents.map((event) => (
                  <Link to={`/events/${event._id}`} key={event._id}>
                    <Box
                      p={0}
                      bg="gray.100"
                      borderRadius="md"
                      boxShadow="0 10px 10px rgba(0, 0, 0, 0.1)"
                      overflow="hidden"
                      border="1px solid #ccc"
                      _hover={{ boxShadow: "lg", transform: "scale(1.02)" }}
                      transition="all 0.2s"
                      cursor="pointer"
                      h="100%"
                      display="flex"
                      flexDirection="column"
                    >
                      <Box h="200px" bg="gray.300" mb={3}>
                        {event.coverImage ? (
                          <Image src={event.coverImage} alt={event.name} objectFit="cover" w="100%" h="100%" objectFit="cover" />
                        ) : (
                          <Flex align="center" justify="center" h="100%" bg="gray.400">
                            <Text>No cover image</Text>
                          </Flex>
                        )}
                      </Box>

                      <Box textAlign="center" py={3} minH="120px">
  <Text fontWeight="bold">{event.name}</Text>
  <Text fontSize="sm" color="gray.600">Taking place on {new Date(event.date).toLocaleDateString()}</Text>
  <Text fontSize="sm" color="blue.600">
  <strong>Location:</strong>{" "}
  {event.location
    ? event.location.split(",").slice(-2).map(p => p.trim()).join(", ")
    : "N/A"}
</Text>
  <Text fontSize="sm"><strong> Creator:</strong> {event.user?.firstName || "-"} {event.user?.lastName || ""}</Text>
  <Text fontSize="sm" color="orange.600"><strong>Going:</strong> {event.goingParticipants?.length || 0}</Text>

  {["paid", "donation"].includes(event.ticketType) && event.price > 0 && (
    <Text mt={1} fontSize="sm" color="green">
      <strong>Price:</strong> {event.price} RON
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
              </SimpleGrid>

              <Flex mt={6} align="center" justify="space-between">
                <Text>
                  {1 + (currentPage - 1) * EVENTS_PER_PAGE} - {Math.min(currentPage * EVENTS_PER_PAGE, filteredEvents.length)} of {filteredEvents.length} events
                </Text>
                <HStack spacing={2}>
                  <Button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} isDisabled={currentPage === 1}>
                    Previous
                  </Button>
                  {[...Array(Math.min(3, totalPages)).keys()].map((i) => (
                    <Button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      colorScheme={currentPage === i + 1 ? "blue" : undefined}
                    >
                      {i + 1}
                    </Button>
                  ))}
                  {totalPages > 3 && <Text>...</Text>}
                  <Button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} isDisabled={currentPage === totalPages}>
                    Next
                  </Button>
                </HStack>
              </Flex>
            </>
          )}
        </Box>
      </Flex>
    </Box>
  );
};

export default EventsPage;
