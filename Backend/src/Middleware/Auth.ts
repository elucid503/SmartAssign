import { Context, Next } from 'hono';

import { VerifyToken } from '../Utils/Auth';

export interface AuthContext {

  UserID: string;

}

export const AuthMiddleware = async (c: Context, next: Next) => {

  const AuthHeader = c.req.header('Authorization');

  if (!AuthHeader || !AuthHeader.startsWith('Bearer ')) {

    return c.json({ error: 'No token provided' }, 401);

  }

  const Token = AuthHeader.substring(7);
  
  return await VerifyToken(Token).then(async (Payload) => {

    c.set('UserID', Payload.UserID);
    await next();
    
  }).catch(() => {

    return c.json({ error: 'Invalid or expired token' }, 401);
    
  });
  
};

export const GetUserID = (c: Context): string => {

  const UserID = c.get('UserID');

  if (!UserID) {

    throw new Error('User ID not found in context');

  }

  return UserID;

};