// pages/UserArticleCalendarPage.jsx
import {
    Box,
    Heading,
    VStack,
    Text,
    Spinner,
    Button,
  } from "@chakra-ui/react";
  import Calendar from "react-calendar";
  import 'react-calendar/dist/Calendar.css';
  import { useEffect, useState } from "react";
  import { useNavigate } from "react-router-dom";
  import useShowToast from "../hooks/useShowToast";
  
  const UserArticleCalendarPage = () => {
    const [articlesByDate, setArticlesByDate] = useState({});
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [loading, setLoading] = useState(true);
    const showToast = useShowToast();
    const navigate = useNavigate();
  
    useEffect(() => {
      const fetchArticles = async () => {
        try {
          const res = await fetch("/api/articles/user/me", { credentials: "include" });
          const data = await res.json();
          if (res.ok) {
            const grouped = {};
            data.forEach((article) => {
              const date = new Date(article.createdAt).toISOString().split("T")[0];
              if (!grouped[date]) grouped[date] = [];
              grouped[date].push(article);
            });
            setArticlesByDate(grouped);
          } else {
            showToast("Error", data.error, "error");
          }
        } catch (err) {
          showToast("Error", err.message, "error");
        } finally {
          setLoading(false);
        }
      };
      fetchArticles();
    }, []);
  
    const formatDateKey = (date) => date.toISOString().split("T")[0];
  
    const tileContent = ({ date }) => {
      const key = formatDateKey(date);
      return articlesByDate[key] ? <span style={{ color: "blue" }}>•</span> : null;
    };
  
    const selectedArticles = articlesByDate[formatDateKey(selectedDate)] || [];
  
    return (
      <Box maxW="container.md" mx="auto" py={6}>
        <VStack spacing={6} align="stretch">
          <Heading size="lg">My Journal Calendar</Heading>
          {loading ? <Spinner /> : (
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              tileContent={tileContent}
            />
          )}
  
          <Box mt={6}>
            <Heading size="md">
              Articles for {selectedDate.toDateString()}
            </Heading>
            {selectedArticles.length === 0 ? (
              <Text>No articles written on this day.</Text>
            ) : (
              <VStack spacing={3} align="start">
                {selectedArticles.map((a) => (
                  <Button
                    key={a._id}
                    variant="ghost"
                    onClick={() => navigate(`/article/${a._id}`)}
                    p={0}
                    justifyContent="flex-start"
                  >
                    • {a.title}
                  </Button>
                ))}
              </VStack>
            )}
          </Box>
        </VStack>
      </Box>
    );
  };
  
  export default UserArticleCalendarPage;