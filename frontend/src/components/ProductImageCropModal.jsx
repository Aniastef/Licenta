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
import getCroppedProductImg from "./cropProductImageUtils";

const ProductImageCropModal = ({ isOpen, onClose, imageSrc, onCropComplete }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const handleCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleDone = async () => {
    const croppedImage = await getCroppedProductImg(imageSrc, croppedAreaPixels);
    onCropComplete(croppedImage);
    setZoom(1);
    setCrop({ x: 0, y: 0 });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Crop Product Image</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box position="relative" width="100%" height="500px" bg="gray.800">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={4 / 3} // 1200 / 900
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={handleCropComplete}
              cropShape="rect"
              showGrid={false}
              minZoom={1}
              maxZoom={3}
            />
          </Box>
          <Slider mt={4} min={1} max={3} step={0.1} value={zoom} onChange={setZoom}>
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb />
          </Slider>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="green" mr={3} onClick={handleDone}>
            Save Crop
          </Button>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ProductImageCropModal;
