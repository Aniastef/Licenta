'use client';

import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Avatar,
  Box,
  Text,
} from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import { useRecoilState } from 'recoil';
import usePreviewImg from '../hooks/usePreviewImg';
import useShowToast from '../hooks/useShowToast';
import { useNavigate } from 'react-router-dom';
import userAtom from '../atoms/userAtom';
import RectangleShape from '../assets/rectangleShape'

export default function UpdateProfilePage() {
  const [user, setUser] = useRecoilState(userAtom);
  const showToast = useShowToast();
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const BIO_LIMIT = 440; // poți ajusta dacă vrei

  const [inputs, setInputs] = useState(() => ({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || '',
    oldPassword: '',
    password: '',
    location: user?.location || '',
    profession: user?.profession || '',
    age: user?.age || '',
    instagram: user?.instagram || '',
    facebook: user?.facebook || '',
    webpage: user?.webpage || ''
  }));

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const { handleImageChange, imgUrl } = usePreviewImg();

  // 🧠 Sync inputs when user updates (e.g. after fetch('/me'))
  useEffect(() => {
    if (user) {
      setInputs({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        username: user.username || '',
        email: user.email || '',
        bio: user.bio || '',
        oldPassword: '',
        password: '',
        location: user.location || '',
        profession: user.profession || '',
        age: user.age || '',
        instagram: user.instagram || '',
        facebook: user.facebook || '',
        webpage: user.webpage || '',
        soundcloud: user?.soundcloud || '',
        spotify: user?.spotify || '',
        linkedin: user?.linkedin || '',
        phone: user?.phone || '',
        hobbies: user?.hobbies || '',

      });
    }
  }, [user]);

  const handleCancel = () => {
    navigate(`/${user?.username}`);
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
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...inputs, profilePicture: imgUrl }),
      });
      const data = await res.json();

      if (data.error) {
        showToast('Error', data.error.message || data.error, 'error');
        return;
      }

      showToast('Success', data.message || 'Profile updated', 'success');

      // 🔁 Refetch user
      const meRes = await fetch("/api/users/me", { credentials: "include" });
      const updatedUser = await meRes.json();

      if (!updatedUser || updatedUser.error) {
        showToast('Error', 'Failed to fetch updated user data', 'error');
        return;
      }

      setUser(updatedUser);
      localStorage.setItem("licenta", JSON.stringify(updatedUser));

      setInputs({
        firstName: updatedUser.firstName || '',
        lastName: updatedUser.lastName || '',
        username: updatedUser.username || '',
        email: updatedUser.email || '',
        bio: updatedUser.bio || '',
        oldPassword: '',
        password: '',
        location: updatedUser.location || '',
        profession: updatedUser.profession || '',
        age: updatedUser.age || '',
        instagram: updatedUser.instagram || '',
        facebook: updatedUser.facebook || '',
        webpage: updatedUser.webpage || ''
      });
      if (inputs.bio.length > BIO_LIMIT) {
        showToast('Error', `Biography must be at most ${BIO_LIMIT} characters`, 'error');
        return;
      }
      

      navigate(`/${updatedUser.username}`);
    } catch (error) {
      showToast('Error', error.message, 'error');
    }
  };

  return (
    <Box p={4}>
      <RectangleShape
        bgColor="#62cbe0"
        title="Update your profile"
        maxW="600px"
        minW="600px"
        position="relative"
        textAlign="left"
        py={4}
        left="-2"
      />
      <Flex gap={5} direction="column">
        <Flex ml={20} gap={20} direction="row">
          <Flex gap={4} direction="column">
            <Avatar src={user?.profilePicture || ""} size="2xl" />
            <Button onClick={() => fileRef.current.click()}>Change avatar</Button>
            <Input type="file" hidden ref={fileRef} onChange={handleImageChange} />

            {/* Example input */}
            <FormControl>
              <FormLabel>First Name</FormLabel>
              <Input
                value={inputs.firstName}
                onChange={(e) => setInputs({ ...inputs, firstName: e.target.value })}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Last Name</FormLabel>
              <Input
                value={inputs.lastName}
                onChange={(e) => setInputs({ ...inputs, lastName: e.target.value })}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                value={inputs.email}
                onChange={(e) => setInputs({ ...inputs, email: e.target.value })}
              />
            </FormControl>
            <FormControl>
  <FormLabel>Username</FormLabel>
  <Input
    value={inputs.username}
    onChange={(e) => setInputs({ ...inputs, username: e.target.value })}
  />
</FormControl>

<FormControl>
  <FormLabel>Biography</FormLabel>
  <Input
    value={inputs.bio}
    maxLength={BIO_LIMIT}
    onChange={(e) => setInputs({ ...inputs, bio: e.target.value })}
  />
  <Text fontSize="xs" textAlign="right" color={inputs.bio.length >= BIO_LIMIT ? 'red.500' : 'gray.500'}>
    {inputs.bio.length}/{BIO_LIMIT}
  </Text>
</FormControl>

<FormControl>
  <FormLabel>Location</FormLabel>
  <Input
    value={inputs.location}
    onChange={(e) => setInputs({ ...inputs, location: e.target.value })}
  />
</FormControl>

<FormControl>
  <FormLabel>Profession</FormLabel>
  <Input
    value={inputs.profession}
    onChange={(e) => setInputs({ ...inputs, profession: e.target.value })}
  />
</FormControl>

<FormControl>
  <FormLabel>Age</FormLabel>
  <Input
    type="number"
    value={inputs.age}
    onChange={(e) => setInputs({ ...inputs, age: e.target.value })}
  />
</FormControl>

<FormControl>
  <FormLabel>Facebook</FormLabel>
  <Input
    type="url"
    value={inputs.facebook}
    onChange={(e) => setInputs({ ...inputs, facebook: e.target.value })}
  />
</FormControl>

<FormControl>
  <FormLabel>Instagram</FormLabel>
  <Input
    type="url"
    value={inputs.instagram}
    onChange={(e) => setInputs({ ...inputs, instagram: e.target.value })}
  />
</FormControl>

<FormControl>
  <FormLabel>Webpage</FormLabel>
  <Input
    type="url"
    value={inputs.webpage}
    onChange={(e) => setInputs({ ...inputs, webpage: e.target.value })}
  />
</FormControl>
<FormControl>
  <FormLabel>SoundCloud</FormLabel>
  <Input
    type="url"
    value={inputs.soundcloud || ''}
    onChange={(e) => setInputs({ ...inputs, soundcloud: e.target.value })}
  />
</FormControl>

<FormControl>
  <FormLabel>Spotify</FormLabel>
  <Input
    type="url"
    value={inputs.spotify || ''}
    onChange={(e) => setInputs({ ...inputs, spotify: e.target.value })}
  />
</FormControl>

<FormControl>
  <FormLabel>LinkedIn</FormLabel>
  <Input
    type="url"
    value={inputs.linkedin || ''}
    onChange={(e) => setInputs({ ...inputs, linkedin: e.target.value })}
  />
</FormControl>

<FormControl>
  <FormLabel>Phone</FormLabel>
  <Input
    type="tel"
    value={inputs.phone || ''}
    onChange={(e) => setInputs({ ...inputs, phone: e.target.value })}
  />
</FormControl>

<FormControl>
  <FormLabel>Hobbies</FormLabel>
  <Input
    value={inputs.hobbies || ''}
    onChange={(e) => setInputs({ ...inputs, hobbies: e.target.value })}
  />
</FormControl>


<FormControl>
  <FormLabel>Old Password</FormLabel>
  <Input
    type={showOldPassword ? "text" : "password"}
    value={inputs.oldPassword}
    onChange={(e) => setInputs({ ...inputs, oldPassword: e.target.value })}
  />
  <Button mt={2} size="sm" onClick={() => setShowOldPassword(!showOldPassword)}>
    {showOldPassword ? 'Hide' : 'Show'} Password
  </Button>
</FormControl>

<FormControl>
  <FormLabel>New Password</FormLabel>
  <Input
    type={showNewPassword ? "text" : "password"}
    value={inputs.password}
    onChange={(e) => setInputs({ ...inputs, password: e.target.value })}
  />
  <Button mt={2} size="sm" onClick={() => setShowNewPassword(!showNewPassword)}>
    {showNewPassword ? 'Hide' : 'Show'} Password
  </Button>
</FormControl>


            {/* Adaugă și celelalte câmpuri după același model... */}
          </Flex>
        </Flex>

        <Button onClick={handleCancel}>Cancel</Button>
        <Button colorScheme="purple" onClick={handleSubmit}>
          Submit
        </Button>
      </Flex>
    </Box>
  );
}
