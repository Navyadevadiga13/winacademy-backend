// models/Course.js
const mongoose = require('mongoose');

// Define schema
const courseSchema = new mongoose.Schema(
  {
    course_name: {
      type: String,
      required: true,
      trim: true
    },
    original_price: {
      type: Number,
      required: true
    },
    discounted_price: {
      type: Number,
      required: true
    },
    course_category: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    target_audience: {
      type: [String], // Array for multiple audience groups
      required: true
    },
    course_curriculum: {
      type: [String], // Array for course modules/lessons
      required: true
    },
    duration: {
      type: String, // e.g., '6 weeks', '12 hours'
      required: true
    },
    course_level: {
      type: String,
      required: true
    },
       image_url: {
      type: String, // URL of category or course image
      required: false, // optional field
      trim: true
    },
    certification: {
  type: String,
  required: true
}
  },
  { timestamps: true }
);

// Export model
module.exports = mongoose.model('Course', courseSchema);
