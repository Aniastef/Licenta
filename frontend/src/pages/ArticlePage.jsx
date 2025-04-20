import {
  Box,
  Button,
  Heading,
  Input,
  VStack,
  Text,
  IconButton,
  HStack,
  Spinner,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import useShowToast from "../hooks/useShowToast";
import { EditIcon } from "@chakra-ui/icons";

const ArticlePage = () => {
  const { articleId } = useParams();
  const showToast = useShowToast();
  const [article, setArticle] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedContent, setEditedContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!articleId) {
      showToast("Error", "Missing article ID", "error");
      return;
    }

    const fetchArticle = async () => {
      try {
        const res = await fetch(`/api/articles/${articleId}`, {
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok) {
          setArticle(data);
          setEditedTitle(data.title);
          setEditedContent(data.content);
        } else {
          showToast("Error", data.error || "Failed to load article", "error");
        }
      } catch (err) {
        showToast("Error", err.message, "error");
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [articleId, showToast]);

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/articles/${articleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: editedTitle,
          content: editedContent,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setArticle(data);
        setEditMode(false);
        showToast("Success", "Article updated", "success");
      } else {
        showToast("Error", data.error || "Update failed", "error");
      }
    } catch (err) {
      showToast("Error", err.message, "error");
    }
  };

  if (loading) return <Spinner />;
  if (!article) return <Text>Article not found</Text>;

  return (
    <Box maxW="container.md" mx="auto" py={8}>
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between">
          <Heading size="lg">
            {editMode ? (
              <Input
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
              />
            ) : (
              article.title
            )}
          </Heading>
          {!editMode && (
            <IconButton
              icon={<EditIcon />}
              onClick={() => setEditMode(true)}
              aria-label="Edit"
            />
          )}
        </HStack>

        {editMode ? (
          <>
            <ReactQuill value={editedContent} onChange={setEditedContent} />
            <Button mt={4} onClick={handleSave} colorScheme="blue">
              Save Changes
            </Button>
          </>
        ) : (
          <Box
            className="quill-content"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        )}
      </VStack>
    </Box>
  );
};

export default ArticlePage;
