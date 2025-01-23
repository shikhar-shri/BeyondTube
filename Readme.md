# BeyondTube - A Video Sharing Platform

Welcome to the backend for BeyondTube - a YouTube-like video-sharing platform! This project is built using **Node.js**, **Express**, and **MongoDB** with **Mongoose** for data modeling. The backend provides RESTful APIs for user management, video handling, commenting, liking, and other core functionalities of a video-sharing application.

## Project Structure

```
.env
.gitignore
.prettierignore
.prettierrc
package.json
public/
  temp/
    .gitkeep
Readme.md
src/
  app.js
  constants.js
  controllers/
    comment.controller.js
    getCloudinarySignedUrl.controller.js
    like.controller.js
    user.controller.js
    video.controller.js
  db/
    index.js
  index.js
  middlewares/
    auth.middleware.js
    multer.middleware.js
  models/
    comment.model.js
    like.model.js
    subcription.model.js
    user.model.js
    video.model.js
  routes/
    comment.routes.js
    getCloudinarySignedUrl.routes.js
    like.routes.js
    user.routes.js
    video.routes.js
  utils/
    apiErrors.js
    apiResponse.js
    asyncHandler.js
    cloudinary.js
    generateAccessAndRefreshTokens.js
```

## Features

### 1. User Management

- User authentication and authorization using **JWT tokens**.
- Secure password storage with hashing.

### 2. Video Management

- Upload videos with metadata (title, description, thumbnail).
- Retrieve videos by ID or search by title.

### 3. Commenting System

- Add comments to videos.
- Support for **nested replies** using a parent-child comment structure.

### 4. Engagement Features

- Like and dislike videos.
- View user-specific watch history.

### 5. Cloudinary Integration

- Generate signed URLs for secure video and thumbnail uploads.

### 6. Error Handling and Validation

- Centralized error handling with custom `apiErrors` utility.
- Input validation using middleware.

## Installation

### Prerequisites

Before running the server, ensure you have the following:

1. **Node.js**: Install the latest stable version of Node.js from [nodejs.org](https://nodejs.org/).
2. **MongoDB Atlas Account**: This project uses MongoDB Atlas, an online cloud database service. Ensure you have a MongoDB Atlas account and a cluster set up. You do not need MongoDB installed locally.
3. **Cloudinary Account**: Set up a Cloudinary account for handling video and image uploads.

### Steps

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd <repository-folder>
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `.env` file in the root directory and add the following (replace the placeholders with your actual values):

   ```env
   PORT=8000
   MONGODB_URI=<your_mongodb_connection_string>
   CORS_ORIGIN=*
   ACCESS_TOKEN_SECRET=<your_access_token_secret>
   ACCESS_TOKEN_EXPIRY=1d
   REFRESH_TOKEN_SECRET=<your_refresh_token_secret>
   REFRESH_TOKEN_EXPIRY=10d
   CLOUDINARY_CLOUD_NAME=<your_cloudinary_cloud_name>
   CLOUDINARY_API_KEY=<your_cloudinary_api_key>
   CLOUDINARY_API_SECRET=<your_cloudinary_api_secret>
   ```

4. Start the server:
   ```bash
   npm start
   ```
   The server will run on `http://localhost:5000` by default.

## API Endpoints

### User Routes

- `POST /users/register` - Register a new user with avatar and cover image.
- `POST /users/login` - Authenticate and obtain a JWT.
- `POST /users/logout` - Logout the authenticated user (requires JWT).
- `POST /users/refresh-token` - Refresh access tokens.
- `PATCH /users/change-password` - Change the current user's password.
- `PATCH /users/change-avatar` - Update the user's avatar.
- `GET /users/channels/channel/:username` - Fetch channel profile by username (requires JWT).
- `GET /users/watch-history` - Retrieve the authenticated user's watch history.

### Video Routes

- `GET /videos/home` - Fetch all videos for the home page.
- `POST /videos/publish` - Upload a new video with a thumbnail.
- `PATCH /videos/video/:videoId/update` - Update video details with a new thumbnail.
- `GET /videos/my-videos` - Fetch all videos uploaded by the authenticated user.

### Comment Routes

- `POST /comments/:videoId/create-comment` - Add a comment to a video or reply to a comment.
- `GET /comments/:videoId/get-comments` - Fetch all comments for a video with nested replies.
- `GET /comments/:videoId/:parentCommentId/get-replies` - Fetch all replies for a parent comment.
- `DELETE /comments/:videoId/delete-comment/:commentId` - Delete a specific comment.

### Like Routes

`POST /likes/:entityType/:entityId` - Like or dislike an entity (video or comment).

### Cloudinary Routes

- `GET /cloudinary/signed-url` - Get a signed URL for secure uploads.

## Key Utilities

### Middleware

- **auth.middleware.js**: Protects routes by validating JWTs.
- **multer.middleware.js**: Handles file uploads.

### Helpers

- **apiErrors.js**: Defines custom error classes for standardized error handling.
- **apiResponse.js**: Structures API responses consistently.
- **asyncHandler.js**: Wraps async functions to handle errors.
- **cloudinary.js**: Integrates with Cloudinary for media storage.

## Contributing

Contributions are welcome! Please follow the steps below:

1. Fork the repository.
2. Create a new branch: `git checkout -b feature-name`.
3. Commit your changes: `git commit -m 'Add feature-name'`.
4. Push to the branch: `git push origin feature-name`.
5. Submit a pull request.
