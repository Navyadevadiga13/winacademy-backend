const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    phone: {
      type: String,
      trim: true,
      match: [/^\d{10}$/, 'Phone number must be exactly 10 digits.']
    },
    department: {
      type: String,

      enum: [
       "Marketing",
       "Sales department Training",
       "Client",
       "HR",
       "B2B",
       "Business",
       "IT & Development",
       "IT,Software & Technology",
       "Language",
       "Employability",
       "Web Development",
       "Healthcare, Safety & Fitness",
       "Accounting & Finance",
       "Personal Development",
       "Health & Fitness",
       "Career Bundles",
       "Teaching & Education",
       "Beauty & Wellness",
       "HR & Leadership",
       "Beauty & Wellness",
       "Marketing & Advertising",
       "Business & Management",
       "Sports",
       "Animal Care",
       "lifestyle",
       "Psychology",
       "Security",
       "Therapy",
       "Photography & Video",
       "Management",
       "Project Management",
       "Hospitality",
       "Computers & IT"
       
      ] // Replace these with actual department names
    },
    email: {
      type: String,
      unique: true,
      sparse: true, // allows multiple docs w/o email but unique if provided
      trim: true,
      lowercase: true,
      match: [/.+@.+\..+/, 'Invalid email format']
    },
    password: {
      type: String,
      required: true,
      trim: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
