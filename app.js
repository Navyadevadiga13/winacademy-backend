// Import packages
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Course = require('./models/course'); // Import your course model
const User=require('./models/user');
const { authenticateToken } = require('./middleware/authentication');
const bcrypt = require('bcrypt');
const jwt=require('jsonwebtoken');
// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // For JSON body parsing

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB connected"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

// Default route
app.get('/', (req, res) => {
  res.send('Backend is working 🚀');
});


//register
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\d{10}$/;
app.post('/api/register', async (req, res) => {
  try {
    const { username, phone, department, email, password, confirm_password } = req.body;

    // Validate required fields
    if (!username || !phone || !department || !password || !confirm_password) {
      return res.status(400).json({ error: 'Please fill in all required fields.' });
    }

    // Validate phone format
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ error: 'Phone number must be exactly 10 digits.' });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    // Password match
    if (password !== confirm_password) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }

    // Validate email format if provided
    if (email && !emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format.' });
    }

    // Validate department included in allowed list
    const allowedDepartments = [
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
    ];
    if (!allowedDepartments.includes(department)) {
      return res.status(400).json({ error: 'Invalid department selection.' });
    }

    // Check unique username
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ error: 'Username already exists. Please choose another.' });
    }

   

    // Check unique email if provided
    if (email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ error: 'Email already registered.' });
      }
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = new User({
      username,
      phone,
      department,
      email: email || undefined,
      password: hashedPassword
    });

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully.' });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});



app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input fields
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Compare entered password with stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Create JWT payload
    const payload = {
      userId: user._id,
      email: user.email,
      name: user.name,
    };

    // Generate JWT token (make sure process.env.JWT_SECRET is set)
const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '182d' });


    // Respond with token and user info
    res.json({
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});




app.get('/api/myprofile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId; // From decoded JWT payload

    // Find user by ID, exclude password field
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User profile fetched successfully',
      user,
    });
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ error: 'Server error fetching profile' });
  }
});
// Get all courses from MongoDB
app.get('/api/get_courses', async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching courses' });
  }
});

app.get('/api/get_course_by_id/:id', async (req, res) => {
  try {
    const courseId = req.params.id;

    // Validate MongoDB ObjectId format (optional but recommended)
    if (!courseId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid course ID format' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching course' });
  }
});

// Get only distinct course categories
app.get('/api/course_categories', async (req, res) => {
  try {
    const categories = await Course.distinct("course_category");
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching categories' });
  }
});
app.get('/api/get_course_by_category/:category', async (req, res) => {
  try {
    const category = req.params.category;

    // Find courses matching the category (case-insensitive)
    const courses = await Course.find({
      course_category: { $regex: new RegExp(`^${category}$`, 'i') }
    });

    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses by category:', error);
    res.status(500).json({ message: 'Server error fetching courses' });
  }
});

app.get('/api/get_course_by_name/:name', async (req, res) => {
  try {
    const name = req.params.name;

    const courses = await Course.find({
      course_name: { $regex: new RegExp(name, 'i') }
    });

    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses by name:', error);
    res.status(500).json({ message: 'Server error fetching courses' });
  }
});

// Server listen
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
