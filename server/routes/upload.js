import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import xlsx from 'xlsx';
import verifyToken from '../middleware/verifyToken.js';
import FileData from '../models/FileData.js';

const router = express.Router();

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Initialize upload variable
const upload = multer({
  storage: storage,
  limits: { fileSize: 10000000 }, // 10MB limit
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
}).single('file');

// Check File Type
function checkFileType(file, cb) {
  // Allowed ext
  const filetypes = /xlsx|xls|csv/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = file.mimetype === 'application/vnd.ms-excel' || 
                   file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                   file.mimetype === 'text/csv' || 
                   file.mimetype === 'application/csv';

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Excel or CSV Files Only!');
  }
}

// @route   POST api/upload
// @desc    Upload an excel file, parse it, and save to DB
// @access  Private
router.post('/', verifyToken, (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err });
    }
    if (req.file == undefined) {
      return res.status(400).json({ message: 'Error: No File Selected!' });
    }

    try {
      const workbook = xlsx.readFile(req.file.path);
      const sheet_name_list = workbook.SheetNames;
      const jsonData = xlsx.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
      
      const newFileData = new FileData({
        filename: req.file.originalname,
        data: jsonData,
        user: req.user.id, // from verifyToken middleware
      });

      await newFileData.save();
      
      // Clean up the temporary physical file to prevent storage leaks
      fs.unlink(req.file.path, (unlinkErr) => {
        if (unlinkErr) console.error("Error deleting temp file:", unlinkErr);
      });

      res.json({
        message: 'File uploaded, parsed, and saved successfully',
        fileId: newFileData.id,
        data: jsonData,
      });
    } catch (error) {
      console.error(error);
      // Ensure file is deleted even if parsing/saving fails
      if (req.file && req.file.path) {
        fs.unlink(req.file.path, () => {});
      }
      res.status(500).send('Server error');
    }
  });
});

// @route   GET api/upload/:id
// @desc    Get file data by ID
// @access  Private
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const fileData = await FileData.findById(req.params.id);
    
    if (!fileData) {
      return res.status(404).json({ message: 'File data not found' });
    }
    
    // Make sure user owns the file
    if (fileData.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    res.json(fileData);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'File data not found' });
    }
    res.status(500).send('Server error');
  }
});

export default router;
