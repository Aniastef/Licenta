import {
  Box,
  Button,
  Flex,
  Text,
  Avatar,
} from "@chakra-ui/react";
import { useRecoilValue } from "recoil";
import { Link as RouterLink } from "react-router-dom";
import userAtom from "../atoms/userAtom";
import { useState } from "react";

const UserHeader = ({ user }) => {
  const currentUser = useRecoilValue(userAtom);
  const [activeSection, setActiveSection] = useState(null); // Controlează secțiunea activă

  return (
    <Flex direction="column" p={4}>
      {/* Profil utilizator */}
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

      {/* Butoane pentru secțiuni */}
      <Flex mt={6} gap={4}>
      <Button
          bg={activeSection === "interested" ? "green.300" : "green.100"}
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
        {/* <Button
          bg={activeSection === "interested" ? "cyan.300" : "cyan.100"}
          _hover={{ bg: "cyan.500" }}
          borderRadius="full"
          onClick={() =>
            setActiveSection(activeSection === "interested" ? null : "interested")
          }
        >
          See calendar for appointments
        </Button> */}
        
      </Flex>

      {/* Secțiune activă */}
      {activeSection === "created" && (
  <Box mt={6}>
    <Text fontSize="xl" fontWeight="bold">
      Created Events:
    </Text>
    {user.createdEvents?.length > 0 ? (
      user.createdEvents.map((event) => (
        <Flex
          key={event._id}
          p={4}
          border="1px solid gray"
          borderRadius="md"
          mt={2}
          alignItems="center"
          gap={4}
          as="a"
          href={`/events/${event._id}`} // Redirecționează la pagina evenimentului
          _hover={{ bg: "gray.100", cursor: "pointer" }}
        >
          {/* Imaginea de copertă */}
          <Box flex="0 0 120px">
            <Avatar
              src={event.coverImage || "https://via.placeholder.com/150"}
              alt={event.name}
              size="xl"
              borderRadius="md"
            />
          </Box>

          {/* Detalii despre eveniment */}
          <Box>
            <Text fontSize="md" fontWeight="bold">{event.name}</Text>
            <Text fontSize="sm">{new Date(event.date).toLocaleDateString()}</Text>
            <Text fontSize="sm" color="gray.500">{event.location}</Text>
          </Box>
        </Flex>
      ))
    ) : (
      <Text color="gray.500">No events created by this user.</Text>
    )}
  </Box>
)}

      {activeSection === "going" && (
  <Box mt={6}>
    <Text fontSize="xl" fontWeight="bold">
      Events Marked Going:
    </Text>
    {user.eventsMarkedGoing?.length > 0 ? (
      user.eventsMarkedGoing.map((event) => (
        <Flex
          key={event._id}
          p={4}
          border="1px solid gray"
          borderRadius="md"
          mt={2}
          alignItems="center"
          gap={4}
          as="a"
          href={`/events/${event._id}`} // Redirecționează la pagina evenimentului
          _hover={{ bg: "gray.100", cursor: "pointer" }}
        >
          {/* Imaginea de copertă */}
          <Box flex="0 0 120px">
            <Avatar
              src={event.coverImage || "https://via.placeholder.com/150"}
              alt={event.name}
              size="xl"
              borderRadius="md"
            />
          </Box>

          {/* Detalii despre eveniment */}
          <Box>
            <Text fontSize="md" fontWeight="bold">{event.name}</Text>
            <Text fontSize="sm">{new Date(event.date).toLocaleDateString()}</Text>
            <Text fontSize="sm" color="gray.500">{event.location}</Text>
          </Box>
        </Flex>
      ))
    ) : (
      <Text color="gray.500">No events marked as going.</Text>
    )}
  </Box>
)}

{activeSection === "interested" && (
  <Box mt={6}>
    <Text fontSize="xl" fontWeight="bold">
      Events Marked Interesting:
    </Text>
    {user.eventsMarkedInterested?.length > 0 ? (
      user.eventsMarkedInterested.map((event) => (
        <Flex
          key={event._id}
          p={4}
          border="1px solid gray"
          borderRadius="md"
          mt={2}
          alignItems="center"
          gap={4}
          as="a"
          href={`/events/${event._id}`} // Redirecționează la pagina evenimentului
          _hover={{ bg: "gray.100", cursor: "pointer" }}
        >
          {/* Imaginea de copertă */}
          <Box flex="0 0 120px">
            <Avatar
              src={event.coverImage || "https://via.placeholder.com/150"}
              alt={event.name}
              size="xl"
              borderRadius="md"
            />
          </Box>

          {/* Detalii despre eveniment */}
          <Box>
            <Text fontSize="md" fontWeight="bold">{event.name}</Text>
            <Text fontSize="sm">{new Date(event.date).toLocaleDateString()}</Text>
            <Text fontSize="sm" color="gray.500">{event.location}</Text>
          </Box>
        </Flex>
      ))
    ) : (
      <Text color="gray.500">No events marked as interesting.</Text>
    )}
  </Box>
)}


    </Flex>
  );
};

export default UserHeader;
