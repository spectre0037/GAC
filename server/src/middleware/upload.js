import multer from 'multer';

// Memory storage — file stays in RAM as a buffer just long enough to stream
// to Cloudinary, never touches disk. 5MB cap is generous for phone screenshots.
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed.'), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});