const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema({
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    validate: {
      validator: function (value) {
        let startDate;
        if (typeof this.getUpdate === "function") {
          const update = this.getUpdate();
          startDate = update.startDate ?? update["$set"]?.startDate;
        } else {
          startDate = this.startDate;
        }
        if (!startDate) return true;
        return value >= new Date(startDate);
      },
      message: "End date must be the same as or after start date",
    },
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  hotel: {
    type: mongoose.Schema.ObjectId,
    ref: "Hotel",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Booking", BookingSchema);
