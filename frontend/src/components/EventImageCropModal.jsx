import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Button,
  Box,
} from "@chakra-ui/react";
import getCroppedEventImg from "./cropEventImageUtils";
const EventImageCropModal = ({ isOpen, onClose, imageSrc, onCropComplete }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropDone = async () => {
    const croppedImage = await getCroppedEventImg(imageSrc, croppedAreaPixels);
    onCropComplete(croppedImage);
    onClose();
  };

  const onCropCompleteInternal = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Crop Cover Image</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box
            position="relative"
            width="100%"
            maxW="900px"
            height="500px"
            mx="auto"
            bg="gray.900"
          >
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1200 / 398} // Raport de aspect consistent cu EventCard
              cropShape="rect" // 🟦 dreptunghi, nu cerc
              showGrid={false}
              zoomWithScroll
              minZoom={1}
              maxZoom={3}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropCompleteInternal}
            />
          </Box>

          <Slider
            mt={6}
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={setZoom}
          >
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb />
          </Slider>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="green" mr={3} onClick={onCropDone}>
            Save
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EventImageCropModal;
