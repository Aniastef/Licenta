import UserHeader from "../components/UserHeader";
import CommentsSection from "../components/CommentsSection";
import useGetUserProfile from "../hooks/useGetUserProfile";
import { Box, Divider, Heading } from "@chakra-ui/react";

const UserPage = () => {
  const { user } = useGetUserProfile(); // Obține utilizatorul din link

  if (!user) {
    return (
      <Box textAlign="center" mt={10}>
        <Heading as="h1" size="lg">
          User not found
        </Heading>
      </Box>
    );
  }

  return (
    <>
      {/* Header-ul utilizatorului */}
      <UserHeader user={user} />

      {/* Secțiunea de comentarii */}
      <Box >
        <Divider my={4} />
        
        <CommentsSection resourceId={user._id} resourceType="User" />
        
      </Box>
      <Divider my={4} />
      
    </>
  );
};

export default UserPage;
