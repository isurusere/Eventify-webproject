import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';
import nodemailer from 'nodemailer';
import session from 'express-session';
import bcrypt from 'bcrypt';
import path from 'path';

const app = express();
app.use(cors());
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/eventDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ MongoDB connected');
}).catch((err) => {
  console.error('❌ MongoDB connection error:', err);
});

app.use(session({
  secret: 'yourSecretKey',
  resave: false,
  saveUninitialized: true
}));

// ===== USER SCHEMA & ROUTE =====
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
});
const User = mongoose.model('User', userSchema);

// ===== REGISTER ROUTE =====
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


const eventSchema = new mongoose.Schema({
  customerName: String,
  email: String,
  phone: String,
  eventType: String,
  eventDate: String,
  guestCount: Number,
  location: String,
  additionalDetails: String
});
const Event = mongoose.model('Event', eventSchema);

app.post('/api/book-event', async (req, res) => {
  try {
    const newEvent = new Event(req.body);
    await newEvent.save();
    res.status(200).json({ message: 'Event booked successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error booking event' });
  }
});

// ===== SEND RECEIPT ROUTE =====
app.post('/send-receipt', async (req, res) => {
  const { email, name, amount } = req.body;

  if (!email || !name || !amount) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'your_email@gmail.com',
        pass: 'your_app_password'
      }
    });

    const mailOptions = {
      from: 'Eventify <your_email@gmail.com>',
      to: email,
      subject: '🎉 Payment Receipt - Eventify',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #6a11cb;">Thank you for your payment!</h2>
          <p>Dear ${name},</p>
          <p>We've received your payment of <strong>$${amount}</strong>.</p>
          <p>This is your official receipt.</p>
          <hr />
          <p style="font-size: 0.9rem; color: #666;">Eventify Team • eventify.com</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Receipt sent successfully' });
  } catch (error) {
    console.error('Error sending receipt email:', error);
    res.status(500).json({ message: 'Failed to send receipt' });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    req.session.user = { username: user.username, email: user.email };

    res.status(200).json({ message: 'Login successful', username: user.username });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
