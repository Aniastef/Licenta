import React, { useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Box, Flex, Text } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const localizer = momentLocalizer(moment);

const UserCalendar = ({ createdEvents = [], goingEvents = [] }) => {
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Created Events:', createdEvents);
    console.log('Going Events:', goingEvents);
  }, [createdEvents, goingEvents]);

  const processEvents = (events, type) => {
    return events.flatMap((event) => {
      const startDate = moment(event.start).toDate();
      const endDate = moment(event.end).toDate();

      if (!startDate || !endDate) {
        console.error('Invalid event data:', event);
        return [];
      }

      return [
        {
          title: event.title || 'Untitled Event',
          start: startDate,
          end: endDate,
          type,
          id: event._id,
        },
      ];
    });
  };

  const combinedEvents = [
    ...processEvents(createdEvents, 'created'),
    ...processEvents(goingEvents, 'going'),
  ];

  const eventStyleGetter = (event) => {
    const backgroundColor = event.type === 'created' ? 'red' : 'purple';
    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: 0.9,
        color: 'white',
        border: '1px solid black',
        padding: '5px',
        zIndex: 10,
      },
    };
  };

  const handleSelectEvent = (event) => {
    navigate(`/events/${event.id}`);
  };

  combinedEvents.forEach((event) => {
    console.log(`Event: ${event.title}, Start: ${event.start}, End: ${event.end}`);
  });

  return (
    <div>
      <Calendar
        localizer={localizer}
        events={combinedEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        eventPropGetter={eventStyleGetter}
        onSelectEvent={handleSelectEvent}
        showMultiDayTimes={true} 
        step={15} 
        timeslots={4}
        defaultView="week"
      />

      <Flex mt={4} justifyContent="center">
        <Box display="flex" alignItems="center" mr={4}>
          <Box width="15px" height="15px" backgroundColor="red" mr={2} />
          <Text>Created Events</Text>
        </Box>
        <Box display="flex" alignItems="center">
          <Box width="15px" height="15px" backgroundColor="purple" mr={2} />
          <Text>Going Events</Text>
        </Box>
      </Flex>
    </div>
  );
};

export default UserCalendar;
