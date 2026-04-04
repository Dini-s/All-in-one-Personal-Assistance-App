import bcrypt from 'bcryptjs';
import express from 'express';
import jwt from 'jsonwebtoken';
import expressAsyncHandler from 'express-async-handler';
import speakeasy from 'speakeasy';
import { generateToken } from '../utils.js';
import ServiceProvider from '../models/ServiceProvider.js';
import UserModel from '../models/UserModel.js';
import AdminModel from '../models/Adminisator/AdminModel.js';

const router = express.Router();

// USER LOGIN
router.post(
  '/token',
  expressAsyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email });

    if (user) {
      if (bcrypt.compareSync(password, user.password)) {
        res.send({
          token: generateToken(user),
          status: user.status,
        });
      } else {
        res.status(400).send({ message: 'Invalid password' });
      }
    } else {
      res.status(400).send({ message: 'No Matching Account Found.' });
    }
  })
);

// SERVICE PROVIDER LOGIN
router.post(
  '/token-service-provider',
  expressAsyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send({ message: 'Please Enter Email and Password.' });
    }

    const user = await ServiceProvider.findOne({ email });

    if (user) {
      if (bcrypt.compareSync(password, user.password)) {
        return res.send({
          token: generateToken(user),
        });
      } else {
        res.status(400).send({ message: 'Invalid password' });
      }
    } else {
      res.status(400).send({ message: 'No Matching Account Found.' });
    }
  })
);

// ADMIN LOGIN
router.post(
  '/admin-token',
  expressAsyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send({ message: 'Please Enter Email and Password.' });
    }

    const user = await AdminModel.findOne({ email });

    if (user) {
      if (bcrypt.compareSync(password, user.password)) {
        return res.send({
          token: generateToken(user),
        });
      } else {
        res.status(400).send({ message: 'Invalid password' });
      }
    } else {
      res.status(400).send({ message: 'No Matching Account Found.' });
    }
  })
);

// ADMIN REGISTRATION
router.post(
  '/admin-register',
  expressAsyncHandler(async (req, res) => {
    const { firstName, lastName, email, mobile, password } = req.body;

    try {
      const secret = speakeasy.generateSecret();
      const db_user = await AdminModel.findOne({ email });

      if (db_user) {
        return res.status(400).send({ message: 'Admin already Registered!' });
      }

      const hashPassword = await bcrypt.hash(password, 8);

      const user = new AdminModel({
        firstName,
        lastName,
        email,
        mobile,
        password: hashPassword,
        twoFactorAuthSecret: secret.base32,
      });

      await user.save();

      return res.status(200).send({ message: 'success' });
    } catch (err) {
      return res.status(500).send({ message: err.message });
    }
  })
);

// USER REGISTRATION
router.post(
  '/register',
  expressAsyncHandler(async (req, res) => {
    const { firstName, lastName, email, mobile, password } = req.body;

    try {
      const secret = speakeasy.generateSecret();

      const db_user = await UserModel.findOne({ email });

      if (db_user) {
        return res.status(400).send({ message: 'User already Registered!' });
      }

      const hashPassword = await bcrypt.hash(password, 8);

      const user = new UserModel({
        firstName,
        lastName,
        email,
        mobile,
        password: hashPassword,
        twoFactorAuthSecret: secret.base32,
      });

      await user.save();

      return res.status(200).send({ message: 'success' });
    } catch (err) {
      return res.status(500).send({ message: err.message });
    }
  })
);

export default router;