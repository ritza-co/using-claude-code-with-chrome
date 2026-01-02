const express = require('express');
const bcrypt = require('bcrypt');
const path = require('path');
const userStore = require('./store/userStore');

const app = express();
const PORT = 3000;
const SALT_ROUNDS = 10;
const MIN_PASSWORD_LENGTH = 6;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePassword(password) {
  return password && password.length >= MIN_PASSWORD_LENGTH;
}

function sendHtmlResponse(res, statusCode, message, isSuccess = false) {
  const messageClass = isSuccess ? 'success' : 'error';
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registration ${isSuccess ? 'Success' : 'Error'}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 400px;
            margin: 50px auto;
            padding: 20px;
        }
        h1 {
            text-align: center;
            color: #333;
        }
        .message {
            margin-top: 15px;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            font-size: 16px;
        }
        .success {
            background-color: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        .error {
            background-color: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        a {
            display: inline-block;
            margin-top: 20px;
            color: #007bff;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <h1>User Registration</h1>
    <div class="message ${messageClass}">
        ${message}
    </div>
    <div style="text-align: center;">
        <a href="/register">← Back to Registration</a>
    </div>
</body>
</html>
  `;
  res.status(statusCode).send(html);
}

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'register.html'));
});

app.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendHtmlResponse(res, 400, 'Email and password are required');
    }

    if (!validateEmail(email)) {
      return sendHtmlResponse(res, 400, 'Invalid email format');
    }

    if (!validatePassword(password)) {
      return sendHtmlResponse(res, 400, `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`);
    }

    const existingUser = userStore.findByEmail(email);
    if (existingUser) {
      return sendHtmlResponse(res, 409, 'Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = userStore.create({
      email,
      password: hashedPassword
    });

    return sendHtmlResponse(
      res,
      201,
      `User registered successfully!<br><br><strong>Email:</strong> ${user.email}<br><strong>User ID:</strong> ${user.id}<br><strong>Created:</strong> ${new Date(user.createdAt).toLocaleString()}`,
      true
    );

  } catch (error) {
    console.error('Registration error:', error);
    return sendHtmlResponse(res, 500, 'Internal server error');
  }
});

app.get('/users', (req, res) => {
  const users = userStore.getAll().map(user => ({
    id: user.id,
    email: user.email,
    createdAt: user.createdAt
  }));

  res.json({
    success: true,
    users
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Registration page: http://localhost:${PORT}/register`);
});
