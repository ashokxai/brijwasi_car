const Car = require('../models/Car');
const User = require('../models/User');
const Notification = require('../models/Notification');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { generateCarKey } = require('../utils/carKey');
const { filesToImageUrls } = require('../config/cloudinary');

const populateFields = [
  { path: 'brand', select: 'name' },
  { path: 'model', select: 'name' },
  { path: 'fuelType', select: 'name' },
  { path: 'city', select: 'name' },
  { path: 'listedBy', select: 'name email phone' },
];

function buildCarFilter(query, { publicOnly = false } = {}) {
  const filter = {};

  if (publicOnly) {
    filter.status = 'approved';
  } else if (query.status) {
    filter.status = query.status;
  }

  if (query.brand) filter.brand = query.brand;
  if (query.fuelType) filter.fuelType = query.fuelType;
  if (query.city) filter.city = query.city;
  if (query.year) filter.year = Number(query.year);
  if (query.carKey) {
    filter.carKey = { $regex: String(query.carKey).trim(), $options: 'i' };
  }

  if (query.minPrice || query.maxPrice) {
    filter.price = {};
    if (query.minPrice) filter.price.$gte = Number(query.minPrice);
    if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
  }

  if (query.search) {
    const term = String(query.search).trim();
    filter.$or = [
      { title: { $regex: term, $options: 'i' } },
      { description: { $regex: term, $options: 'i' } },
      { carKey: { $regex: term, $options: 'i' } },
    ];
  }

  return filter;
}

