import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Box, Heading, VStack, Text, Link, Spinner, Divider, Badge } from '@chakra-ui/react';
import { format } from 'date-fns';
import { Link as RouterLink } from 'react-router-dom';

const CalendarPage = () => {
  const [value, setValue] = useState(new Date());
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      const res = await fetch('/api/articles/user/me', {
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        setArticles(data);
      }
      setLoading(false);
    };
    fetchArticles();
  }, []);

  const selectedDate = format(value, 'yyyy-MM-dd');
  const articlesForDay = articles.filter(
    (a) => format(new Date(a.createdAt), 'yyyy-MM-dd') === selectedDate,
  );

  const articleDates = new Set(articles.map((a) => format(new Date(a.createdAt), 'yyyy-MM-dd')));

  const tileContent = ({ date, view }) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    if (view === 'month' && articleDates.has(dateStr)) {
      return (
        <Box textAlign="center">
          <Badge colorScheme="blue" mt={1}>
            •
          </Badge>
        </Box>
      );
    }
    return null;
  };

  return (
    <Box maxW="container.md" mx="auto" py={6}>
      <Heading mb={4}>My Journal</Heading>
      {loading ? (
        <Spinner />
      ) : (
        <>
          <Calendar onChange={setValue} value={value} tileContent={tileContent} />

          <VStack spacing={3} mt={6} align="stretch">
            <Heading size="md">
              {articlesForDay.length > 0
                ? `Articles on ${selectedDate}`
                : `No articles on ${selectedDate}`}
            </Heading>
            <Divider />
            {articlesForDay.map((article) => (
              <Box key={article._id} p={4} bg="gray.100" borderRadius="md">
                <Link as={RouterLink} to={`/articles/${article._id}`} fontWeight="bold">
                  {article.title}
                </Link>
                <Text fontSize="sm" color="gray.600">
                  {format(new Date(article.createdAt), 'PPpp')}
                </Text>
              </Box>
            ))}
          </VStack>
        </>
      )}
    </Box>
  );
};

export default CalendarPage;
