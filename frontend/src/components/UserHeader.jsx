import {
  Box,
  Button,
  Flex,
  Text,
  Avatar,
  Image,
  Input,
  Link,
} from "@chakra-ui/react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { Link as RouterLink } from "react-router-dom";
import userAtom from "../atoms/userAtom";
import CoverPhoto from "../components/CoverPhoto"
import { useRef, useState } from "react";
import messages from "../assets/chat.png"
import useShowToast from "../hooks/useShowToast";

const UserHeader = ({ user }) => {
  const currentUser = useRecoilValue(userAtom);
  const setUser = useSetRecoilState(userAtom); // Pentru actualizarea utilizatorului global
  const showToast = useShowToast();
  
  return (
    <Flex direction="column" >
    <Flex alignItems="flex-start"  gap={20} direction="row" >


      <Flex mt={16} ml={16} gap={2} alignItems="flex-start" direction="column" >
        <Avatar
            src={user?.profilePic || ""}
            size="2xl"
            borderWidth={4}
            borderColor="white"
            borderRadius={"10"}
        />
        <Text fontSize={"sm"}>{user?.username || "Unknown Username"}</Text>
        {currentUser?._id === user._id && (
        <Link as={RouterLink} to="/update">
        <Button mt={2} bg="gray.300" _hover={{ bg: "gray.500" }} borderRadius="5">
                    Edit Profile
        </Button>
        </Link>
        )}

{user.instagram && (
        <Button 
          mt={"5"}
          size="sm"
          bg="gray.100"
          _hover={{ bg: "gray.200" }}
          leftIcon={<Box as="span" bg="gray.400" w={4} h={4} />}
          onClick={() => window.open(user.instagram, '_blank')}
        >
          Instagram
        </Button>
      )}
      {user.facebook && (
        <Button
          size="sm"
          bg="gray.100"
          _hover={{ bg: "gray.200" }}
          leftIcon={<Box as="span" bg="gray.400" w={4} h={4} />}
          onClick={() => window.open(user.facebook,'_blank')}
        >
          Facebook
        </Button>
      )}
      {user.webpage && (
        <Button
          size="sm"
          bg="gray.100"
          _hover={{ bg: "gray.200" }}
          leftIcon={<Box as="span" bg="gray.400" w={4} h={4} />}
          onClick={() => window.open(user.webpage,'_blank')}
        >
          Webpage
        </Button>
      )}
        
        </Flex> 

        <Flex  alignItems="flex-start" justifyContent="space-between" direction="column">

            <Flex direction="row" alignItems="center" gap={10} justifyContent="space-between">
            <Text fontSize="2xl" fontWeight="bold">
            {user?.firstName && user?.lastName|| "Unknown User"} </Text>
            <Text fontSize="l">{user?.age || ""}</Text>
            <Text fontSize="l">{user?.location || ""}</Text>
            </Flex>

            <Flex direction="row" justifyContent="space-between">
            <Text fontSize="l">{user?.profession || ""}</Text>
            </Flex>

            <Text mt={"5"}>{user?.bio || "No biography."}</Text>
        
            <Flex mt={"5"} wrap="wrap" justifyContent="center" gap={4}>
                {/* Primul rând */}
                <Button bg="gold" _hover={{ bg: "yellow.500" }} borderRadius="full">
                    Photography gallery
                </Button>
                <Button bg="teal.300" _hover={{ bg: "teal.400" }} borderRadius="full">
                    Sculpture gallery
                </Button>

                {/* Al doilea rând */}
                <Button bg="gray.300" _hover={{ bg: "gray.400" }} borderRadius="full">
                    See created events
                </Button>
                <Button bg="cyan.300" _hover={{ bg: "cyan.400" }} borderRadius="full">
                    See calendar for appointments
                </Button>

                {/* Al treilea rând */}
                <Button bg="purple.300" _hover={{ bg: "purple.500" }} borderRadius="full">
                    See events marked going
                </Button>
                <Button bg="red.400" _hover={{ bg: "red.500" }} borderRadius="full">
                    See events marked interesting
                </Button>
            </Flex>        
         </Flex>  
            <Image mr={"20"} src={messages} alt="message icon" boxSize="30px"/>
            
        </Flex>

        </Flex>
  );
};

export default UserHeader;
