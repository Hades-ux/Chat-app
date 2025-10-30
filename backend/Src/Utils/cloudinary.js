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

const deleteUpload = async (public_id, res) => {
  try {
    const response = await v2.uploader.destroy(public_id, {
      resource_type: "image",
    });
    if (response.result === "ok" || response.result === "not found") {
      return res.status(200).json({
        success: true,
        message: "Image deleted (or already missing)",
        result: response,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Error during the deletion in image",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export { fileUpload, deleteUpload };