exports.getCars = asyncHandler(async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 20);
  const skip = (page - 1) * limit;
  const filter = buildCarFilter(req.query, { publicOnly: true });

  const [cars, total] = await Promise.all([
    Car.find(filter)
      .populate(populateFields)
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

exports.getCarById = asyncHandler(async (req, res) => {
  const car = await Car.findById(req.params.id).populate(populateFields);
  if (!car) throw new AppError('Car not found', 404);

  const isOwner =
    req.user && String(car.listedBy._id || car.listedBy) === String(req.user._id);
  const isAdmin = req.user && req.user.role === 'admin';

  if (car.status !== 'approved' && !isOwner && !isAdmin) {
    throw new AppError('Car not found', 404);
  }

  res.json({ success: true, data: car });
});

exports.createCar = asyncHandler(async (req, res) => {
  const files = req.files || [];
  const minPhotos = req.user.role === 'admin' ? 1 : 3;
  if (files.length < minPhotos) {
    throw new AppError(
      `Upload at least ${minPhotos} photo${minPhotos > 1 ? 's' : ''} (max 10)`,
      400
    );
  }
  if (files.length > 10) {
    throw new AppError('Maximum 10 photos allowed', 400);
  }

  const images = await filesToImageUrls(files, 'dt-car-bazaar/cars');
  const carKey = await generateCarKey();
  const payload = {
    ...req.body,
    carKey,
    year: Number(req.body.year),
    price: Number(req.body.price),
    kmDriven: Number(req.body.kmDriven),
    images,
    listedBy: req.user._id,
    listedByRole: req.user.role,
    status: req.user.role === 'admin' ? req.body.status || 'approved' : 'pending',
    isCertified: req.user.role === 'admin' ? req.body.isCertified === 'true' || req.body.isCertified === true : false,
  };

  const car = await Car.create(payload);
  const populated = await Car.findById(car._id).populate(populateFields);

  if (req.user.role === 'customer') {
    await Notification.create({
      user: req.user._id,
      title: 'Listing submitted',
      message:
        `Your car details have been submitted (Car Key: ${carKey}). Our team will review within 24 hours.`,
      type: 'listing',
      meta: { carId: car._id, carKey },
    });
  }

  res.status(201).json({ success: true, data: populated });
});

exports.updateCar = asyncHandler(async (req, res) => {
  const car = await Car.findById(req.params.id);
  if (!car) throw new AppError('Car not found', 404);

  const isOwner = String(car.listedBy) === String(req.user._id);
  const isAdmin = req.user.role === 'admin';
  if (!isOwner && !isAdmin) {
    throw new AppError('You do not have permission to update this car', 403);
  }

  const allowed = [
    'title',
    'brand',
    'model',
    'year',
    'price',
    'kmDriven',
    'fuelType',
    'transmission',
    'ownership',
    'insuranceValidity',
    'city',
    'description',
    'isCertified',
  ];

  allowed.forEach((field) => {
    if (req.body[field] !== undefined) {
      car[field] = req.body[field];
    }
  });

  if (req.body.year !== undefined) car.year = Number(req.body.year);
  if (req.body.price !== undefined) car.price = Number(req.body.price);
  if (req.body.kmDriven !== undefined) car.kmDriven = Number(req.body.kmDriven);
  if (req.body.isCertified !== undefined) {
    car.isCertified =
      req.body.isCertified === true ||
      req.body.isCertified === 'true' ||
      req.body.isCertified === '1';
  }

  const uploaded = await filesToImageUrls(req.files || [], 'dt-car-bazaar/cars');
  if (req.body.keepImages !== undefined || uploaded.length) {
    let keepImages = car.images || [];
    if (req.body.keepImages !== undefined) {
      try {
        const parsed =
          typeof req.body.keepImages === 'string'
            ? JSON.parse(req.body.keepImages)
            : req.body.keepImages;
        keepImages = Array.isArray(parsed) ? parsed.map(String) : [];
      } catch {
        throw new AppError('Invalid keepImages payload', 400);
      }
      // Only allow keeping images that already belong to this listing
      const existing = new Set((car.images || []).map(String));
      keepImages = keepImages.filter((img) => existing.has(String(img)));
    }
    const nextImages = [...keepImages, ...uploaded].slice(0, 10);
    const minPhotos = isAdmin ? 1 : 3;
    if (nextImages.length < minPhotos) {
      throw new AppError(
        `Listing must have at least ${minPhotos} photo${minPhotos > 1 ? 's' : ''}`,
        400
      );
    }
    car.images = nextImages;
  }

  if (!isAdmin && isOwner) {
    car.status = 'pending';
  }

  if (isAdmin && req.body.status) {
    car.status = req.body.status;
    if (req.body.rejectionReason !== undefined) {
      car.rejectionReason = String(req.body.rejectionReason || '').trim();
    }
  }

  await car.save();
  const populated = await Car.findById(car._id).populate(populateFields);
  res.json({ success: true, data: populated });
});

exports.deleteCar = asyncHandler(async (req, res) => {
  const car = await Car.findById(req.params.id);
  if (!car) throw new AppError('Car not found', 404);

  const isOwner = String(car.listedBy) === String(req.user._id);
  const isAdmin = req.user.role === 'admin';
  if (!isOwner && !isAdmin) {
    throw new AppError('You do not have permission to delete this car', 403);
  }

  await car.deleteOne();
  res.json({ success: true, message: 'Car deleted' });
});

exports.getMyCars = asyncHandler(async (req, res) => {
  const cars = await Car.find({ listedBy: req.user._id })
    .populate(populateFields)
    .sort({ createdAt: -1 });
  res.json({ success: true, data: cars });
});

exports.addFavorite = asyncHandler(async (req, res) => {
  const { carId } = req.body;
  if (!carId) throw new AppError('carId is required', 400);

  const car = await Car.findOne({ _id: carId, status: 'approved' });
  if (!car) throw new AppError('Car not found', 404);

  await User.findByIdAndUpdate(req.user._id, {
    $addToSet: { favorites: carId },
  });

  res.json({ success: true, message: 'Added to favorites' });
});

exports.removeFavorite = asyncHandler(async (req, res) => {
  const { carId } = req.body;
  if (!carId) throw new AppError('carId is required', 400);

  await User.findByIdAndUpdate(req.user._id, {
    $pull: { favorites: carId },
  });

  res.json({ success: true, message: 'Removed from favorites' });
});

exports.getFavorites = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: 'favorites',
    populate: populateFields,
  });
  res.json({ success: true, data: user.favorites || [] });
});
