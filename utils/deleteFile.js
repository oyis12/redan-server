import { v2 as cloudinary } from 'cloudinary';

export const deleteFromCloudinary = async (publicIds = []) => {
  if (!Array.isArray(publicIds) || publicIds.length === 0) return;

  const deletePromises = publicIds.map(async (publicId) => {
    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
      console.log(`Deleted Cloudinary file: ${publicId}`);
    } catch (err) {
      console.error(`Failed to delete Cloudinary file (${publicId}):`, err.message);
    }
  });

  await Promise.all(deletePromises);
};
