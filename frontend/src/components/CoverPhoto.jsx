import React from 'react';
import { Box, Text, Image, VStack } from '@chakra-ui/react';
import { useRecoilValue } from 'recoil';
import userAtom from '../atoms/userAtom';
import CoverPhoto from './CoverPhoto';

const UserHeader = () => {
  const user = useRecoilValue(userAtom);

  if (!user) {
    return <Text>Loading...</Text>; // Sau orice altă componentă de încărcare
  }

  return (
    <Box>
      {user.coverPhoto ? (
        <CoverPhoto src={user.coverPhoto} alt={`${user.username}'s cover photo`} />
      ) : (
        <Text>No cover photo available</Text>
      )}
      <VStack>
        <Image
          borderRadius="full"
          boxSize="150px"
          src={user.profilePhoto}
          alt={`${user.username}'s profile photo`}
        />
        <Text fontSize="2xl" fontWeight="bold">
          {user.username}
        </Text>
        <Text fontSize="md" color="gray.500">
          {user.bio}
        </Text>
      </VStack>
    </Box>
  );
};

export default UserHeader;