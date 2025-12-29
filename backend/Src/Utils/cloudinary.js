import { v2 } from "cloudinary";
import fs from "fs";
import { configDotenv } from "dotenv";
configDotenv();

v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const fileUpload = async (filePath) => {
  try {
    const response = await v2.uploader.upload(filePath, {
      resource_type: "auto",
    });
    return response;
  } catch (error) {
    throw new Error(`Error uploading ${error.message}`);
  } finally {
    {
      try {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      } catch (error) {
        console.warn("Failed to delete temp file:", filePath);
      }
    }
  }
};

const deleteUpload = async (public_id) => {
  try {
    const response = await v2.uploader.destroy(public_id, {
      resource_type: "image",
    });
    return response;
  } catch (error) {
    console.error("Cloudinary delete error:", error.message);
    return { result: "error", error: error.message };
  }
};


export { fileUpload, deleteUpload };
