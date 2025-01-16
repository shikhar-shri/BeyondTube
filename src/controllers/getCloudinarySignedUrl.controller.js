import { v2 as cloudinary } from "cloudinary";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
});

const getCloudinarySignedUrl = asyncHandler(async (req, res) => {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const signature = await cloudinary.utils.api_sign_request(
    {
      timestamp,
    },
    process.env.CLOUDINARY_API_SECRET
  );

  // Generate the URL to upload the file directly to Cloudinary
  const uploadUrl = `https://api.cloudinary.com/v1_1/your_cloud_name/video/upload`;

  res.status(200).json(
    new ApiResponse(
      200,
      {
        signed_url: uploadUrl,
        signature,
        timestamp,
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      },
      "Signed Url generated successfully"
    )
  );
});

export { getCloudinarySignedUrl };
