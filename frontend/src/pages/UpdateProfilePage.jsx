// Updated UpdateProfilePage.jsx with Confirm Password aligned with City, Webpage under Username, Custom Gender under Pronouns, and Hobbies added
'use client';

import {
  Avatar,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Select,
  Text,
  Textarea,
  VStack,
  InputGroup,
  InputRightElement,
  useDisclosure,
  Image,
} from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import userAtom from '../atoms/userAtom';
import usePreviewImg from '../hooks/usePreviewImg';
import useShowToast from '../hooks/useShowToast';
import RectangleShape from '../assets/rectangleShape';
import ImageCropModal from '../components/ImageCropModal';

import soundcloudIcon from '../assets/soundcloud.svg';
import spotifyIcon from '../assets/spotify.svg';
import linkedinIcon from '../assets/linkedin.svg';
import instagramIcon from '../assets/instagram.svg';
import facebookIcon from '../assets/facebook.svg';
import webpageIcon from '../assets/webpage.svg';

const renderSocialInput = (label, valueKey, icon, inputs, setInputs) => {
  if (!inputs || !Object.prototype.hasOwnProperty.call(inputs, valueKey)) return null;

  const maxLength = valueKey === 'webpage' ? 100 : undefined;
  const value = inputs[valueKey] || '';
  const isOverLimit = maxLength && value.length > maxLength;

  return (
    <FormControl>
      <FormLabel>
        <Image src={icon} display="inline-block" w="16px" h="16px" mr={2} />
        {label}
      </FormLabel>
      <Input
        value={value}
        onChange={(e) => setInputs({ ...inputs, [valueKey]: e.target.value })}
        maxLength={maxLength}
      />
      {maxLength && (
        <Text fontSize="xs" color={isOverLimit ? 'red.500' : 'gray.500'} textAlign="right">
          {value.length}/{maxLength}
        </Text>
      )}
    </FormControl>
  );
};

