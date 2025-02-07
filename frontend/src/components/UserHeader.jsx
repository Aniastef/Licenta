import {
  Box,
  Button,
  Flex,
  Text,
  Avatar,
  Image,
  Grid,
  Heading,
} from "@chakra-ui/react";
import { useRecoilValue } from "recoil";
import { Link as RouterLink } from "react-router-dom";
import userAtom from "../atoms/userAtom";
import { useState } from "react";
import EventsSection from "./RenderProfileSection";

const UserHeader = ({ user }) => {
  const currentUser = useRecoilValue(userAtom);
  const [activeSection, setActiveSection] = useState(null);

  return (
    <Flex direction="column" p={4}>
      <Flex alignItems="flex-start" direction="row" gap={10}>
        <Flex direction="column" alignItems="center" gap={4}>
          <Avatar
            src={user?.profilePic || ""}
            size="2xl"
            borderWidth={4}
            borderColor="white"
            borderRadius="full"
          />
          <Text fontSize="lg" fontWeight="bold">
            {user?.username || "Unknown Username"}
          </Text>
          {currentUser?._id === user._id && (
            <RouterLink to="/update">
              <Button
                mt={2}
                bg="gray.300"
                _hover={{ bg: "gray.500" }}
                borderRadius="md"
              >
                Edit Profile
              </Button>
            </RouterLink>
          )}
        </Flex>

        <Flex direction="column" justifyContent="center" gap={4}>
          <Text fontSize="2xl" fontWeight="bold">
            {user?.firstName} {user?.lastName || "Unknown User"}
          </Text>
          <Text fontSize="md">{user?.bio || "No biography available."}</Text>
          <Text fontSize="sm" color="gray.600">
            {user?.age ? `${user.age} years old` : ""}
          </Text>
          <Text fontSize="sm" color="gray.600">
            {user?.location || ""}
          </Text>
        </Flex>
      </Flex>

      <Flex mt={6} gap={4}>
        <Button
          bg={activeSection === "created" ? "green.300" : "green.100"}
          _hover={{ bg: "green.500" }}
          borderRadius="full"
          onClick={() =>
            setActiveSection(activeSection === "created" ? null : "created")
          }
        >
          See created events
        </Button>
        <Button  
          bg={activeSection === "going" ? "purple.300" : "purple.100"}
          _hover={{ bg: "purple.500" }}
          borderRadius="full"
          onClick={() =>
            setActiveSection(activeSection === "going" ? null : "going")
          }
        >
          See events marked going
        </Button>
        <Button
          bg={activeSection === "interested" ? "red.300" : "red.100"}
          _hover={{ bg: "red.500" }}
          borderRadius="full"
          onClick={() =>
            setActiveSection(activeSection === "interested" ? null : "interested")
          }
        >
          See events marked interesting
        </Button>
      </Flex>

      {user.galleries && (
  <Flex mt={6} gap={4} wrap="wrap">
      <RouterLink to={`/galleries/${user.username}/all-products`}>
        <Button bg="teal.200" _hover={{ bg: "teal.400" }} borderRadius="full">
          All Products
        </Button>
    </RouterLink>

    {user.galleries.map((gallery) => (
      <RouterLink key={gallery.name} to={`/galleries/${user.username}/${gallery.name}`}>
        <Button bg="blue.200" _hover={{ bg: "blue.400" }} borderRadius="full">
          {gallery.name}
        </Button>
      </RouterLink>
    ))}
  </Flex>
)}

      {activeSection === "interested" && (
        <EventsSection
          title="Events Marked Interesting"
          events={user.eventsMarkedInterested}
        />
      )}

      {activeSection === "going" && (
        <EventsSection
          title="Events Marked Going"
          events={user.eventsMarkedGoing}
        />
      )}

      {activeSection === "created" && (
        <EventsSection
          title="Events Created by User"
          events={user.events}
        />
      )}
    </Flex>
  );
};

export default UserHeader;
