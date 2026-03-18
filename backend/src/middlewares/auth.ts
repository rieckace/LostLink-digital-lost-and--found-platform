import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';

interface JwtPayload {
  userId: string;
  role?: 'user' | 'admin';
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const secret = process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_production';
    const decoded = jwt.verify(token, secret) as JwtPayload;

    // Enforce bans and keep role in sync with DB
    UserModel.findById(decoded.userId)
      .select('_id role isBanned')
      .lean()
      .exec()
      .then((u) => {
        if (!u) {
          return res.status(401).json({ error: 'Unauthorized: User not found' });
        }
        if ((u as any).isBanned) {
          return res.status(403).json({ error: 'Your account has been banned.' });
        }

        req.user = { userId: decoded.userId, role: (u as any).role ?? decoded.role };
        next();
      })
      .catch(() => res.status(401).json({ error: 'Unauthorized: Invalid token' }));
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

// Like requireAuth, but does not require a token.
// - If no Bearer token is present: continues without setting req.user.
// - If token is present and valid: sets req.user.
// - If token is present but invalid: responds 401.
export const maybeAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const secret = process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_production';
    const decoded = jwt.verify(token, secret) as JwtPayload;

    UserModel.findById(decoded.userId)
      .select('_id role isBanned')
      .lean()
      .exec()
      .then((u) => {
        if (!u) {
          return res.status(401).json({ error: 'Unauthorized: User not found' });
        }
        if ((u as any).isBanned) {
          return res.status(403).json({ error: 'Your account has been banned.' });
        }

        req.user = { userId: decoded.userId, role: (u as any).role ?? decoded.role };
        next();
      })
      .catch(() => res.status(401).json({ error: 'Unauthorized: Invalid token' }));
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};
