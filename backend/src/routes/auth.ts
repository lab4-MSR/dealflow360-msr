import { Router } from 'express';
import {
  signup,
  login,
  portalLogin,
  logout,
  currentSession,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
  getInvitation,
  acceptInvitation,
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';

export const authRouter = Router();

// Public endpoints
authRouter.post('/signup', signup);
authRouter.post('/login', login);
authRouter.post('/portal-login', portalLogin);
authRouter.post('/forgot-password', forgotPassword);
authRouter.post('/reset-password', resetPassword);
authRouter.post('/verify-email', verifyEmail);
authRouter.get('/invitations/:token', getInvitation);
authRouter.post('/invitations/:token/accept', acceptInvitation);

// Authenticated endpoints
authRouter.post('/logout', authenticate, logout);
authRouter.post('/resend-verification', authenticate, resendVerification);
authRouter.get('/session', authenticate, currentSession);