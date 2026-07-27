const asyncHandler = require('../utils/asyncHandler');
const config = require('../config');
const Brand = require('../models/Brand');
const CarModel = require('../models/CarModel');
const City = require('../models/City');
const FuelType = require('../models/FuelType');
const Banner = require('../models/Banner');
const Notification = require('../models/Notification');

exports.getContact = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      phone: config.contactPhone,
      whatsapp: config.contactWhatsapp,
      callUrl: `tel:${config.contactPhone}`,
      whatsappUrl: `https://wa.me/${config.contactWhatsapp}`,
    },
  });
});

exports.getMeta = asyncHandler(async (req, res) => {
  const [brands, models, cities, fuelTypes, banners] = await Promise.all([
    Brand.find({ isActive: true }).sort({ name: 1 }),
    CarModel.find({ isActive: true }).populate('brand', 'name').sort({ name: 1 }),
    City.find({ isActive: true }).sort({ name: 1 }),
    FuelType.find({ isActive: true }).sort({ name: 1 }),
    Banner.find({ isActive: true }).sort({ order: 1 }),
  ]);

  res.json({
    success: true,
    data: { brands, models, cities, fuelTypes, banners },
  });
});

exports.getNotifications = asyncHandler(async (req, res) => {
  const data = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50);
  res.json({ success: true, data });
});

exports.markNotificationRead = asyncHandler(async (req, res) => {
  await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { isRead: true }
  );
  res.json({ success: true, message: 'Marked as read' });
});
