import UserHeader from '../components/UserHeader';
import CommentsSection from '../components/CommentsSection';
import useGetUserProfile from '../hooks/useGetUserProfile';
import { Box, Divider, Center, Spinner, Heading } from '@chakra-ui/react';

const UserPage = () => {
  const { user, loading } = useGetUserProfile();

  if (loading) {
    return (
      <Center mt={20}>
        <Spinner size="xl" />
      </Center>
    );
  }

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
      {}
      <UserHeader user={user} />

      {}
      <Box>
        <Divider my={4} />

        <CommentsSection resourceId={user._id} resourceType="User" />
      </Box>
      <Divider my={4} />
    </>
  );
};

export default UserPage;
