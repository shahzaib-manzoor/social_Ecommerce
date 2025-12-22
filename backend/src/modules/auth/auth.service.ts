import { User } from '../users/user.model';
import { RefreshToken } from './refreshToken.model';
import { hashPassword, comparePassword } from '../../utils/password';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, getRefreshTokenExpiry } from '../../utils/jwt';
import { RegisterInput, LoginInput } from './auth.validation';

export interface AuthResponse {
  user: {
    _id: string;
    username: string;
    email: string;
    avatar?: string;
    bio?: string;
    role: 'user' | 'admin';
  };
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  async register(input: RegisterInput, role: 'user' | 'admin' = 'user'): Promise<AuthResponse> {
    const { username, email, password } = input;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      if (existingUser.email === email) {
        throw new Error('Email already in use');
      }
      if (existingUser.username === username) {
        throw new Error('Username already taken');
      }
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await User.create({
      username,
      email,
      passwordHash,
      role,
    });

    // Generate tokens
    const accessToken = generateAccessToken({ userId: user._id.toString(), role: user.role });
    const refreshToken = generateRefreshToken({ userId: user._id.toString(), role: user.role });

    // Store refresh token
    await RefreshToken.create({
      userId: user._id,
      token: refreshToken,
      expiresAt: getRefreshTokenExpiry(),
    });

    return {
      user: {
        _id: user._id.toString(),
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }

  async login(input: LoginInput): Promise<AuthResponse> {
    const { email, password } = input;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.passwordHash);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Generate tokens
    const accessToken = generateAccessToken({ userId: user._id.toString(), role: user.role });
    const refreshToken = generateRefreshToken({ userId: user._id.toString(), role: user.role });

    // Store refresh token
    await RefreshToken.create({
      userId: user._id,
      token: refreshToken,
      expiresAt: getRefreshTokenExpiry(),
    });

    return {
      user: {
        _id: user._id.toString(),
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }

  async refreshAccessToken(refreshTokenValue: string): Promise<{ accessToken: string; refreshToken: string }> {
    // Verify refresh token
    const payload = verifyRefreshToken(refreshTokenValue);

    // Check if refresh token exists in database
    const storedToken = await RefreshToken.findOne({ token: refreshTokenValue });
    if (!storedToken) {
      throw new Error('Invalid refresh token');
    }

    // Delete old refresh token
    await RefreshToken.deleteOne({ token: refreshTokenValue });

    // Generate new tokens
    const accessToken = generateAccessToken({ userId: payload.userId, role: payload.role });
    const newRefreshToken = generateRefreshToken({ userId: payload.userId, role: payload.role });

    // Store new refresh token
    await RefreshToken.create({
      userId: payload.userId,
      token: newRefreshToken,
      expiresAt: getRefreshTokenExpiry(),
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(refreshTokenValue: string): Promise<void> {
    await RefreshToken.deleteOne({ token: refreshTokenValue });
  }
}
