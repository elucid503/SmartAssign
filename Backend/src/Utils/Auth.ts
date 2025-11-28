import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JwtSecret = process.env.JWT_SECRET || 'default-secret-key';
const JwtExpiresIn = process.env.JWT_EXPIRES_IN || '30d';

export const HashPassword = async (Password: string): Promise<string> => {
  const Salt = await bcrypt.genSalt(10);
  return bcrypt.hash(Password, Salt);
};

export const ComparePassword = async (Password: string, HashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(Password, HashedPassword);
};

export const GenerateToken = (UserId: string): string => {
  return jwt.sign({ UserId }, JwtSecret, { expiresIn: JwtExpiresIn });
};

export const VerifyToken = (Token: string): { UserId: string } => {
  try {
    return jwt.verify(Token, JwtSecret) as { UserId: string };
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};
