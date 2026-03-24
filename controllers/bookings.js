const Booking = require("../models/Booking");
const Hotel = require("../models/Hotel");

//@desc     Get all bookings
//@route    GET /api/v1/bookings
//@access   Public
exports.getBookings = async (req, res, next) => {
  let query;

  if (req.user.role !== "admin") {
    query = Booking.find({ user: req.user.id })
      .populate({ path: "hotel", select: "name address tel" })
      .populate({ path: "user", select: "name email tel" });
  } else {
    if (req.params.hotelId) {
      console.log(req.params.hotelId);
      query = Booking.find({ hotel: req.params.hotelId })
        .populate({ path: "hotel", select: "name address tel" })
        .populate({ path: "user", select: "name email tel" });
    } else {
      query = Booking.find()
        .populate({ path: "hotel", select: "name address tel" })
        .populate({ path: "user", select: "name email tel" }); // ← add this
    }
  }

  try {
    const bookings = await query;

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Cannot find Booking" });
  }
};

exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate({
      path: "hotel",
      select: "name address tel",
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `No booking with the id of ${req.params.id}`,
      });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Cannot find Booking",
    });
  }
};

//@desc    Add booking
//@route   POST /api/v1/hotels/:hotelId/bookings
//@access  Private
// controllers/bookings.js

exports.addBooking = async (req, res, next) => {
  try {
    req.body.hotel = req.params.hotelId;

    const hotel = await Hotel.findById(req.params.hotelId);

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: `No hotel with the id of ${req.params.hotelId}`,
      });
    }

    req.body.user = req.user.id;

    const existedBookings = await Booking.find({ user: req.user.id });

    if (existedBookings.length >= 3 && req.user.role !== "admin") {
      return res.status(400).json({
        success: false,
        message: `User has already made 3 bookings`,
      });
    }

    const booking = await Booking.create(req.body);

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Cannot create Booking",
    });
  }
};

exports.updateBooking = async (req, res, next) => {
  try {
    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `No booking with the id of ${req.params.id}`,
      });
    }

    if (booking.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to update this booking`,
      });
    }

    // If either date is being updated, re-validate the range
    const startDate = req.body.startDate
      ? new Date(req.body.startDate)
      : booking.startDate;
    const endDate = req.body.endDate
      ? new Date(req.body.endDate)
      : booking.endDate;

    if (endDate < startDate) {
      return res.status(400).json({
        success: false,
        message: "End date must be the same as or after start date",
      });
    }

    booking = await Booking.findOneAndUpdate({ _id: req.params.id }, req.body, {
      runValidators: true,
      context: "query",
      returnDocument: "after",
    });

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Cannot update Booking",
    });
  }
};

exports.deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `No booking with the id of ${req.params.id}`,
      });
    }

    // Make sure user is the booking owner
    if (booking.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to delete this booking`,
      });
    }

    await booking.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Cannot delete Booking",
    });
  }
};
