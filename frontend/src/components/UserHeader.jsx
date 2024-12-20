import { Box, Button, Link, Flex, Text, VStack, Avatar } from "@chakra-ui/react";
import { useRecoilValue } from "recoil";
import { Link as RouterLink } from "react-router-dom";
import userAtom from "../atoms/userAtom";

const UserHeader = ({ user }) => {
  const currentUser = useRecoilValue(userAtom);
  
  return (
    <Flex  alignItems={"center"} w={"full"}>
      <Box p="10">
        <Avatar
          src={user?.profilePic || ""}
          size={{
            md: "xl",
          }}
        />
      </Box>

      <Box>
        <VStack alignItems={"center"}>
          <Text fontSize={"2xl"} fontWeight={"bold"}>
            {user?.firstName || "Unknown User"}
          </Text>
          <Text fontSize={"2xl"} fontWeight={"bold"}>
            {user?.lastName || "Unknown User"}
          </Text>
        </VStack>


        <VStack alignItems={"center"}>
          <Text fontSize={"sm"}>{user?.username || "Unknown Username"}</Text>
        </VStack>

        {currentUser?._id === user._id && (
          <Link as={RouterLink} to="/update">
            <Button mt={5} borderColor="black" bg="purple.200">
              Edit Profile
            </Button>
          </Link>
        )}
      </Box>


    </Flex>
  );
};

export default UserHeader;
