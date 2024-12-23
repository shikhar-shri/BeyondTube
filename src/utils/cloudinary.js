import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
});

const uploadToCloudinary = (localFilePath) => {
  if (!localFilePath) {
    return null;
  }

  cloudinary.uploader
    .upload(localFilePath, {
      resource_type: "auto",
    })
    .then((response) => {
      console.log(response);
      return response;
    })
    .catch((error) => {
      console.log(error);
      fs.unlinkSync(localFilePath);
      return null;
    });
};

export { uploadToCloudinary };
