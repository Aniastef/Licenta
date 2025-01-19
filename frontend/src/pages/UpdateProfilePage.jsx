'use client';

import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  useColorModeValue,
  Avatar,
  Image,
  Center,
  Box,
} from '@chakra-ui/react';
import { useRef, useState } from 'react';
import { useRecoilState } from 'recoil';
import usePreviewImg from '../hooks/usePreviewImg';
import useShowToast from '../hooks/useShowToast';
import { useNavigate } from 'react-router-dom';
import userAtom from '../atoms/userAtom';
import RectangleShape from '../assets/rectangleShape'


export default function UpdateProfilePage() {
  const [user, setUser] = useRecoilState(userAtom);
  const showToast = useShowToast();
  const [inputs, setInputs] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    username: user.username || '',
    email: user.email || '',
    bio: user.bio || '',
    oldPassword: '',
    password: '',
    location: '',
    profession: '',
    age: '',
  });
  const [coverPhoto, setCoverPhoto] = useState(user.coverPhoto || '');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const fileRef = useRef(null);
  const coverPhotoRef = useRef(null);
  const navigate = useNavigate();

  const handleCancel = () => {
    navigate(`/${user.username}`);
  };

  const { handleImageChange, imgUrl } = usePreviewImg();

  const handleCoverPhotoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (inputs.oldPassword || inputs.password) {
      if (!inputs.oldPassword || !inputs.password) {
        showToast('Error', 'Both old and new passwords are required', 'error');
        return;
      }
      if (inputs.password.length < 6) {
        showToast('Error', 'New password must be at least 6 characters long', 'error');
        return;
      }
    }

    try {
      const res = await fetch(`/api/users/update/${user._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...inputs, profilePic: imgUrl}),
      });
      const data = await res.json();

      if (data.error) {
        showToast('Error', data.error.message, 'error');
        return;
      }

      showToast('Success', 'Profile updated successfully', 'success');
      setUser(data);
      localStorage.setItem('licenta', JSON.stringify(data));
      navigate(`/${user.username}`);
    } catch (error) {
      showToast('Error', error.message, 'error');
    }
  };
  return (
    <Box p={4}>
      <RectangleShape
      bgColor="#62cbe0" // Culoare albastră
      title="Update your profile"
      maxW="600px"
      minW="600px"
      position="relative" // Poziție relativă pentru a fi deasupra portocaliului
      textAlign="left"
      py={4}
      left="-2"
    />
    <Flex gap={5} direction="column">
    {/* Dreptunghi albastru */}

    <Flex ml={20} gap={20} direction="row">
      <Flex gap={4} direction="column">
        <Avatar src={user?.profilePic || ""}
            size="2xl"
            borderWidth={4}
            borderColor="white"
            borderRadius={"10"}
        />
        <Button w="120px"
                bg="purple.200"
                _hover={{ bg: '#6f00ff' }}
                onClick={() => fileRef.current.click()} 
                 >Change avatar</Button>
          <Input type="file" hidden ref={fileRef} onChange={handleImageChange} />
          <FormControl>
            <FormLabel>Facebook</FormLabel>
            <Input
              placeholder="Add your Facebook profile"
              value={inputs.facebook}
              onChange={(e) => setInputs({ ...inputs, facebook: e.target.value })}
              _placeholder={{ color: 'gray.500' }}
              type="url"
            />
          </FormControl>

          <FormControl>
            <FormLabel>Instagram</FormLabel>
            <Input
              placeholder="Add your Instagram profile"
              value={inputs.instagram}
              onChange={(e) => setInputs({ ...inputs, instagram: e.target.value })}
              _placeholder={{ color: 'gray.500' }}
              type="url"
            />
          </FormControl>

          <FormControl>
            <FormLabel>Webpage</FormLabel>
            <Input
              placeholder="Add your personal webpage"
              value={inputs.webpage}
              onChange={(e) => setInputs({ ...inputs, webpage: e.target.value })}
              _placeholder={{ color: 'gray.500' }}
              type="url"
            />
          </FormControl>
        <Flex direction="row">
    
        </Flex>
        </Flex>

        
        <Flex direction="column">
        <FormControl>
            <FormLabel>First Name</FormLabel>
            <Input
              placeholder={user.firstName}
              value={inputs.firstName}
              onChange={(e) => setInputs({ ...inputs, firstName: e.target.value })}
              _placeholder={{ color: 'gray.500' }}
              type="text"
            />
          </FormControl>

          <FormControl>
            <FormLabel>Last Name</FormLabel>
            <Input
              placeholder={user.lastName}
              value={inputs.lastName}
              onChange={(e) => setInputs({ ...inputs, lastName: e.target.value })}
              _placeholder={{ color: 'gray.500' }}
              type="text"
            />
          </FormControl>

          <FormControl>
            <FormLabel>Email Address</FormLabel>
            <Input
              placeholder={user.email}
              value={inputs.email}
              onChange={(e) => setInputs({ ...inputs, email: e.target.value })}
              _placeholder={{ color: 'gray.500' }}
              type="email"
            />
          </FormControl>

          <FormControl>
            <FormLabel>Old Password</FormLabel>
            <Input
              placeholder="Enter your old password"
              value={inputs.oldPassword}
              onChange={(e) => setInputs({ ...inputs, oldPassword: e.target.value })}
              _placeholder={{ color: 'gray.500' }}
              type={showOldPassword ? 'text' : 'password'}
            />
            <Button mt={2} size="sm" onClick={() => setShowOldPassword(!showOldPassword)}>
              {showOldPassword ? 'Hide' : 'Show'} Password
            </Button>
          </FormControl>

          <FormControl>
            <FormLabel>New Password</FormLabel>
            <Input
              placeholder="Enter a new password"
              value={inputs.password}
              onChange={(e) => setInputs({ ...inputs, password: e.target.value })}
              _placeholder={{ color: 'gray.500' }}
              type={showNewPassword ? 'text' : 'password'}
            />
            <Button mt={2} size="sm" onClick={() => setShowNewPassword(!showNewPassword)}>
              {showNewPassword ? 'Hide' : 'Show'} Password
            </Button>
          </FormControl>
          <FormControl>
            <FormLabel>Location</FormLabel>
            <Input
              placeholder="Write your biography"
              value={inputs.location}
              onChange={(e) => setInputs({ ...inputs, location: e.target.value })}
              _placeholder={{ color: 'gray.500' }}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Age</FormLabel>
            <Input
              placeholder="Write your biography"
              value={inputs.age}
              onChange={(e) => setInputs({ ...inputs, age: e.target.value })}
              _placeholder={{ color: 'gray.500' }}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Profession</FormLabel>
            <Input
              placeholder="Write your biography"
              value={inputs.profession}
              onChange={(e) => setInputs({ ...inputs, profession: e.target.value })}
              _placeholder={{ color: 'gray.500' }}
            />
          </FormControl>
        </Flex>

        </Flex>
        <FormControl>
            <FormLabel>Biography</FormLabel>
            <Input
              placeholder="Write your biography"
              value={inputs.bio}
              onChange={(e) => setInputs({ ...inputs, bio: e.target.value })}
              _placeholder={{ color: 'gray.500' }}
            />
          </FormControl>
          <Button
              bg={'red.400'}
              color={'white'}
              w="full"
              _hover={{
                bg: 'red.500',
              }}
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              bg={'purple.500'}
              color={'white'}
              w="full"
              _hover={{
                bg: 'purple.600',
              }}
              type="submit"
              onClick={handleSubmit} // Adaugă funcția handleSubmit aici

            >
              Submit
            </Button>
      </Flex>
      </Box>

  )
}

