import {
  Box,
  Button,
  Flex,
  Text,
  Avatar,
  Heading,
} from "@chakra-ui/react";
import { useRecoilValue } from "recoil";
import { Link, Link as RouterLink, useNavigate } from "react-router-dom";
import userAtom from "../atoms/userAtom";
import { useState } from "react";
import EventsSection from "./RenderProfileSection";

const UserHeader = ({ user }) => {
  const currentUser = useRecoilValue(userAtom);
  const [activeSection, setActiveSection] = useState(null);
  const navigate = useNavigate();

  const ownedGalleries = user.galleries
    ?.filter((g) => g.owner?.toString() === user._id)
    .sort((a, b) => a.name.localeCompare(b.name));

  const collaboratedGalleries = user.galleries
    ?.filter((g) => g.owner?.toString() !== user._id)
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <Flex direction="column" p={4}>
      <Flex alignItems="flex-start" direction="row" gap={10}>
        <Flex direction="column" alignItems="center" gap={4}>
          <Avatar
            src={user?.profilePicture || ""}
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

      <RouterLink to={`/${user.username}/articles`}>
  <Button bg="blue.100" _hover={{ bg: "blue.300" }} borderRadius="full">
    ✍️ User Articles
  </Button>
</RouterLink>

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
            setActiveSection(
              activeSection === "interested" ? null : "interested"
            )
          }
        >
          See events marked interesting
        </Button>
      </Flex>

      <Flex mt={6} gap={4} wrap="wrap">
        <RouterLink to={`/${user.username}/all-products`}>
          <Button bg="teal.200" _hover={{ bg: "teal.400" }} borderRadius="full">
            All Products
          </Button>
        </RouterLink>

        <RouterLink to={`/${user.username}/favorites`}>
          <Button
            bg="orange.300"
            _hover={{ bg: "orange.500" }}
            borderRadius="full"
          >
            Favorite Products
          </Button>
        </RouterLink>
      </Flex>

      {ownedGalleries?.length > 0 && (
        <Box mt={6}>
          <Heading size="md" mb={2}>🎨 Created Galleries</Heading>
          <Flex gap={4} wrap="wrap">
            {ownedGalleries.map((gallery) => (
              <Box
                key={gallery._id}
                bg="gray.100"
                p={4}
                borderRadius="md"
                cursor="pointer"
                onClick={() =>
                  navigate(`/galleries/${user.username}/${gallery.name}`)
                }
              >
                <Flex justify="space-between" align="center">
                  <Text fontWeight="bold">{gallery.name}</Text>
                  {!gallery.isPublic && (
                    <Text
                      fontSize="xs"
                      color="white"
                      bg="gray.700"
                      px={2}
                      py={1}
                      borderRadius="md"
                      fontWeight="bold"
                    >
                      🔒 Private
                    </Text>
                  )}
                </Flex>
              </Box>
            ))}
          </Flex>
        </Box>
      )}

<Button as={Link} to="/calendar" colorScheme="teal" size="sm">
    Calendar
  </Button>

      {collaboratedGalleries?.length > 0 && (
        <Box mt={6}>
          <Heading size="md" mb={2}>🤝 Collaborations</Heading>
          <Flex gap={4} wrap="wrap">
            {collaboratedGalleries.map((gallery) => (
              <Box
                key={gallery._id}
                bg="gray.100"
                p={4}
                borderRadius="md"
                cursor="pointer"
                onClick={() =>
                  navigate(`/galleries/${user.username}/${gallery.name}`)
                }
              >
                <Flex justify="space-between" align="center">
                  <Text fontWeight="bold">{gallery.name}</Text>
                  <Flex gap={2}>
                    {!gallery.isPublic && (
                      <Text
                        fontSize="xs"
                        color="white"
                        bg="gray.700"
                        px={2}
                        py={1}
                        borderRadius="md"
                        fontWeight="bold"
                      >
                        🔒 Private
                      </Text>
                    )}
                    <Text
                      fontSize="xs"
                      color="blue.800"
                      bg="blue.100"
                      px={2}
                      py={1}
                      borderRadius="md"
                      fontWeight="bold"
                    >
                      👥 Collaborator
                    </Text>
                  </Flex>
                </Flex>
              </Box>
            ))}
          </Flex>
        </Box>
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
        <EventsSection title="Events Created by User" events={user.events} />
      )}
    </Flex>
    
  );
};

export default UserHeader;