export default function UpdateProfilePage() {
  const [user, setUser] = useRecoilState(userAtom);
  const showToast = useShowToast();
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const BIO_LIMIT = 440;

  const [inputs, setInputs] = useState({});
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [rawImage, setRawImage] = useState(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const { imgUrl, setImgUrl } = usePreviewImg();

  const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDifference = today.getMonth() - dob.getMonth();
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
};

// In UpdateProfilePage.jsx, inside the useEffect
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
            confirmPassword: '',
            location: user.location || '',
            address: user.address || '',
            city: user.city || '',
            country: user.country || '',
            profession: user.profession || '',
            dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
            phone: user.phone || '',
            webpage: user.webpage || '',
            gender: user.gender || '',
            customGender: user.customGender || '', // Ensure this is handled if you store it directly or map it.
            pronouns: user.pronouns || '',
            postalCode: user.postalCode || '',
            hobbies: user.hobbies || '',
            facebook: user.facebook || '',
            instagram: user.instagram || '',
            soundcloud: user.soundcloud || '',
            spotify: user.spotify || '',
            linkedin: user.linkedin || '',
        });
        setImgUrl(user.profilePicture || null);
    }
}, [user, setImgUrl]); // Added setImgUrl to dependency array

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const base64 = await convertToBase64(file);
    setRawImage(base64);
    setCropModalOpen(true);
  };

  const convertToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (inputs.oldPassword || inputs.password) {
      if (!inputs.oldPassword || !inputs.password) {
        showToast('Error', 'Both old and new passwords are required', 'error');
        return;
      }
      if (inputs.password.length < 6) {
        showToast('Error', 'New password must be at least 6 characters', 'error');
        return;
      }
      if (inputs.password !== inputs.confirmPassword) {
        showToast('Error', 'Passwords do not match', 'error');
        return;
      }
    }

    if ((inputs.bio || '').length > BIO_LIMIT) {
      showToast('Error', `Biography must be at most ${BIO_LIMIT} characters`, 'error');
      return;
    }

    const payload = {
      ...inputs,
      gender: inputs.gender === 'More options' ? inputs.customGender : inputs.gender,
      profilePicture: imgUrl,
    };
    delete payload.customGender;

    try {
      const res = await fetch(`/api/users/update/${user._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.error) return showToast('Error', data.error.message || data.error, 'error');
      showToast('Success', data.message || 'Profile updated', 'success');
      if (data.user) {
        setUser(data.user);
        localStorage.setItem('art-corner', JSON.stringify(data.user));
        navigate(`/${data.user.username}`);
      }
    } catch (error) {
      showToast('Error', error.message, 'error');
    }
  };

  return (
    <Box p={4}>
      <Text mb={3} fontSize="3xl" fontWeight="bold" textAlign="center" w="full">
        Update your profile
      </Text>
      <Flex direction="column" gap={4}>
        <HStack align="start" spacing={10}>
          <VStack ml={4} spacing={4}>
            <Box
              mt={-5}
              w="250px"
              h="250px"
              borderRadius="full"
              bg="gray.100"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize="4xl"
              fontWeight="bold"
              color="gray.600"
              overflow="hidden"
            >
              {imgUrl || user?.profilePicture ? (
                <Image
                  src={imgUrl || user?.profilePicture}
                  alt="Profile"
                  w="100%"
                  h="100%"
                  objectFit="cover"
                />
              ) : (
                `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase()
              )}
            </Box>
            <Button onClick={() => fileRef.current.click()}>Edit avatar</Button>
            <Input hidden type="file" ref={fileRef} onChange={handleImageChange} />
            <FormControl>
              <FormLabel fontWeight="bold">Username</FormLabel>
              <Input
                value={inputs.username}
                onChange={(e) => setInputs({ ...inputs, username: e.target.value })}
              />
            </FormControl>
            <Box w="100%">
              <Text fontWeight="bold" mt={2} mb={4}>
                Social Links
              </Text>
              <VStack spacing={3} align="stretch">
                {renderSocialInput('Webpage', 'webpage', webpageIcon, inputs, setInputs)}
                {renderSocialInput('Facebook', 'facebook', facebookIcon, inputs, setInputs)}
                {renderSocialInput('Instagram', 'instagram', instagramIcon, inputs, setInputs)}
                {renderSocialInput('SoundCloud', 'soundcloud', soundcloudIcon, inputs, setInputs)}
                {renderSocialInput('Spotify', 'spotify', spotifyIcon, inputs, setInputs)}
                {renderSocialInput('LinkedIn', 'linkedin', linkedinIcon, inputs, setInputs)}
              </VStack>
            </Box>
          </VStack>
          <VStack spacing={4} flex={1}>
            
            <HStack spacing={4} w="100%">
              <FormControl>
                <FormLabel fontWeight="bold">First Name</FormLabel>
                <Input
                  value={inputs.firstName}
                  onChange={(e) => setInputs({ ...inputs, firstName: e.target.value })}
                />
              </FormControl>
            {}
            <FormControl>
              <FormLabel fontWeight="bold">Date of Birth</FormLabel>
              <Input
                type="date"
                value={inputs.dateOfBirth}
                onChange={(e) => setInputs({ ...inputs, dateOfBirth: e.target.value })}
              />
            </FormControl>
            </HStack>
            <HStack spacing={4} w="100%">
              <FormControl>
                <FormLabel fontWeight="bold">Last Name</FormLabel>
                <Input
                  value={inputs.lastName}
                  onChange={(e) => setInputs({ ...inputs, lastName: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontWeight="bold">Phone</FormLabel>
                <Input
                  type="tel"
                  value={inputs.phone}
                  onChange={(e) => setInputs({ ...inputs, phone: e.target.value })}
                />
              </FormControl>
            </HStack>
            <HStack spacing={4} w="100%">
              <FormControl>
                <FormLabel fontWeight="bold">Email</FormLabel>
                <Input
                  type="email"
                  value={inputs.email}
                  onChange={(e) => setInputs({ ...inputs, email: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontWeight="bold">Gender</FormLabel>
                <Select
                  value={inputs.gender}
                  onChange={(e) => setInputs({ ...inputs, gender: e.target.value })}
                >
                  <option value="">Select gender</option>
                  <option>Female</option>
                  <option>Male</option>
                  <option>Nonbinary</option>
                  <option>More options</option>
                </Select>
              </FormControl>
            </HStack>
            <HStack spacing={4} w="100%">
              <FormControl w="50%">
                <FormLabel fontWeight="bold">Old Password</FormLabel>
                <InputGroup>
                  <Input
                    type={showOldPassword ? 'text' : 'password'}
                    value={inputs.oldPassword}
                    onChange={(e) => setInputs({ ...inputs, oldPassword: e.target.value })}
                  />
                  <InputRightElement>
                    <Button size="sm" onClick={() => setShowOldPassword(!showOldPassword)}>
                      {showOldPassword ? 'Hide' : 'Show'}
                    </Button>
                  </InputRightElement>
                </InputGroup>
              </FormControl>
              <FormControl w="50%">
                <FormLabel fontWeight="bold">Pronouns</FormLabel>
                <Select
                  value={inputs.pronouns}
                  onChange={(e) => setInputs({ ...inputs, pronouns: e.target.value })}
                >
                  <option value="">Select your pronouns</option>
                  <option value="she/her">she/her</option>
                  <option value="he/him">he/him</option>
                  <option value="they/them">they/them</option>
                  <option value="ve/vir">ve/vir</option>
                  <option value="ze/zir">ze/zir</option>
                  <option value="ey/em">ey/em</option>
                  <option value="xe/xem">xe/xem</option>
                  <option value="per/per">per/per</option>
                  <option value="eir/eirs">eir/eirs</option>
                  <option value="mers/mers">mers/mers</option>
                </Select>
              </FormControl>
            </HStack>
            <HStack spacing={4} w="100%">
              <FormControl w="50%">
                <FormLabel fontWeight="bold">New Password</FormLabel>
                <InputGroup>
                  <Input
                    type={showNewPassword ? 'text' : 'password'}
                    value={inputs.password}
                    onChange={(e) => setInputs({ ...inputs, password: e.target.value })}
                  />
                  <InputRightElement>
                    <Button size="sm" onClick={() => setShowNewPassword(!showNewPassword)}>
                      {showNewPassword ? 'Hide' : 'Show'}
                    </Button>
                  </InputRightElement>
                </InputGroup>
              </FormControl>
              {inputs.gender === 'More options' && (
                <FormControl w="50%">
                  <FormLabel fontWeight="bold">Custom Gender</FormLabel>
                  <Select
                    placeholder="Choose or type your gender"
                    value={inputs.customGender}
                    onChange={(e) => setInputs({ ...inputs, customGender: e.target.value })}
                  >
                    <option>Agender</option>
                    <option>Androgyne</option>
                    <option>Androgynous</option>
                    <option>Bigender</option>
                    <option>Cis</option>
                    <option>Cis Female</option>
                    <option>Cis Male</option>
                    <option>Genderfluid</option>
                    <option>Genderqueer</option>
                    <option>Nonbinary</option>
                    <option>Trans Female</option>
                    <option>Trans Male</option>
                    <option>Other</option>
                  </Select>
                </FormControl>
              )}
            </HStack>

            <HStack spacing={4} w="100%">
              <FormControl w="50%">
                <FormLabel fontWeight="bold">Confirm Password</FormLabel>
                <Input
                  type="password"
                  value={inputs.confirmPassword}
                  onChange={(e) => setInputs({ ...inputs, confirmPassword: e.target.value })}
                />
              </FormControl>
              <FormControl w="50%">
                <FormLabel fontWeight="bold">City</FormLabel>
                <Input
                  value={inputs.city}
                  onChange={(e) => setInputs({ ...inputs, city: e.target.value })}
                />
              </FormControl>
            </HStack>
            <HStack spacing={4} w="100%">
              <FormControl>
                <FormLabel fontWeight="bold">Profession</FormLabel>
                <Input
                  value={inputs.profession}
                  onChange={(e) => setInputs({ ...inputs, profession: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontWeight="bold">Hobbies</FormLabel>
                <Input
                  value={inputs.hobbies}
                  onChange={(e) => setInputs({ ...inputs, hobbies: e.target.value })}
                />
              </FormControl>
            </HStack>
            <HStack spacing={4} w="100%">
              <FormControl>
                <FormLabel fontWeight="bold">Country</FormLabel>
                <Input
                  value={inputs.country}
                  onChange={(e) => setInputs({ ...inputs, country: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontWeight="bold">Postal Code</FormLabel>
                <Input
                  value={inputs.postalCode}
                  onChange={(e) => setInputs({ ...inputs, postalCode: e.target.value })}
                />
              </FormControl>
            </HStack>
            <FormControl>
              <FormLabel fontWeight="bold">Address</FormLabel>
              <Input
                value={inputs.address}
                onChange={(e) => setInputs({ ...inputs, address: e.target.value })}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Biography</FormLabel>
              <Textarea
                value={inputs.bio || ''}
                maxH={100}
                minH={100}
                onChange={(e) => setInputs({ ...inputs, bio: e.target.value })}
                maxLength={440}
              />
              <Text
                fontSize="xs"
                textAlign="right"
                color={(inputs.bio || '').length >= 440 ? 'red.500' : 'gray.500'}
              >
                {(inputs.bio || '').length}/440
              </Text>
            </FormControl>
            <Button onClick={handleSubmit} colorScheme="teal" w="full">
              Submit
            </Button>
          </VStack>
        </HStack>
        <ImageCropModal
          isOpen={cropModalOpen}
          onClose={() => setCropModalOpen(false)}
          imageSrc={rawImage}
          onCropComplete={(croppedBase64) => {
            setImgUrl(croppedBase64);
            setInputs({ ...inputs, profilePicture: croppedBase64 });
          }}
        />
      </Flex>
    </Box>
  );
}
