const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { isAdmin } = require('../middlewares/auth.middleware');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../uploads/seats'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'seat-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) return cb(null, true);
        cb(new Error('Chỉ cho phép tải lên hình ảnh!'));
    }
});

router.post('/seats', isAdmin, upload.single('seatImage'), (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'Vui lòng chọn ảnh' });
    
    // Trả về đường dẫn tương đối
    const filePath = `uploads/seats/${req.file.filename}`;
    res.json({ 
        message: 'Tải ảnh thành công', 
        url: filePath 
    });
});

module.exports = router;
