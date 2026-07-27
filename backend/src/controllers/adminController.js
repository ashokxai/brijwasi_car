const User = require('../models/User');
const Car = require('../models/Car');
const Brand = require('../models/Brand');
const CarModel = require('../models/CarModel');
const City = require('../models/City');
const FuelType = require('../models/FuelType');
const Banner = require('../models/Banner');
const Notification = require('../models/Notification');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

exports.getDashboard = asyncHandler(async (req, res) => {
  const [
    totalCars,
    pendingCars,
    approvedCars,
    rejectedCars,
    totalUsers,
    totalBrands,
  ] = await Promise.all([
    Car.countDocuments(),
    Car.countDocuments({ status: 'pending' }),
    Car.countDocuments({ status: 'approved' }),
    Car.countDocuments({ status: 'rejected' }),
    User.countDocuments({ role: 'customer' }),
    Brand.countDocuments(),
  ]);

  const recentPending = await Car.find({ status: 'pending' })
    .populate('brand model listedBy')
    .sort({ createdAt: -1 })
    .limit(5);

  res.json({
    success: true,
    data: {
      stats: {
        totalCars,
        pendingCars,
        approvedCars,
        rejectedCars,
        totalUsers,
        totalBrands,
      },
      recentPending,
    },
  });
});

exports.listAdminCars = asyncHandler(async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 20);
  const skip = (page - 1) * limit;
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.search) {
    const term = String(req.query.search).trim();
    filter.$or = [
      { title: { $regex: term, $options: 'i' } },
      { carKey: { $regex: term, $options: 'i' } },
    ];
  }
  if (req.query.carKey) {
    filter.carKey = { $regex: String(req.query.carKey).trim(), $options: 'i' };
  }

  const [cars, total] = await Promise.all([
    Car.find(filter)
      .populate('brand model fuelType city listedBy')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Car.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: cars,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

exports.updateCarStatus = asyncHandler(async (req, res) => {
  const { status, rejectionReason, isCertified } = req.body;
  if (!['pending', 'approved', 'rejected'].includes(status)) {
    throw new AppError('Invalid status', 400);
  }
  if (status === 'rejected') {
    const reason = String(rejectionReason || '').trim();
    if (reason.length < 10) {
      throw new AppError('Rejection reason must be at least 10 characters', 400);
    }
    if (reason.length > 500) {
      throw new AppError('Rejection reason must be under 500 characters', 400);
    }
  }

  const car = await Car.findById(req.params.id);
  if (!car) throw new AppError('Car not found', 404);

  car.status = status;
  if (rejectionReason !== undefined) car.rejectionReason = String(rejectionReason).trim();
  if (isCertified !== undefined) car.isCertified = Boolean(isCertified);
  await car.save();

  await Notification.create({
    user: car.listedBy,
    title: status === 'approved' ? 'Listing approved' : status === 'rejected' ? 'Listing rejected' : 'Listing updated',
    message:
      status === 'approved'
        ? 'Your car listing has been approved and is now live.'
        : status === 'rejected'
          ? `Your listing was rejected. ${String(rejectionReason || '').trim()}`.trim()
          : 'Your listing status was updated.',
    type: status === 'approved' ? 'approval' : status === 'rejected' ? 'rejection' : 'listing',
    meta: { carId: car._id, carKey: car.carKey },
  });

  res.json({ success: true, data: car });
});

exports.listUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ role: 'customer' }).sort({ createdAt: -1 });
  res.json({
    success: true,
    data: users.map((u) => u.toSafeObject()),
  });
});

exports.updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user || user.role !== 'customer') throw new AppError('User not found', 404);

  if (req.body.isActive !== undefined) user.isActive = req.body.isActive;
  if (req.body.name) user.name = req.body.name;
  if (req.body.phone) user.phone = req.body.phone;
  await user.save();

  res.json({ success: true, data: user.toSafeObject() });
});

function crudHandlers(Model, name) {
  return {
    list: asyncHandler(async (req, res) => {
      const data = await Model.find().sort({ name: 1, order: 1, createdAt: -1 });
      res.json({ success: true, data });
    }),
    create: asyncHandler(async (req, res) => {
      const data = await Model.create(req.body);
      res.status(201).json({ success: true, data });
    }),
    update: asyncHandler(async (req, res) => {
      const data = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!data) throw new AppError(`${name} not found`, 404);
      res.json({ success: true, data });
    }),
    remove: asyncHandler(async (req, res) => {
      const data = await Model.findByIdAndDelete(req.params.id);
      if (!data) throw new AppError(`${name} not found`, 404);
      res.json({ success: true, message: `${name} deleted` });
    }),
  };
}

exports.brands = crudHandlers(Brand, 'Brand');
exports.models = {
  ...crudHandlers(CarModel, 'Model'),
  list: asyncHandler(async (req, res) => {
    const filter = {};
    if (req.query.brand) filter.brand = req.query.brand;
    const data = await CarModel.find(filter).populate('brand', 'name').sort({ name: 1 });
    res.json({ success: true, data });
  }),
};
exports.cities = crudHandlers(City, 'City');
exports.fuelTypes = crudHandlers(FuelType, 'Fuel type');
exports.banners = {
  ...crudHandlers(Banner, 'Banner'),
  create: asyncHandler(async (req, res) => {
    const imageFromUpload = req.file ? `/uploads/${req.file.filename}` : '';
    const imageUrl = imageFromUpload || req.body.imageUrl;
    if (!imageUrl) throw new AppError('Banner image is required', 400);

    const data = await Banner.create({
      title: req.body.title,
      imageUrl,
      link: req.body.link || '',
      order: Number(req.body.order || 0),
      isActive: req.body.isActive !== 'false' && req.body.isActive !== false,
    });
    res.status(201).json({ success: true, data });
  }),
  update: asyncHandler(async (req, res) => {
    const banner = await Banner.findById(req.params.id);
    if (!banner) throw new AppError('Banner not found', 404);

    if (req.body.title !== undefined) banner.title = req.body.title;
    if (req.body.link !== undefined) banner.link = req.body.link;
    if (req.body.order !== undefined) banner.order = Number(req.body.order);
    if (req.body.isActive !== undefined) {
      banner.isActive = req.body.isActive !== 'false' && req.body.isActive !== false;
    }
    if (req.file) {
      banner.imageUrl = `/uploads/${req.file.filename}`;
    } else if (req.body.imageUrl) {
      banner.imageUrl = req.body.imageUrl;
    }

    await banner.save();
    res.json({ success: true, data: banner });
  }),
};

exports.getReports = asyncHandler(async (req, res) => {
  const byStatus = await Car.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  const byFuel = await Car.aggregate([
    { $group: { _id: '$fuelType', count: { $sum: 1 } } },
  ]);
  const monthly = await Car.aggregate([
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 12 },
  ]);

  res.json({ success: true, data: { byStatus, byFuel, monthly } });
});
