import { Router, Request, Response, NextFunction } from 'express';
import middleware from '@blocklet/sdk/lib/middlewares';
import { getWallet } from '@blocklet/sdk';
import { Model } from 'mongoose';

import logger from '../libs/logger';
import { IUser } from '../models/profile';

const Profile: Model<IUser> = require('../models/profile').default;

const router = Router();

interface UserRequest extends Request {
  user?: any; // 根据实际情况定义更具体的类型
}

interface ProfileRequest extends Request {
  body: {
    profile: Partial<IUser>;
    wallet: string;
  };
}

interface WalletQueryRequest extends Request {
  query: {
    wallet?: string;
  };
}

interface IdQueryRequest extends Request {
  query: {
    id?: string;
    wallet?: string;
  };
}

const userMiddleware: (req: UserRequest, res: Response, next: NextFunction) => void = middleware.user();

router.use('/user', userMiddleware, (req: UserRequest, res: Response) => res.json(req.user || {}));

router.use('/data', (_: Request, res: Response) =>
  res.json({
    message: 'Hello Blocklet!',
  }),
);

// get user wallet address
router.get('/address/query', async (_: Request, res: Response): Promise<void> => {
  try {
    const { address } = await getWallet();
    if (!address) {
      res.status(401).json({
        success: false,
        data: null,
      });
      return;
    }
    res.status(200).json({
      success: true,
      data: address,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error('Error querying wallet address:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred while querying the wallet address.',
        data: error.message,
      });
    }
  }
});

// query profiles list by wallet address
router.get('/profiles/query', async (req: WalletQueryRequest, res: Response): Promise<void> => {
  try {
    const { wallet } = req.query;
    if (!wallet) {
      res.status(401).json({
        success: false,
        message: 'Please connect your wallet!',
      });
      return;
    }
    const profiles = await Profile.find({ wallet }).select('name basicInfo');
    res.status(200).json({
      success: true,
      data: profiles,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error('Error creating profile:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred while creating the profile.',
        data: error.message,
      });
    }
  }
});

// query profile by id and wallet address
router.get('/profile/query', async (req: IdQueryRequest, res: Response): Promise<void> => {
  const { id, wallet } = req.query;
  if (!wallet) {
    res.status(401).json({
      success: false,
      message: 'Please connect your wallet!',
    });
    return;
  }
  if (!id) {
    res.status(401).json({
      success: false,
      message: 'Profile ID is required!',
    });
    return;
  }
  const profile = await Profile.findOne({ _id: id, wallet });
  res.status(200).json({
    success: true,
    data: profile,
  });
});

// create a profile for current wallet address
router.post('/profile/create', async (req: ProfileRequest, res: Response): Promise<void> => {
  try {
    const { profile, wallet } = req.body;
    if (!wallet) {
      res.status(401).json({
        success: false,
        message: 'Please connect your wallet!',
      });
      return;
    }
    const newProfile = new Profile({ wallet, ...profile });
    await newProfile.save();
    res.status(201).json({
      success: true,
      data: newProfile,
      message: 'Create profile successfully!',
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error('Error creating profile:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred while creating the profile.',
        data: error.message,
      });
    }
  }
});

// update profile by wallet address
router.put('/profile/update', async (req: ProfileRequest, res: Response): Promise<void> => {
  try {
    const { profile } = req.body;

    if (!profile) {
      res.status(400).json({
        success: false,
        message: 'Profile data is required!',
      });
      return;
    }

    const updatedProfile = await Profile.findByIdAndUpdate(
      profile._id,
      { $set: profile },
      {
        new: true,
        upsert: true, // if not existing, create one
      },
    );

    if (!updatedProfile) {
      res.status(401).json({
        success: false,
        message: 'Profile not found and could not be created.',
      });
      return;
    }

    res.status(201).json({
      success: true,
      data: updatedProfile,
      message: 'Profile updated successfully!',
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error('Error updating profile:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred while updating the profile.',
        data: error.message,
      });
    }
  }
});

router.delete('/profile/delete', async (req: IdQueryRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.query;
    const deletedProfile = await Profile.findByIdAndDelete(id);
    if (!deletedProfile) {
      res.status(404).json({
        success: false,
        message: 'Profile not found',
      });
      return;
    }
    res.status(201).json({
      success: true,
      message: 'Profile deleted successfully',
    });
  } catch (error) {
    if (error instanceof Error) {
      logger.error('Error deleting profile:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred while deleting the profile.',
        data: error.message,
      });
    }
  }
});

export default router;
