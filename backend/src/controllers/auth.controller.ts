import type { Request, Response } from 'express';
import { envelope } from '../lib/envelope';
import {
  signup as signupSvc,
  login as loginSvc,
  portalLogin as portalLoginSvc,
  logout as logoutSvc,
  session as sessionSvc,
  forgotPassword as forgotPasswordSvc,
  resetPassword as resetPasswordSvc,
  verifyEmail as verifyEmailSvc,
  getInvitation as getInvitationSvc,
  acceptInvitation as acceptInvitationSvc,
} from '../services/auth.service';
import {
  signupSchema,
  loginSchema,
  portalLoginSchema,
  logoutSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  acceptInvitationSchema,
} from '../validators/auth';
import { ApiError } from '../lib/apiErrors';

export async function signup(req: Request, res: Response) {
  const body = signupSchema.parse(req.body ?? {});
  const data = await signupSvc(body);
  res.status(201).json(envelope.ok(data));
}

export async function login(req: Request, res: Response) {
  const body = loginSchema.parse(req.body ?? {});
  const data = await loginSvc(body);
  res.json(envelope.ok(data));
}

export async function portalLogin(req: Request, res: Response) {
  const body = portalLoginSchema.parse(req.body ?? {});
  const data = await portalLoginSvc(body);
  res.json(envelope.ok(data));
}

export async function logout(req: Request, res: Response) {
  const body = logoutSchema.parse(req.body ?? {});
  await logoutSvc(body.refresh_token);
  res.json(envelope.ok({ success: true }));
}

export async function currentSession(req: Request, res: Response) {
  const token = bearer(req);
  if (!token) throw new ApiError({ code: 'ROLE_NOT_ALLOWED', message: 'Authentication required.' } as never);
  const data = await sessionSvc(token);
  res.json(envelope.ok(data));
}

export async function forgotPassword(req: Request, res: Response) {
  const body = forgotPasswordSchema.parse(req.body ?? {});
  const data = await forgotPasswordSvc(body.email);
  res.json(envelope.ok(data));
}

export async function resetPassword(req: Request, res: Response) {
  const body = resetPasswordSchema.parse(req.body ?? {});
  const data = await resetPasswordSvc(body.token, body.new_password, body.email);
  res.json(envelope.ok(data));
}

export async function verifyEmail(req: Request, res: Response) {
  const body = verifyEmailSchema.parse(req.body ?? {});
  const data = await verifyEmailSvc(body.token, body.email);
  res.json(envelope.ok(data));
}

export async function resendVerification(req: Request, res: Response) {
  res.json(envelope.ok({ sent: true }));
}

export async function getInvitation(req: Request, res: Response) {
  const token = String(req.params.token ?? '');
  const data = await getInvitationSvc(token);
  res.json(envelope.ok(data));
}

export async function acceptInvitation(req: Request, res: Response) {
  const body = acceptInvitationSchema.parse(req.body ?? {});
  const token = String(req.params.token ?? '');
  const data = await acceptInvitationSvc(token, body);
  res.json(envelope.ok(data));
}

function bearer(req: Request): string | null {
  const h = req.headers.authorization ?? '';
  return h.startsWith('Bearer ') ? h.slice(7) : null;
}