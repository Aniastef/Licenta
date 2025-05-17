import React, { useState } from "react";
import {
  Box,
  Flex,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Text,
  Checkbox,
  Image,
  InputGroup,
  InputRightElement,
  Select,
  Textarea,
  FormErrorMessage,
  FormErrorIcon
} from "@chakra-ui/react";
import { useSetRecoilState } from "recoil";
import signupImage from "../assets/login.jpg";
import authScreenAtom from "../atoms/authAtom";
import userAtom from "../atoms/userAtom";
import useShowToast from "../hooks/useShowToast";
import ImageCropModal from "./ImageCropModal";
import { useDisclosure } from "@chakra-ui/react";
import imageCompression from 'browser-image-compression';


const SignupCard = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const setAuthScreen = useSetRecoilState(authScreenAtom);
  const setUser = useSetRecoilState(userAtom);
  const showToast = useShowToast();
  const [rawImage, setRawImage] = useState(null);
  const [imgUrl, setImgUrl] = useState(null); // pentru preview-ul final
  const [cropModalOpen, setCropModalOpen] = useState(false);
  
  const [inputs, setInputs] = useState({
    firstName: "", lastName: "", gender: "", pronouns: "",
    address: "", city: "", country: "", phone: "",
    email: "", username: "", password: "", confirmPassword: "",
    bio: "", typeOfArt: "", artistName: "", website: "",
    profilePicture: null,
    customGender: "",
    agreedToTerms: false,
    role: "user", // 👈 AICI
    adminCode: "", // 🔐 Cod pentru a valida înregistrarea ca admin

  });
  
  
  const [errors, setErrors] = useState({});

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    const options = {
      maxSizeMB: 1,              // comprimă la max 1MB
      maxWidthOrHeight: 800,     // opțional: redimensionare
      useWebWorker: true,
    };
  
    try {
      const compressed = await imageCompression(file, options);
      const base64 = await imageCompression.getDataUrlFromFile(compressed);
      setRawImage(base64);      // imagine pentru crop
      setCropModalOpen(true);   // deschide crop modal
    } catch (err) {
      console.error("Image compression failed:", err);
    }
  };
  
  const uploadProfilePicture = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "your_preset"); // sau semnătură dacă nu folosești preset
  
    const res = await fetch(`https://api.cloudinary.com/v1_1/your_cloud_name/image/upload`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    return data.secure_url; // URL-ul imaginii
  };
  
  // 📌 Funcție pentru validarea inputurilor
  const validateInputs = () => {
    let newErrors = {};
  
    if (!inputs.firstName.trim()) newErrors.firstName = "First name is required";
    if (!inputs.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!inputs.username.trim()) {
      newErrors.username = "Username is required";
    } else if (/\s/.test(inputs.username)) {
      newErrors.username = "Username cannot contain spaces";
    }
  
    if (!inputs.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputs.email)) {
      newErrors.email = "Invalid email format";
    }
  
    if (!inputs.password) {
      newErrors.password = "Password is required";
    } else if (inputs.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    } else if (!/[A-Z]/.test(inputs.password)) {
      newErrors.password = "Password must contain at least one uppercase letter";
    } else if (!/[a-z]/.test(inputs.password)) {
      newErrors.password = "Password must contain at least one lowercase letter";
    } else if (!/[0-9]/.test(inputs.password)) {
      newErrors.password = "Password must contain at least one number";
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(inputs.password)) {
      newErrors.password = "Password must contain at least one special character";
    }
    
  
    if (inputs.password !== inputs.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
  
    if (inputs.bio.length > 0 && inputs.bio.length < 10) {
      newErrors.bio = "Bio should be at least 10 characters if provided";
    }
  
    if (!inputs.agreedToTerms) {
      newErrors.agreedToTerms = "You must agree to the terms and conditions";
    }
  
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  

  const handleSignup = async () => {
    if (!validateInputs()) {
      showToast("Error", "Please complete the required fields.", "error");
      return;
    }
  
    try {
      const payload = {
        ...inputs,
        profilePicture: imgUrl, // 🔥 direct imgUrl
        gender: inputs.gender === "Other" ? inputs.customGender : inputs.gender,
      };
      delete payload.customGender;
  
      const res = await fetch("/api/users/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
  
      const data = await res.json();
      if (!res.ok) {
        showToast("Error", data.error || "Failed to sign up", "error");
        return;
      }
  
      localStorage.setItem("licenta", JSON.stringify(data));
      setUser(data);
      showToast("Success", "User signed up successfully", "success");
    } catch (error) {
      showToast("Error", "Something went wrong. Please try again.", "error");
    }
  };
  
  
  

  return (
    <Flex mb={10} minH="80vh" align="center" justify="center">
      <Box mt={8} bg="white" p={8} borderRadius="lg" boxShadow="xl" maxW="1200px" w="full">
        <Text fontSize="2xl" fontWeight="bold" mb={4}>Sign up to Art Corner</Text>
        <Flex gap={10}>
          <VStack spacing={4} flex="1">
            <HStack w="full">
              <FormControl isInvalid={errors.firstName}>
                <FormLabel>First name <Text as="span" color="red.500">*</Text></FormLabel>
                <Input placeholder="John" value={inputs.firstName}
                  onChange={(e) => setInputs({ ...inputs, firstName: e.target.value })} />
                <FormErrorMessage>{errors.firstName}</FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={errors.lastName}>
                <FormLabel>Last name <Text as="span" color="red.500">*</Text></FormLabel>
                <Input placeholder="Doe" value={inputs.lastName}
                  onChange={(e) => setInputs({ ...inputs, lastName: e.target.value })} />
                <FormErrorMessage>{errors.lastName}</FormErrorMessage>
              </FormControl>
            </HStack>
           
            <HStack w="full">
              <FormControl>
                <FormLabel>City</FormLabel>
                <Input placeholder="New York" value={inputs.city}
                  onChange={(e) => setInputs({ ...inputs, city: e.target.value })} />
              </FormControl>
              <FormControl>
                <FormLabel>Country</FormLabel>
                <Input placeholder="USA" value={inputs.country}
                  onChange={(e) => setInputs({ ...inputs, country: e.target.value })} />
              </FormControl>
            </HStack>
            <FormControl isInvalid={errors.email}>
              <FormLabel>Email <Text as="span" color="red.500">*</Text></FormLabel>
              <Input type="email" placeholder="example@mail.com" value={inputs.email}
                onChange={(e) => setInputs({ ...inputs, email: e.target.value })} />
              <FormErrorMessage>{errors.email}</FormErrorMessage>
            </FormControl>
            <FormControl isInvalid={errors.username}>
              <FormLabel>Username <Text as="span" color="red.500">*</Text></FormLabel>
              <Input placeholder="Username" value={inputs.username}
                onChange={(e) => setInputs({ ...inputs, username: e.target.value })} />
              <FormErrorMessage>{errors.username}</FormErrorMessage>
            </FormControl>
            <FormControl isInvalid={errors.password}>
              <FormLabel>Password <Text as="span" color="red.500">*</Text></FormLabel>
              <InputGroup>
                <Input type={showPassword ? "text" : "password"} placeholder="Password" value={inputs.password}
                  onChange={(e) => setInputs({ ...inputs, password: e.target.value })} />
                <InputRightElement>
                  <Button size="sm" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? "Hide" : "Show"}
                  </Button>
                </InputRightElement>
              </InputGroup>
              <FormErrorMessage>{errors.password}</FormErrorMessage>
            </FormControl>
            <FormControl isInvalid={errors.confirmPassword}>
              <FormLabel>Confirm password <Text as="span" color="red.500">*</Text></FormLabel>
              <InputGroup>
                <Input type={showConfirmPassword ? "text" : "password"} placeholder="Confirm password"
                  value={inputs.confirmPassword}
                  onChange={(e) => setInputs({ ...inputs, confirmPassword: e.target.value })} />
                <InputRightElement>
                  <Button size="sm" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? "Hide" : "Show"}
                  </Button>
                </InputRightElement>
              </InputGroup>
              <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
            </FormControl>
          </VStack>

          {/* Coloana 2 */}
          <VStack spacing={4} flex="1">
            <FormControl>
              <FormLabel>Phone number</FormLabel>
              <Input placeholder="+123456789" value={inputs.phone}
                onChange={(e) => setInputs({ ...inputs, phone: e.target.value })} />
            </FormControl>
            <FormControl>
  <FormLabel>Profile picture</FormLabel>
  <Input type="file" onChange={handleImageChange} />
  
</FormControl>
<ImageCropModal
  isOpen={cropModalOpen}
  onClose={() => setCropModalOpen(false)}
  imageSrc={rawImage}
  onCropComplete={(croppedBase64) => {
    setImgUrl(croppedBase64); // preview final
    setInputs({ ...inputs, profilePicture: croppedBase64 }); // trimitem la backend
  }}
/>


<HStack w="full" align="start">
  <FormControl flex="1">
    <FormLabel>Gender</FormLabel>
    <Select
      placeholder="Select gender"
      value={inputs.gender}
      onChange={(e) => {
        const val = e.target.value;
        setInputs({ ...inputs, gender: val, customGender: "" });
      }}
    >
      <option>Female</option>
      <option>Male</option>
      <option>Nonbinary</option>
      <option>More options</option>
    </Select>
  </FormControl>

  {inputs.gender === "More options" && (
    <FormControl flex="1">
      <FormLabel>Gender identity</FormLabel>
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

<FormControl flex="1">
  <FormLabel>Pronouns</FormLabel>
  <Select
    placeholder="Select your pronouns"
    value={inputs.pronouns}
    onChange={(e) => setInputs({ ...inputs, pronouns: e.target.value })}
  >
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


            <HStack w="full">
              <FormControl>
                <FormLabel>Home Address</FormLabel>
                <Input placeholder="Street 123" value={inputs.address}
                  onChange={(e) => setInputs({ ...inputs, address: e.target.value })} />
              </FormControl>
              </HStack>
            <FormControl>
              <FormLabel>Bio</FormLabel>
              <Textarea minH={"130px"} maxH={"130px"} placeholder="Something about you!" value={inputs.bio}
                onChange={(e) => setInputs({ ...inputs, bio: e.target.value })} />
            </FormControl>
          </VStack>
        </Flex>
        <FormControl>
  <FormLabel mt={2}>Register as</FormLabel>
  <Select
    value={inputs.role}
    onChange={(e) => setInputs({ ...inputs, role: e.target.value })}
  >
    <option value="user">User</option>
    <option value="admin">Admin</option>
  </Select>
</FormControl>
{inputs.role === "admin" && (
  <FormControl mt={2}>
    <FormLabel>Admin Access Code</FormLabel>
    <Input
      type="text"
      placeholder="Enter secret admin code"
      value={inputs.adminCode}
      onChange={(e) => setInputs({ ...inputs, adminCode: e.target.value })}
    />
  </FormControl>
)}


        <FormControl  mt={5} isInvalid={errors.agreedToTerms}>
  <Checkbox
    isChecked={inputs.agreedToTerms}
    onChange={(e) =>
      setInputs({ ...inputs, agreedToTerms: e.target.checked })
    }
  >
    I agree to the{" "}
    <Text as="span" color="blue.500" textDecoration="underline" cursor="pointer">
      terms and conditions
    </Text>
  </Checkbox>
  <FormErrorMessage>{errors.agreedToTerms}</FormErrorMessage>
</FormControl>

        <Button colorScheme="yellow" mt={6} w="full" onClick={handleSignup}>
          Sign up
        </Button>
        <Text mt={4} align="center">
          Already have an account?{" "}
          <Button
            variant="link"
            color="blue.500"
            onClick={() => setAuthScreen("login")}
          >
            Login
          </Button>
        </Text>

      </Box>
    </Flex>
  );
};
export default SignupCard;
