import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Text,
  Image,
  Input,
  Select,
  Button,
  SimpleGrid,
  HStack,
  Circle,
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';

const ARTICLES_PER_PAGE = 12;
const ARTICLE_CATEGORIES = [
  'Personal',
  'Opinion',
  'Review',
  'Tutorial',
  'Poetry',
  'Reflection',
  'News',
  'Interview',
  'Tech',
  'Art',
  'Photography',
  'Research',
  'Journal',
  'Story',
];

const AllArticlesPage = () => {
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortOption, setSortOption] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState([]);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await fetch('/api/articles', { credentials: 'include' });
        const data = await res.json();
        setArticles(data);
      } catch (err) {
        console.error('Error fetching articles:', err);
      }
    };
    fetchArticles();
  }, []);

  useEffect(() => {
    let updated = [...articles];

    if (searchText.trim()) {
      updated = updated.filter(
        (a) =>
          a.title.toLowerCase().includes(searchText.toLowerCase()) ||
          a.subtitle?.toLowerCase().includes(searchText.toLowerCase()) ||
          a.content?.toLowerCase().includes(searchText.toLowerCase()),
      );
    }

    if (dateFrom) {
      const from = new Date(dateFrom + 'T00:00:00');
      updated = updated.filter((a) => new Date(a.createdAt) >= from);
    }

    if (dateTo) {
      const to = new Date(dateTo + 'T23:59:59');
      updated = updated.filter((a) => new Date(a.createdAt) <= to);
    }

    if (selectedCategories.length > 0) {
      updated = updated.filter((a) => selectedCategories.includes(a.category));
    }

    updated.sort((a, b) => {
      if (sortOption === 'title') {
        return sortDirection === 'asc'
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      } else {
        return sortDirection === 'asc'
          ? new Date(a.createdAt) - new Date(b.createdAt)
          : new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    setFilteredArticles(updated);
    setCurrentPage(1);
  }, [
    articles,
    searchText,
    dateFrom,
    dateTo,
    sortOption,
    sortDirection,
    selectedCategories,
  ]);

  const paginated = filteredArticles.slice(
    (currentPage - 1) * ARTICLES_PER_PAGE,
    currentPage * ARTICLES_PER_PAGE,
  );

  return (
    <Box p={4} maxW="1600px" mx="auto">
      <Flex justifyContent="center" alignItems="center" px={4} pt={4} position="relative">
        <Text fontWeight="bold" fontSize="2xl" textAlign="center">
          All Articles
        </Text>
        <Flex position="absolute" right={4} gap={2}>
          <Circle size="30px" bg="yellow.400" />
          <Circle size="30px" bg="green.400" />
        </Flex>
      </Flex>

      <Flex mt={4} gap={4} wrap="wrap" justify="space-between">
        <Input
          placeholder="Search articles..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          maxW="300px"
        />

        <HStack>
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          <Text>to</Text>
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </HStack>
        <Select
          placeholder="Filter by category"
          value={selectedCategories[0] || ''}
          onChange={(e) => setSelectedCategories(e.target.value ? [e.target.value] : [])}
          maxW="250px"
        >
          {ARTICLE_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </Select>

        <HStack>
          <Select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
            <option value="date">Date</option>
            <option value="title">Title</option>
          </Select>
          <Button onClick={() => setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))}>
            {sortDirection === 'asc' ? '↑' : '↓'}
          </Button>
        </HStack>
      </Flex>

      <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={5} mt={6}>
        {paginated.map((article) => (
          <Link to={`/articles/${article._id}`} key={article._id}>
            <Box
              borderWidth="1px"
              borderRadius="md"
              p={4}
              bg="white"
              shadow="sm"
              _hover={{ boxShadow: 'md', transform: 'scale(1.01)' }}
              transition="all 0.2s"
              sx={{
                backgroundImage: `
                  repeating-linear-gradient(to bottom, transparent, transparent 29px, #cbd5e0 30px),
                  linear-gradient(to right, #dc2626 1px, transparent 2px)
                `,
                backgroundSize: '100% 30px, 1px 100%',
                backgroundPosition: 'left 40px top, left 40px top',
                backgroundRepeat: 'repeat-y, no-repeat',
              }}
            >
              {article.coverImage && (
                <Image
                  src={article.coverImage}
                  alt="Cover"
                  w="100%"
                  h="150px"
                  objectFit="cover"
                  borderRadius="md"
                  mb={3}
                />
              )}
              {article.category && (
                <Text fontSize="sm" color="teal.600">
                  Category: {article.category}
                </Text>
              )}

              <Text fontWeight="bold" fontSize="xl">
                {article.title}
              </Text>
              {article.subtitle && (
                <Text fontSize="md" color="gray.600">
                  {article.subtitle}
                </Text>
              )}

              <Text fontSize="sm" mt={2} color="gray.500">
                {article.content?.replace(/<[^>]+>/g, '').slice(0, 50)}...
              </Text>
              <Text fontSize="xs" color="gray.400" mt={2}>
                {new Date(article.createdAt).toLocaleString()}
              </Text>
              <Text fontSize="xs" color="blue.600" mt={1}>
                Written by:{' '}
                {article.user?.username ? (
                  <Link
                    to={`/profile/${article.user.username}`}
                    style={{ textDecoration: 'underline' }}
                  >
                    @{article.user.username}
                  </Link>
                ) : (
                  <span>Unknown</span>
                )}
              </Text>
            </Box>
          </Link>
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default AllArticlesPage;
