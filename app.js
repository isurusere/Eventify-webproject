const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Serve static files (like your HTML)
app.use(express.static('public'));

// POST route for sending email
app.post('/send-email', async (req, res) => {
    const { name, email, message } = req.body;

    // Create transporter using your email service
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'your_email@gmail.com',
            pass: 'your_email_password_or_app_password',
        }
    });

    // Email content
    const mailOptions = {
        from: email,
        to: 'your_email@gmail.com',
        subject: `Message from ${name}`,
        text: message,
    };

    // Send email
    try {
        await transporter.sendMail(mailOptions);
        res.send('Email sent successfully!');
    } catch (error) {
        console.error(error);
        res.status(500).send('Something went wrong!');
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
