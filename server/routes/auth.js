import express from "express";

import config from "../config.js";

import { generateAccessToken } from "../helpers/generateAccessToken.js";

const { cypherQuerySession, mySqlDriver, REACT_FRONT_END_URL } = config;

const router = express.Router();

import jwt from "jsonwebtoken";
import bycrypt from "bcrypt";
import nodemailer from "nodemailer";
import {
  authenticateUserMiddleware,
  auditTrailMiddleware,
} from "../middleware/authMiddleware.js";

const JWT_SECRET = "your_secret_key";

// Helper function to generate email verification tokens
const generateVerificationToken = (email) =>
  jwt.sign({ email }, JWT_SECRET, { expiresIn: "24h" });

const findUserByEmailQuery = (email) =>
  `SELECT * FROM user_account WHERE username = '${email}'`;

const updateVerificationStatusQuery = (email) =>
  `UPDATE user_account SET is_verified = 1 WHERE username  = '${email}'`;

router.post("/send-verification-email", async (req, res) => {
  const { email } = req.body;

  try {
    // Check if user exists
    const [rows] = await mySqlDriver.query(findUserByEmailQuery(email));
    const user = rows[0];

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // // Skip if already verified, or keep this if needed
    // if (user.is_verified) {
    //   return res
    //     .status(400)
    //     .json({ success: false, message: "User is already verified" });
    // }

    // You can update is_verified here if needed, or skip if done already
    await mySqlDriver.query(updateVerificationStatusQuery(email));

    const temporaryPassword = user.password; // Replace with real logic

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.APP_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Your Temporary Password",
      html: `
        <h1>Welcome to Lendease</h1>
        <p>Your account has been created successfully.</p>
        <p><strong>Temporary Password:</strong> ${temporaryPassword}</p>
        <p>Please log in using these credentials and change your password immediately.</p>
        <br>
        <p>Thank you!</p>
      `,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error(err);
        return res
          .status(500)
          .json({ success: false, message: "Failed to send email" });
      }
      res
        .status(200)
        .json({ success: true, message: "Temporary password email sent" });
    });
  } catch (error) {
    console.error("Send email error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

/**
//  * Route to verify email
//  */
// router.get("/verify-email/:token", async (req, res) => {
//   const { token } = req.params;

//   try {
//     // Verify the token
//     const decodedToken = jwt.verify(token, JWT_SECRET);

//     const email = decodedToken.email;

//     // Check if user exists
//     const [rows] = await mySqlDriver.query(findUserByEmailQuery(email));
//     const user = rows[0];

//     if (!user) {
//       return res
//         .status(404)
//         .json({ success: false, message: "User not found" });
//     }

//     if (user.is_verified === 1) {
//       return res
//         .status(200)
//         .json({ success: false, message: "User is already verified" });
//     }

//     //Update the user's verification status
//     await mySqlDriver.query(updateVerificationStatusQuery(email));

//     res
//       .status(200)
//       .json({ success: true, message: "Email verified successfully" });
//   } catch (error) {
//     if (error.name === "TokenExpiredError") {
//       return res
//         .status(400)
//         .json({ success: false, message: "Verification link expired" });
//     }

//     console.error("Email verification error:", error);
//     res.status(500).json({ success: false, message: "Internal server error" });
//   }
// });

router.post("/login", async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  try {
    // Connect to the database

    // Query the user by email
    const [rows] = await mySqlDriver.execute(
      `
  SELECT ua.*, ur.role_name as role
  FROM user_account ua
  INNER JOIN user_role ur
    ON ua.role_id = ur.role_id
  WHERE ua.username = ?
  `,
      [email]
    );

    console.log({ rows });

    // Check if user exists
    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = rows[0];

    // Compare the password with the hash
    const isPasswordValid = password === user.password;
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.is_verified === 0) {
      return res.status(401).json({
        success: false,
        message: "Please verify you account first. Check your email to verify.",
        needVerification: true,
      });
    }
    // Generate JWT token
    const accessToken = generateAccessToken(user);

    console.log({ accessToken });

    // Send response with token

    // console.log({ user });

    // let {...otherProps, password} = user;
    res.json({
      success: true,
      token: accessToken,
      data: {
        role: user.role,
        userId: user.user_id,
        email: user.username,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/logout", async (req, res) => {
  // Assuming the client stores the token in local storage or cookies
  // You can respond with a message instructing the client to delete the token

  let loggedInUser = req.user;

  console.log({ loggedInUser });

  // await auditTrailMiddleware({
  //   employeeId: loggedInUser.EmployeeID,
  //   action: 'Logout'
  // });
  res.json({
    success: true,
    message:
      "Logged out successfully. Please remove your access token from storage.",
  });
});

router.post("/forgetPassword", async (req, res, next) => {
  try {
    // Find the user by email
    // const user = await User.findOne({ mail: req.body.email });

    let email = req.body.email;

    var [user] = await mySqlDriver.execute(findUserByEmailQuery(email));

    console.log({ user });
    const foundUserByEmail = user.find((u) => {
      return u.username === email;
    });

    // If user not found, send error message
    if (!foundUserByEmail) {
      res.status(401).json({
        success: false,
        message: "Email is not registered in our system.",
      });
    } else {
      // Generate a unique JWT token for the user that contains the user's id
      const token = jwt.sign({ email: foundUserByEmail.username }, "secret", {
        expiresIn: "10m",
      });

      // Send the token to the user's email
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL, // Replace with your email
          pass: process.env.APP_PASSWORD, // Replace with your email password
        },
      });

      // Email configuration
      const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: "Reset Password",
        html: `<h1>Reset Your Password</h1>
    <p>Click on the following link to reset your password:</p>
    <a href="${REACT_FRONT_END_URL}/reset-password/${token}">${REACT_FRONT_END_URL}/reset-password/${token}</a>
    <p>The link will expire in 10 minutes.</p>
    <p>If you didn't request a password reset, please ignore this email.</p>`,
      };

      // Send the email
      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          return res.status(500).send({ message: err.message });
        }
        res.status(200).send({ message: "Email sent" });
      });
    }
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});
router.post("/reset-password/:token", async (req, res, next) => {
  try {
    // Verify the token sent by the user
    let newPassword = req.body.newPassword;
    const decodedToken = jwt.verify(req.params.token, "secret");

    // If the token is invalid, return an error
    if (!decodedToken) {
      return res.status(401).send({ message: "Invalid token" });
    }

    // find the user with the id from the token

    // console.log(decodedToken.email);

    console.log({ decodedToken });
    var [user] = await mySqlDriver.execute(
      findUserByEmailQuery(decodedToken.email)
    );
    const foundUserByEmail = user.find((u) => {
      return u.username === decodedToken.email;
    });

    console.log({ foundUserByEmail });
    // If user not found, send error message
    if (!foundUserByEmail) {
      res.status(401).json({
        success: false,
        message: "Email is not registered in our system.",
      });
    } else {
      var [user] = await mySqlDriver.execute(
        `UPDATE user_account SET password = '${newPassword}' 
        WHERE username = '${foundUserByEmail.username}'`
      );

      res.status(200).send({ message: "Password updated" });
    }
  } catch (err) {
    console.log(err);
    // Send error response if any error occurs
    res.status(500).send({ message: err.message });
  }
});

export default router;
