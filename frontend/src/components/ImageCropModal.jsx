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
  Box
} from "@chakra-ui/react";
import getCroppedImg from "./cropImageUtils";

const ImageCropModal = ({ isOpen, onClose, imageSrc, onCropComplete }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropDone = async () => {
    const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
    onCropComplete(croppedImage);
    onClose();
  };

  const onCropCompleteInternal = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent maxH="90vh" overflow="hidden">
      <ModalHeader>Crop your profile picture</ModalHeader>
        <ModalCloseButton />
        <ModalBody maxH="calc(100vh - 200px)" overflowY="auto">
        <Box position="relative" width="100%" paddingTop="100%" bg="gray.900">
  <Cropper
    image={imageSrc}
    crop={crop}
    zoom={zoom}
    aspect={1}
    cropShape="round"
    showGrid={false}
    zoomWithScroll
    minZoom={1}
    maxZoom={4}
    onCropChange={setCrop}
    onZoomChange={setZoom}
    onCropComplete={onCropCompleteInternal}
    mediaProps={{
      style: {
        objectFit: "contain"
      }
    }}
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

export default ImageCropModal;
