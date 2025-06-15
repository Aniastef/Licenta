import { createImage } from './createImage';

export default async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc);

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const diameter = Math.max(pixelCrop.width, pixelCrop.height);
  canvas.width = diameter;
  canvas.height = diameter;

  ctx.beginPath();
  ctx.arc(diameter / 2, diameter / 2, diameter / 2, 0, 2 * Math.PI);
  ctx.closePath();
  ctx.clip();

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    diameter,
    diameter,
  );

  return new Promise((resolve) => {
    canvas.toBlob((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result); 
      };
      reader.readAsDataURL(file);
    }, 'image/png'); 
  });
}
