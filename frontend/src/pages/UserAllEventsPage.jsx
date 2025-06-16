import React, { useEffect, useState } from 'react';
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
} from '@chakra-ui/react';
import { useParams, Link } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import userAtom from '../atoms/userAtom';

const UserAllEventsPage = () => {
  const { username } = useParams();
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState(null);
  const [tagOptions, setTagOptions] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [ticketTypeFilter, setTicketTypeFilter] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');
  const [upcomingOnly, setUpcomingOnly] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');
  const [statusFilters, setStatusFilters] = useState([]);
  const [ticketTypeFilters, setTicketTypeFilters] = useState([]);
  const [maxPrice, setMaxPrice] = useState(100); // maximum allowed price
  const [selectedPrice, setSelectedPrice] = useState(100);
  const [priceRange, setPriceRange] = useState([0, 1000]); // [min, max]
  const [customMin, setCustomMin] = useState(0);
  const [customMax, setCustomMax] = useState(1000);
  const [enablePriceFilter, setEnablePriceFilter] = useState(false);
  const currentUser = useRecoilValue(userAtom);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const day = date.toLocaleDateString('en-US', { day: '2-digit' });
    const month = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    const year = date.toLocaleDateString('en-US', { year: 'numeric' });
    return { day, month, year };
  };

  useEffect(() => {
    fetchUserEvents();
  }, [username]);

  const fetchUserEvents = async () => {
    try {
      const res = await fetch(`/api/events/user/${username}`, {
        credentials: 'include',
      });

      const data = await res.json();
      setEvents(data.events || []);
      const prices = (data.events || []).map((e) => e.price).filter((p) => typeof p === 'number');
      const highestPrice = prices.length ? Math.max(...prices) : 10000;
      setMaxPrice(highestPrice);
      setSelectedPrice(highestPrice);
      setFilteredEvents(data.events || []);

      if (data.user) setUser(data.user);
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;

    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();

      if (res.ok) {
        setEvents((prev) => prev.filter((e) => e._id !== eventId));
        setFilteredEvents((prev) => prev.filter((e) => e._id !== eventId));
      } else {
        alert(data.error || 'Failed to delete event');
      }
    } catch (err) {
      alert(err.message);
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
        terms.some(
          (term) =>
            e.name.toLowerCase().includes(term) ||
            e.tags?.some((tag) => tag.toLowerCase().includes(term)) ||
            e.coHosts?.some((c) => `${c.firstName} ${c.lastName}`.toLowerCase().includes(term)),
        ),
      );
    }

    if (roleFilter === 'organizer') {
      filtered = filtered.filter((e) => e.organizer?._id === user?._id);
    } else if (roleFilter === 'cohost') {
      filtered = filtered.filter((e) => e.coHosts?.some((c) => c._id === user?._id));
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
      filtered = filtered.filter((e) => selectedTags.every((tag) => e.tags?.includes(tag)));
    }

    if (locationSearch.trim()) {
      filtered = filtered.filter((e) =>
        e.location?.toLowerCase().includes(locationSearch.toLowerCase()),
      );
    }

    if (enablePriceFilter) {
      filtered = filtered.filter(
        (e) => typeof e.price === 'number' && e.price >= priceRange[0] && e.price <= priceRange[1],
      );
    }

    if (statusFilters.length > 0) {
      filtered = filtered.filter((e) => statusFilters.includes(e.status));
    }

    if (ticketTypeFilters.length > 0) {
      filtered = filtered.filter((e) => ticketTypeFilters.includes(e.ticketType));
    }

    setFilteredEvents(filtered);
  }, [searchTerm, events, roleFilter, selectedTags, user, statusFilters, ticketTypeFilters, locationSearch, enablePriceFilter, priceRange]);

  const toggleFilter = (value, setFunc) => {
    setFunc((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
  };
  return (
    <Box p={4} maxW="1200px" mx="auto">
      <Flex justifyContent="center" alignItems="center" px={4} pt={4} position="relative">
        <Text fontWeight="bold" fontSize="2xl" textAlign="center">
          {user ? `${user.firstName} ${user.lastName}'s Events` : `${username}'s Events`}
        </Text>
        <Flex position="absolute" right={4} gap={2}>
          {currentUser?.username?.toLowerCase() === username?.toLowerCase() && (
            <Button
              colorScheme="purple"
              ml={5}
              mb={4}
              onClick={() => (window.location.href = '/create/event')}
            >
              Create new event
            </Button>
          )}

          <Circle size="30px" bg="yellow.400" />
          <Circle size="30px" bg="green.400" />
        </Flex>
      </Flex>

      <Flex gap={4} wrap="wrap" justify="center">
        {}
        <Input
          placeholder="Search by name, tags, or co-hosts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          maxW="310px"
        />

        {}
        <Input
          placeholder="Search by location..."
          value={locationSearch}
          onChange={(e) => setLocationSearch(e.target.value)}
          maxW="250px"
        />

        {}
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
        {}
        <Box>
          {}
          <Flex align="center" gap={3} mb={2}>
            <Text fontWeight="bold" minW="70px">
              Status
            </Text>
            <CheckboxGroup value={statusFilters} onChange={setStatusFilters}>
              <Flex gap={3}>
                <Checkbox value="upcoming">Upcoming</Checkbox>
                <Checkbox value="ongoing">Ongoing</Checkbox>
                <Checkbox value="completed">Completed</Checkbox>
              </Flex>
            </CheckboxGroup>
          </Flex>

          {}
          <Flex align="center" gap={3}>
            <Text fontWeight="bold" minW="70px">
              Ticket Type
            </Text>
            <CheckboxGroup value={ticketTypeFilters} onChange={setTicketTypeFilters}>
              <Flex gap={3}>
                <Checkbox value="free">Free</Checkbox>
                <Checkbox value="paid">Paid</Checkbox>
                <Checkbox value="donation">Donation</Checkbox>
              </Flex>
            </CheckboxGroup>
          </Flex>
        </Box>

        {}
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
            {}
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

            {}
            <Flex gap={2} align="center">
              <Input
                size="sm"
                type="text"
                w="80px"
                value={customMin}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^\d*$/.test(val)) {
                    setCustomMin(val);
                    const parsed = parseInt(val || '0', 10);
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
          	      const parsed = parseInt(val || '0', 10);
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
              variant={selectedTags.includes(tag) ? 'solid' : 'outline'}
              colorScheme="purple"
              onClick={() =>
                setSelectedTags((prev) =>
                  prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
                )
              }
            >
              {`#${tag}`}
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
                borderWidth="1px"
                borderRadius="md"
                overflow="hidden"
                _hover={{ boxShadow: 'lg', transform: 'scale(1.02)' }}
                transition="all 0.2s"
              >
                <Box h="150px" overflow="hidden">
                  {event.coverImage ? (
                    <Image
                      src={event.coverImage}
                      alt={event.name}
                      w="100%"
                      h="100%"
                      objectFit="cover"
                    />
                  ) : (
                    <Box
                      w="100%"
                      h="100%"
                      bg="orange.300"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Text fontWeight="bold" color="white" fontSize="lg" textAlign="center" px={2}>
                        {event.name}
                      </Text>
                    </Box>
                  )}
                </Box>

                <Flex p={4} gap={3} align="center">
                  {}
                  <Flex direction="column" align="center" minW="50px">
                    {(() => {
                      const { day, month, year } = formatDate(event.date);
                      return (
                        <>
                          <Text fontWeight="bold" fontSize="lg">{day}</Text>
                          <Text fontWeight="bold" fontSize="sm">{month}</Text>
                          <Text fontWeight="bold" fontSize="sm">{year}</Text>
                        </>
                      );
                    })()}
                  </Flex>

                  {}
                  <Box textAlign="left" flex="1" overflow="hidden">
                                  {}
                    <Text fontSize="md" fontWeight="bold" isTruncated>
                      {event.name || 'Nume eveniment'}
                    </Text>
                    {event.category && <Text fontSize="sm">Category: {event.category}</Text>}
                                  {}
                    <Text fontSize="sm" isTruncated>
                      {event.location || 'TBA'}
                    </Text>
                    <Text fontSize="xs">{event.time || 'TBA'}</Text>
                  </Box>
                </Flex>
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