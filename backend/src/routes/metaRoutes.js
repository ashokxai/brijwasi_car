const express = require('express');
const metaController = require('../controllers/metaController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/contact', metaController.getContact);
router.get('/meta', metaController.getMeta);
router.get('/notifications', protect, metaController.getNotifications);
router.patch('/notifications/:id/read', protect, metaController.markNotificationRead);

module.exports = router;
