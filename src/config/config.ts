import dotenv from "dotenv";

dotenv.config();

const config = {
  port: process.env.PORT,
  mongodb_uri: process.env.MONGODB_URI,
  jwt_scret_key: process.env.JWT_SECRET_KEY,
  env: process.env.ENV,
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET_KEY,
  client_url: process.env.CLIENT_URL,
};

export default Object.freeze(config);
