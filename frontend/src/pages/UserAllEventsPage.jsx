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
  CheckboxGroup,
  Stack,
  Checkbox,
  Slider, 
  SliderTrack, 
  SliderFilledTrack,
  SliderThumb, 
  SliderMark,
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
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
  const [statusFilter, setStatusFilter] = useState("");
  const [ticketTypeFilter, setTicketTypeFilter] = useState("");
  const [languageFilter, setLanguageFilter] = useState("");
  const [upcomingOnly, setUpcomingOnly] = useState(false);
  const [locationSearch, setLocationSearch] = useState("");
  const [statusFilters, setStatusFilters] = useState([]);
  const [ticketTypeFilters, setTicketTypeFilters] = useState([]);
  const [maxPrice, setMaxPrice] = useState(100); // maximum allowed price
  const [selectedPrice, setSelectedPrice] = useState(100);
  const [priceRange, setPriceRange] = useState([0, 1000]); // [min, max]
  const [customMin, setCustomMin] = useState(0);
  const [customMax, setCustomMax] = useState(1000);
  const [enablePriceFilter, setEnablePriceFilter] = useState(false);
  

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
    const prices = (data.events || []).map(e => e.price).filter(p => typeof p === "number");
    const highestPrice = prices.length ? Math.max(...prices) : 10000;
    setMaxPrice(highestPrice);
    setSelectedPrice(highestPrice);
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
    if (statusFilter) {
        filtered = filtered.filter((e) => e.status === statusFilter);
      }
      
      if (ticketTypeFilter) {
        filtered = filtered.filter((e) => e.ticketType === ticketTypeFilter);
      }
      
      if (languageFilter) {
        filtered = filtered.filter((e) => e.language === languageFilter);
      }
      
      if (upcomingOnly) {
        const today = new Date();
        filtered = filtered.filter((e) => new Date(e.date) > today);
      }
      

    if (selectedTags.length > 0) {
      filtered = filtered.filter((e) =>
        selectedTags.every((tag) => e.tags?.includes(tag))
      );
    }
    
    if (locationSearch.trim()) {
        filtered = filtered.filter((e) =>
          e.location?.toLowerCase().includes(locationSearch.toLowerCase())
        );
      }

      if (enablePriceFilter) {
        filtered = filtered.filter((e) =>
          typeof e.price === "number" &&
          e.price >= priceRange[0] &&
          e.price <= priceRange[1]
        );
      }
      
      
      
      if (statusFilters.length > 0) {
        filtered = filtered.filter((e) => statusFilters.includes(e.status));
      }
      
      if (ticketTypeFilters.length > 0) {
        filtered = filtered.filter((e) => ticketTypeFilters.includes(e.ticketType));
      }
    
    setFilteredEvents(filtered);
  }, [searchTerm, events, roleFilter, selectedTags, user]);

  const toggleFilter = (value, setFunc) => {
    setFunc((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };
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

      <Flex gap={4} wrap="wrap" justify="center">
  {/* Search by name, tags, co-hosts */}
  <Input
    placeholder="Search by name, tags, or co-hosts..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    maxW="310px"
  />

  {/* Search by location */}
  <Input
    placeholder="Search by location..."
    value={locationSearch}
    onChange={(e) => setLocationSearch(e.target.value)}
    maxW="250px"
  />

  {/* Role filter */}
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

<Flex wrap="wrap" justify="space-between" align="flex-start" mt={4}>
  {/* Stânga: Status + Ticket Type */}
  <Box>
    {/* Status */}
    <Flex align="center" gap={3} mb={2}>
      <Text fontWeight="bold" minW="70px">Status</Text>
      <CheckboxGroup value={statusFilters} onChange={setStatusFilters}>
        <Flex gap={3}>
          <Checkbox value="upcoming">Upcoming</Checkbox>
          <Checkbox value="ongoing">Ongoing</Checkbox>
          <Checkbox value="completed">Completed</Checkbox>
        </Flex>
      </CheckboxGroup>
    </Flex>

    {/* Ticket Type */}
    <Flex align="center" gap={3}>
      <Text fontWeight="bold" minW="70px">Ticket Type</Text>
      <CheckboxGroup value={ticketTypeFilters} onChange={setTicketTypeFilters}>
        <Flex gap={3}>
          <Checkbox value="free">Free</Checkbox>
          <Checkbox value="paid">Paid</Checkbox>
          <Checkbox value="donation">Donation</Checkbox>
        </Flex>
      </CheckboxGroup>
    </Flex>
  </Box>

  {/* Dreapta: Interval preț */}
  {/* Dreapta: Interval preț */ }
<Box maxW="500px" ml={[0, 4]} flex="1">
  <Flex align="center" mb={2}>
    <Checkbox
      isChecked={enablePriceFilter}
      onChange={(e) => setEnablePriceFilter(e.target.checked)}
    >
      Interval preț
    </Checkbox>
  </Flex>

  <Flex direction="row" align="center" gap={4}>
    {/* Slider ocupa tot spațiul rămas */ }
    <Box flex="1" w="100%">
      <RangeSlider
        isDisabled={!enablePriceFilter}
        min={0}
        max={maxPrice}
        step={50}
        value={priceRange}
        onChange={(val) => {
          setPriceRange(val);
          setCustomMin(val[0]);
          setCustomMax(val[1]);
        }}
        w="100%"
      >
        <RangeSliderTrack>
          <RangeSliderFilledTrack />
        </RangeSliderTrack>
        <RangeSliderThumb index={0} />
        <RangeSliderThumb index={1} />
      </RangeSlider>
    </Box>

    {/* Inputuri min-max */ }
    <Flex gap={2} align="center">
    <Input
  size="sm"
  type="text"
  w="80px"
  value={customMin}
  onChange={(e) => {
    const val = e.target.value;
    // Permite doar numere sau șir gol temporar
    if (/^\d*$/.test(val)) {
      setCustomMin(val);
      const parsed = parseInt(val || "0", 10);
      setPriceRange([parsed, priceRange[1]]);
    }
  }}
/>
<Text>-</Text>
<Input
  size="sm"
  type="text"
  w="80px"
  value={customMax}
  onChange={(e) => {
    const val = e.target.value;
    if (/^\d*$/.test(val)) {
      setCustomMax(val);
      const parsed = parseInt(val || "0", 10);
      setPriceRange([priceRange[0], parsed]);
    }
  }}
/>

    </Flex>
  </Flex>
</Box>



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
<Flex mt={4} wrap="wrap" justify="center" gap={5}>
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
