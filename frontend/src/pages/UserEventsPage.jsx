// import { Box, Heading, Flex, Button, Text } from "@chakra-ui/react";
// import { useState } from "react";
// import RectangleShape from "../assets/rectangleShape";
// import { useRecoilValue } from "recoil";
// import userAtom from "../atoms/userAtom";
// const UserEventsPage = () => {
//   const user = useRecoilValue(userAtom);
//   // Evenimente mock (pentru testare)
//   const createdEvents = [
//     { id: 1, name: "Art Exhibition", date: "2025-01-20" },
//     { id: 2, name: "Photography Workshop", date: "2025-02-15" },
//   ];
//   const interestedEvents = [
//     { id: 3, name: "Sculpture Display", date: "2025-03-10" },
//   ];
//   const goingEvents = [];

//   const [activeTab, setActiveTab] = useState("Created");

//   // Afișează evenimentele în funcție de tab-ul activ
//   const renderEvents = () => {
//     let events = [];
//     if (activeTab === "Created") events = createdEvents;
//     else if (activeTab === "Interested") events = interestedEvents;
//     else if (activeTab === "Going") events = goingEvents;

//     if (events.length === 0) {
//       return (
//         <Text mt={5} textAlign="center">
//           No events found.
//         </Text>
//       );
//     }

//     return events.map((event) => (
//       <Box key={event.id} bg="gray.200" p={4} mb={4} borderRadius="md">
//         <Box width="100%" height="200px" bg="gray.300" mb={4} borderRadius="md" overflow="hidden">
//           {event.coverPhoto ? (
//             <Image src={event.coverPhoto} alt={`${event.name} cover photo`} width="100%" height="100%" objectFit="cover" />
//           ) : (
//             <Box width="100%" height="100%" display="flex" alignItems="center" justifyContent="center" bg="gray.400">
//               <Text>No cover photo available</Text>
//             </Box>
//           )}
//         </Box>
//         <Flex direction="row" justify="space-between">
//         <Heading size="md">{event.name}</Heading>
//         <Text>Taking place on {event.date}</Text>
//         </Flex>
//         <Text>Created by: {event.creatorName}</Text> {/* Afișează numele creatorului */}
//       </Box>
//     ));
//   };

//   return (
//     <>

//       {/* Secțiunea de evenimente */}
//       <Box mt={8} >
    
//       <RectangleShape
//           bgColor="#62cbe0" // Culoare galbenă
//           title={user._username + "'s Events"}
//           minW="200px"
//           maxW="400px"
//           textAlign="left"
//           zIndex="1" // Apare sub galben 
//         />
//         <Box mt={5} mx={5}>
//         <Flex mt={4} mb={4} justify="space-between">
//           {/* Butoane pentru tab-uri */}
//           <Button
//             bg="orange.300" 
//             _hover={{ bg: "orange.400" }} 
//             borderRadius="full"
            
//             onClick={() => setActiveTab("Created")}
//           >
//             Created ({createdEvents.length})
//           </Button>
//           <Button
//             bg="blue.300" 
//             _hover={{ bg: "blue.400" }} 
//             borderRadius="full"
            
//             onClick={() => setActiveTab("Interested")}
//           >
//             Interested ({interestedEvents.length})
//           </Button>
//           <Button
//             bg="yellow.300" 
//             _hover={{ bg: "yellow.400" }} 
//             borderRadius="full"
            
//             onClick={() => setActiveTab("Going")}
//           >
//             Going ({goingEvents.length})
//           </Button>
//         </Flex>

//         {/* Lista de evenimente */}
//         {renderEvents()}
//       </Box>
//       </Box>
//     </>
//   );
// };

// export default UserEventsPage;
