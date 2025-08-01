import multer from 'multer';
import dotenv from 'dotenv';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import { deleteFromCloudinary } from '../utils/deleteFile.js';

dotenv.config();

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Helper to determine folder, resource type, and allowed formats
const getCloudinaryParams = (file) => {
  const folderMap = {
    profilePhoto: 'profile-photos',
    companyLogo: 'company-logos',
    identificationDoc: 'documents/identifications',
    taxClearance: 'documents/tax-clearance',
    cacCertificate: 'documents/cac',
    businessPermit: 'documents/business-permit',
    supportDocs: 'documents/supporting',
  };

  const folder = folderMap[file.fieldname] || 'documents/others';

  const mime = file.mimetype;

  const isVideo = mime.startsWith('video/');
  const isImage = mime.startsWith('image/');
  const isDocument =
    mime === 'application/pdf' ||
    mime === 'application/msword' ||
    mime.startsWith('application/vnd');

  const resource_type = isVideo
    ? 'video'
    : isImage
    ? 'image'
    : isDocument
    ? 'raw'
    : 'auto';

  const allowedFormats = isVideo
    ? ['mp4', 'mov', 'avi']
    : isImage
    ? ['jpg', 'jpeg', 'png']
    : ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'];

  return { folder, resource_type, allowed_formats: allowedFormats };
};

// Cloudinary dynamic storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => getCloudinaryParams(file),
});

// Allowed MIME types
const allowedTypes = [
  'image/jpeg',
  'image/png',
  'image/jpg',
  'video/mp4',
  'video/mov',
  'video/avi',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

// Multer config with `fields()` allowing maxCount per field
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(
        new Error(
          `Invalid file type: ${file.mimetype}. Allowed types: jpg, png, mp4, mov, avi, pdf, doc, docx, pptx, xlsx`
        )
      );
    }
    cb(null, true);
  },
}).fields([
  { name: 'profilePhoto', maxCount: 1 },
  { name: 'companyLogo', maxCount: 1 },
  { name: 'identificationDoc', maxCount: 1 },
  { name: 'taxClearance', maxCount: 1 },
  { name: 'cacCertificate', maxCount: 1 },
  { name: 'businessPermit', maxCount: 1 },
  { name: 'supportDocs', maxCount: 5 }, // ✅ multiple files supported here
]);

// Upload middleware with optional publicId cleanup
const uploadMiddleware = async (req, res, next) => {
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      console.error('Multer Error:', err);
      return res.status(400).json({ message: 'Multer upload error', error: err.message });
    } else if (err) {
      console.error('Upload Error:', err);
      return res.status(500).json({ message: 'Upload error', error: err.message });
    }

    try {
      const publicIdsToDelete = Object.keys(req.body)
        .filter((key) => key.endsWith('PublicId'))
        .map((key) => req.body[key]);

      if (publicIdsToDelete.length > 0) {
        await deleteFromCloudinary(publicIdsToDelete);
      }

      req.uploadedFiles = req.files; // for controller use
      console.log('Uploaded Files:', req.files);
      next();
    } catch (cleanupErr) {
      console.error('Cloudinary Cleanup Error:', cleanupErr.message);
      return res.status(500).json({
        message: 'Cloudinary cleanup error',
        error: cleanupErr.message,
      });
    }
  });
};

export default uploadMiddleware;
