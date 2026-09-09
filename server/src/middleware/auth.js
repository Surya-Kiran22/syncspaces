import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'syncspace_super_secret_jwt_key_2026';

/**
 * Express REST Middleware for JWT Verification
 */
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token has expired.' });
    }
    return res.status(403).json({ success: false, message: 'Invalid or tampered token.' });
  }
};

/**
 * Socket.io Middleware for Room Access Control & JWT Verification
 */
export const socketAuthMiddleware = (socket, next) => {
  // Extract token from handshake auth or query
  const token = socket.handshake.auth?.token || socket.handshake.query?.token;
  const requestedRoomId = socket.handshake.auth?.roomId || socket.handshake.query?.roomId;

  if (!token) {
    return next(new Error('Authentication Error: Missing JWT token'));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.user = decoded;

    // Room Binding Check: If token is restricted to a specific room, verify match
    if (decoded.allowedRoomId && requestedRoomId) {
      if (decoded.allowedRoomId.toUpperCase() !== requestedRoomId.trim().toUpperCase()) {
        return next(new Error(`Access Denied: Token invalid for room ${requestedRoomId}`));
      }
    }

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new Error('Authentication Error: Token has expired'));
    }
    return next(new Error('Authentication Error: Invalid or tampered token'));
  }
};

export { JWT_SECRET };
