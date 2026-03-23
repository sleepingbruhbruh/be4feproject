const mongoose = require('mongoose');
 
const BookingSchema = new mongoose.Schema({
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true,
        validate: {
            validator: function (value) {
                return value >= this.startDate;
            },
            message: 'End date must be the same as or after start date'
        }
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    hotel: {
        type: mongoose.Schema.ObjectId,
        ref: 'Hotel',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});
 
module.exports = mongoose.model('Booking', BookingSchema);
 