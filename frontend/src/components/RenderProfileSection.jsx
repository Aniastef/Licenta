import { Box, Grid, Image, Heading, Text } from '@chakra-ui/react';

const EventsSection = ({ title, events }) => {
  return (
    <Box mt={6}>
      <Text fontSize="xl" fontWeight="bold" mb={4}>
        {title}
      </Text>
      {events?.length > 0 ? (
        <Grid
          templateColumns={{
            base: 'repeat(1, 1fr)',
            md: 'repeat(2, 1fr)', 
            lg: 'repeat(3, 1fr)', 
          }}
          gap={6}
        >
          {events.map((event) => (
            <Box
              key={event._id}
              as="a"
              bg="gray.200"
              p={4}
              href={`/events/${event._id}`}
              borderRadius="md"
              overflow="hidden"
              _hover={{ transform: 'scale(1.02)', transition: '0.2s' }}
            >
              {}
              <Box h="200px" width="100%" overflow="hidden">
                <Image
                  src={event.coverImage || 'https://via.placeholder.com/600x150'}
                  alt={event.name}
                  objectFit="cover"
                  w="100%"
                  h="100%"
                />
              </Box>

              {}
              <Box p={4}>
                <Heading size="md" mb={2}>
                  {event.name}
                </Heading>
                <Text fontSize="sm" color="gray.500">
                  Location: {event.location || 'Unknown yet'}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  Creator: {event.user?.firstName || 'Unknown'} {event.user?.lastName || ''}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  Date: {event.date ? new Date(event.date).toLocaleDateString() : 'Unknown date'}
                </Text>
              </Box>
            </Box>
          ))}
        </Grid>
      ) : (
        <Text color="gray.500">No events found in this section.</Text>
      )}
    </Box>
  );
};

export default EventsSection;
