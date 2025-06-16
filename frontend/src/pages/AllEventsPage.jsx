import React, { useState, useEffect } from 'react';
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
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';

const EVENTS_PER_PAGE = 12;
const ALL_EVENT_TAGS = ['Music', 'Art', 'Tech', 'Workshop', 'Theatre'];
const TICKET_TYPES = ['free', 'paid', 'donation'];
const LANGUAGES = ['english', 'romanian', 'french', 'german'];
const ALL_EVENT_CATEGORIES = [
  'Universal',
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
];
const categoryColorMap = {
  Universal: 'rgb(140, 189, 112)',
  Music: 'rgb(174, 174, 163)',
  Art: 'rgb(110, 184, 113)',
  Tech: 'rgb(119, 185, 167)',
  Workshop: 'rgb(126, 183, 194)',
  Theatre: 'rgb(172, 102, 117)',
  Festival: 'rgb(116, 167, 117)',
  Literature: 'rgb(195, 128, 102)',
  Exhibition: 'rgb(137, 147, 187)',
  Dance: 'rgb(188, 188, 187)',
  Film: 'rgb(161, 199, 128)',
  Charity: 'rgb(162, 100, 110)',
  Community: 'rgb(108, 116, 175)',
  Education: 'rgb(174, 175, 168)',
};
const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const day = date.toLocaleDateString('en-US', { day: '2-digit' });
  const month = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const year = date.toLocaleDateString('en-US', { year: 'numeric' });
  return { day, month, year };
};

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [sortOption, setSortOption] = useState('date');
  const [filterText, setFilterText] = useState('');
  const [searchBy, setSearchBy] = useState('name');
  const [filterTags, setFilterTags] = useState([]);
  const [filterTicketType, setFilterTicketType] = useState('');
  const [filterLanguage, setFilterLanguage] = useState('');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [priceFilters, setPriceFilters] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filterTicketTypes, setFilterTicketTypes] = useState([]);
  const [statusFilters, setStatusFilters] = useState([]);
  const [customMin, setCustomMin] = useState(0);
  const [customMax, setCustomMax] = useState(10000);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortDirection, setSortDirection] = useState('desc');
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [filterCategories, setFilterCategories] = useState([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const getEventStatus = (eventDate) => {
    const today = new Date();
    const eventDay = new Date(eventDate);
    if (eventDay.toDateString() === today.toDateString()) return 'ongoing';
    return eventDay > today ? 'upcoming' : 'completed';
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events', { credentials: 'include' });
      const data = await response.json();
      const enriched = data.events.map((e) => ({
        ...e,
        status: getEventStatus(e.date),
      }));
      setEvents(enriched);
    } catch (error) {
      console.error('Error fetching events:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const togglePriceFilter = (range) => {
    setPriceFilters((prev) => {
      const exists = prev.some((r) => r.label === range.label);
      return exists ? prev.filter((r) => r.label !== range.label) : [...prev, range];
    });
  };

  useEffect(() => {
    let updated = [...events];

    updated = updated.filter((event) => {
      const name = event.name || '';
      const userFirstName = event.user?.firstName || '';
      const userLastName = event.user?.lastName || '';
      const matchCategory =
        filterCategories.length === 0 || filterCategories.includes(event.category);

      let matchSearch = true;
      const lowerFilter = filterText.toLowerCase();

      if (filterText) {
        if (searchBy === 'name') {
          matchSearch = (event.name || '').toLowerCase().includes(lowerFilter);
        } else if (searchBy === 'creator') {
          const fullName =
            `${event.user?.firstName || ''} ${event.user?.lastName || ''}`.toLowerCase();
          matchSearch = fullName.includes(lowerFilter);
        } else if (searchBy === 'location') {
          const loc = event.location?.toLowerCase() || '';
          const parts = loc.split(',').map((p) => p.trim());
          const cityCountry = parts.slice(-2).join(' ');
          matchSearch = cityCountry.includes(lowerFilter);
        } else if (searchBy === 'tags') {
          matchSearch = (event.tags || []).some((tag) => tag.toLowerCase().includes(lowerFilter));
        }
      }

      const matchTags =
        filterTags.length === 0 || filterTags.every((tag) => (event.tags || []).includes(tag));

      const matchTicketType =
        filterTicketTypes.length === 0 || filterTicketTypes.includes(event.ticketType);
      const matchLanguage = filterLanguage ? event.language === filterLanguage : true;

      const price = event.price || 0;
      const matchPriceSlider = price >= priceRange[0] && price <= priceRange[1];
      const matchPriceFilters =
        priceFilters.length === 0 ||
        priceFilters.some((range) => price >= range.min && price <= range.max);
      const matchStatus = statusFilters.length === 0 || statusFilters.includes(event.status);

      if (dateFrom) {
        const from = new Date(dateFrom);
        updated = updated.filter((e) => new Date(e.date) >= from);
      }
      if (dateTo) {
        const to = new Date(dateTo);
        updated = updated.filter((e) => new Date(e.date) <= to);
      }

      return (
        matchSearch &&
        matchTags &&
        matchCategory &&
        matchTicketType &&
        matchLanguage &&
        matchPriceSlider &&
        matchPriceFilters &&
        matchStatus
      );
    });

    if (sortOption === 'status' || !initialLoadDone) {
      const order = { ongoing: 0, upcoming: 1, completed: 2 };
      updated.sort((a, b) => {
        const statusDiff = order[a.status] - order[b.status];
        if (statusDiff !== 0) return statusDiff;
        return new Date(a.date) - new Date(b.date);
      });
    } else if (sortOption === 'price') {
      updated.sort((a, b) =>
        sortDirection === 'asc' ? (a.price || 0) - (b.price || 0) : (b.price || 0) - (a.price || 0),
      );
    } else if (sortOption === 'name') {
      updated.sort((a, b) =>
        sortDirection === 'asc'
          ? (a.name || '').localeCompare(b.name || '')
          : (b.name || '').localeCompare(a.name || ''),
      );
    } else if (sortOption === 'location') {
      updated.sort((a, b) =>
        sortDirection === 'asc'
          ? (a.location || '').localeCompare(b.location || '')
          : (b.location || '').localeCompare(a.location || ''),
      );
    } else {
      updated.sort((a, b) =>
        sortDirection === 'asc'
          ? new Date(a.date) - new Date(b.date)
          : new Date(b.date) - new Date(a.date),
      );
    }

    setFilteredEvents(updated);
    setCurrentPage(1);
    if (!initialLoadDone) setInitialLoadDone(true);
  }, [
    events,
    sortOption,
    sortDirection,
    filterText,
    searchBy,
    filterTags,
    filterTicketTypes,
    filterLanguage,
    priceRange,
    priceFilters,
    dateFrom,
    dateTo,
    statusFilters,
    filterCategories,
    currentPage,
  ]);

  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * EVENTS_PER_PAGE,
    currentPage * EVENTS_PER_PAGE,
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
          <Select value={sortOption} onChange={(e) => setSortOption(e.target.value)} w="200px">
            <option value="date">Date</option>
            <option value="name">Name</option>

            <option value="location">Location</option>
            <option value="price">Price</option>
          </Select>

          <Button onClick={() => setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))}>
            {sortDirection === 'asc' ? '↑' : '↓'}
          </Button>
        </HStack>
      </Flex>

      <Flex direction={{ base: 'column', md: 'row' }} gap={6}>
        {}
        <Box w="220px" p={4} borderWidth={1} borderRadius="lg">
          <Text fontWeight="bold">Price Range</Text>
          <RangeSlider
            value={priceRange}
            min={0}
            max={10000}
            step={100}
            onChange={(val) => {
              setPriceRange(val);
              setCustomMin(val[0]);
              setCustomMax(val[1]);
            }}
          >
            <RangeSliderTrack>
              <RangeSliderFilledTrack />
            </RangeSliderTrack>
            <RangeSliderThumb index={0} />
            <RangeSliderThumb index={1} />
          </RangeSlider>

          <Flex mt={2} gap={2} align="center">
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

          <Divider my={3} />
          <Text fontWeight="bold">Ticket Type</Text>
          <CheckboxGroup value={filterTicketTypes} onChange={setFilterTicketTypes}>
            <Stack spacing={1}>
              {TICKET_TYPES.map((type) => (
                <Checkbox key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Checkbox>
              ))}
            </Stack>
          </CheckboxGroup>

          <Divider my={3} />
          <Text fontWeight="bold">Status</Text>
          <CheckboxGroup value={statusFilters} onChange={setStatusFilters}>
            <Stack spacing={1}>
              {['upcoming', 'ongoing', 'completed'].map((status) => (
                <Checkbox key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Checkbox>
              ))}
            </Stack>
          </CheckboxGroup>

          <Divider my={3} />
          <Text fontWeight="bold">Language</Text>
          <Select
            value={filterLanguage}
            onChange={(e) => setFilterLanguage(e.target.value)}
            size="sm"
            mt={1}
          >
            <option value="">All</option>
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </Select>

          <Divider my={3} />
          <Text fontWeight="bold">Date Range</Text>
          <Stack direction="row" spacing={2} mt={1}>
            <Input
              size="sm"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
            <Text>to</Text>
            <Input
              size="sm"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </Stack>

          <Divider my={3} />
          <Text fontWeight="bold">Categories</Text>
          <Wrap spacing={2} mt={2} maxW="100%">
            {ALL_EVENT_CATEGORIES.map((cat) => {
              const isSelected = filterCategories.includes(cat);
              const background = isSelected ? '#2B6CB0' : categoryColorMap[cat];

              return (
                <WrapItem key={cat}>
                  <Button
                    size="sm"
                    borderRadius="md"
                    bg={background}
                    color={isSelected ? 'white' : 'black'}
                    _hover={{ opacity: 0.8 }}
                    onClick={() =>
                      setFilterCategories((prev) =>
                        prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
                      )
                    }
                  >
                    {cat}
                  </Button>
                </WrapItem>
              );
            })}
          </Wrap>
        </Box>

        {}
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
                      _hover={{ boxShadow: 'lg', transform: 'scale(1.02)' }}
                      transition="all 0.2s"
                      cursor="pointer"
                      h="100%"
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

                      <Flex p={4} gap={3} align="center">
                        {}
                        <Flex direction="column" align="center" minW="50px">
                          <Text fontWeight="bold" fontSize="lg">
                            {formatDate(event.date).day}
                          </Text>
                          <Text fontWeight="bold" fontSize="sm">
                            {formatDate(event.date).month}
                          </Text>
                          <Text fontWeight="bold" fontSize="sm">
                            {formatDate(event.date).year}
                          </Text>
                        </Flex>

                        {}
                        <Box textAlign="left" flex="1">
                          <Text fontWeight="bold" noOfLines={1}>
                            {event.name}
                          </Text>
                          {event.category && (
                            <Text fontSize="sm" color="teal.600">
                              <strong>Category:</strong> {event.category}
                            </Text>
                          )}
                          <Text fontSize="sm" color="blue.600">
                            <strong>Location:</strong>{' '}
                            {event.location
                              ? event.location
                                  .split(',')
                                  .slice(-2)
                                  .map((p) => p.trim())
                                  .join(', ')
                              : 'N/A'}
                          </Text>
                          <Text fontSize="sm">
                            <strong>Creator:</strong> {event.user?.firstName || '-'}{' '}
                            {event.user?.lastName || ''}
                          </Text>
                          <Text fontSize="sm" color="orange.600">
                            <strong>Going:</strong> {event.goingParticipants?.length || 0}
                          </Text>

                          {['paid', 'donation'].includes(event.ticketType) && event.price > 0 && (
                            <Text mt={1} fontSize="sm" color="green">
                              <strong>Price:</strong> {event.price} EUR
                            </Text>
                          )}
                          {event.tags?.length > 0 && (
                            <Text fontSize="sm" color="purple.600">
                              <strong>Tags:</strong> {event.tags.slice(0, 2).join(', ')}
                              {event.tags.length > 2 && '...'}
                            </Text>
                          )}
                        </Box>
                      </Flex>
                    </Box>
                  </Link>
                ))}
              </SimpleGrid>

              <Flex mt={6} align="center" justify="space-between">
                <Text>
                  {1 + (currentPage - 1) * EVENTS_PER_PAGE} -{' '}
                  {Math.min(currentPage * EVENTS_PER_PAGE, filteredEvents.length)} of{' '}
                  {filteredEvents.length} events
                </Text>
                <HStack spacing={2}>
                  <Button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    isDisabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  {[...Array(Math.min(3, totalPages)).keys()].map((i) => (
                    <Button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      colorScheme={currentPage === i + 1 ? 'blue' : undefined}
                    >
                      {i + 1}
                    </Button>
                  ))}
                  {totalPages > 3 && <Text>...</Text>}
                  <Button
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    isDisabled={currentPage === totalPages}
                  >
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
