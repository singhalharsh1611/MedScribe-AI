import 'dotenv/config';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

// Config is automatically picked up from CLOUDINARY_URL in .env
cloudinary.config({
  secure: true
});

export const uploadAudioBuffer = async (audioBuffer: Buffer): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'video', // Audio files are uploaded as 'video' in Cloudinary
        folder: 'medical_dictations',
      },
      (error, result) => {
        if (result) {
          resolve(result.secure_url);
        } else {
          reject(error);
        }
      }
    );
    streamifier.createReadStream(audioBuffer).pipe(uploadStream);
  });
};

export const uploadAudioFile = async (filePath: string): Promise<string> => {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            resource_type: 'video',
            folder: 'medical_dictations',
        });
        return result.secure_url;
    } catch (e) {
        throw e;
    }
};
