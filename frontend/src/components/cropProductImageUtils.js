import { createImage } from "./createImage";

const getCroppedProductImg = async (imageSrc, crop) => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const targetWidth = 1200;
  const targetHeight = 900;

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  ctx.fillStyle = "white"; // fundal alb
  ctx.fillRect(0, 0, targetWidth, targetHeight);

  // Dimensiunea crop-ului efectiv în imagine
  const cropWidth = crop.width;
  const cropHeight = crop.height;

  // Calculează factorul de scalare: nu face upscale, doar downscale
  const scale = Math.min(
    targetWidth / cropWidth,
    targetHeight / cropHeight,
    1 // nu mări imaginea dacă e mai mică
  );

  const scaledWidth = cropWidth * scale;
  const scaledHeight = cropHeight * scale;

  const offsetX = (targetWidth - scaledWidth) / 2;
  const offsetY = (targetHeight - scaledHeight) / 2;

  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    offsetX,
    offsetY,
    scaledWidth,
    scaledHeight
  );

  return canvas.toDataURL("image/jpeg");
};

export default getCroppedProductImg;
