import { Context, Next } from 'hono';
import { VerifyToken } from '../Utils/Auth';

export interface AuthContext {
  UserId: string;
}

export const AuthMiddleware = async (c: Context, next: Next) => {
  try {
    const AuthHeader = c.req.header('Authorization');
    
    if (!AuthHeader || !AuthHeader.startsWith('Bearer ')) {
      return c.json({ error: 'No token provided' }, 401);
    }

    const Token = AuthHeader.substring(7);
    const Payload = VerifyToken(Token);
    
    c.set('UserId', Payload.UserId);
    
    await next();
  } catch (error) {
    return c.json({ error: 'Invalid or expired token' }, 401);
  }
};

export const GetUserId = (c: Context): string => {
  const UserId = c.get('UserId');
  if (!UserId) {
    throw new Error('User ID not found in context');
  }
  return UserId;
};
