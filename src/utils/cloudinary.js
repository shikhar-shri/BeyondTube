import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
});

const uploadToCloudinary = async (localFilePath) => {
  if (!localFilePath) {
    return null;
  }

  // cloudinary.uploader
  //   .upload(localFilePath, {
  //     resource_type: "auto",
  //   })
  //   .then((response) => {
  //     console.log(response);
  //     return response;
  //   })
  //   .catch((error) => {
  //     console.log(error);
  //     fs.unlinkSync(localFilePath);
  //     return null;
  //   });

  try {
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    console.log("Cloudinary Response: ", response);
    return response;
  } catch (error) {
    return null;
  } finally {
    try {
      //deleting the file from local disk storage
      fs.unlinkSync(localFilePath);
      console.log("File deleted from disk: ", localFilePath);
    } catch (error) {
      console.error("Error deleting file from disk: ", localFilePath);
    }
  }
};

const deleteFromCloudinary = async (public_id) => {
  if (!public_id) return null;

  try {
    const response = await cloudinary.uploader.destroy(public_id, {
      resource_type: "auto",
    });

    return response;
  } catch (error) {
    return null;
  }
};

export { uploadToCloudinary, deleteFromCloudinary };
