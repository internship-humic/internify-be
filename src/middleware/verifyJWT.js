const jwt = require("jsonwebtoken");
const { config } = require('../helpers/infra/global_config');
const { response } = require('../helpers/utils/wrapper');
const { UnauthorizedError } = require('../helpers/error');
const { UNAUTHORIZED } = require('../helpers/http-status/status_code');

const privateKey = config.jwtPrivateKey ? config.jwtPrivateKey.replace(/\\n/g, '\n') : null;
const publicKey = config.jwtPublicKey ? config.jwtPublicKey.replace(/\\n/g, '\n') : null;

const createToken = (data) => {
  if (!privateKey) {
    throw new Error('JWT private key not configured');
  }

  const accessToken = jwt.sign(
    {
      id: data.id,
      email: data.email,
      role: data.role,
      signature: data.signature
    },
    privateKey,
    { algorithm: 'RS256', expiresIn: '1d' }
  );

  return accessToken;
};

const verifyJWT = async (req, res, next) => {
  try {
    const { authorization } = req.headers;

    if (!authorization || !authorization.startsWith('Bearer ')) {
      const err = new UnauthorizedError('Token is required and must be in Bearer format');
      return response(res, "fail", { err }, "Unauthorized", UNAUTHORIZED);
    }

    const token = authorization.split(' ')[1];

    if (!publicKey) {
      const err = new UnauthorizedError('JWT public key not configured');
      return response(res, "fail", { err }, "Server Configuration Error", UNAUTHORIZED);
    }

    jwt.verify(token, publicKey, { algorithms: ['RS256'] }, (err, decoded) => {
      if (err) {
        let unauthorizedError;
        if (err instanceof jwt.TokenExpiredError) {
          unauthorizedError = new UnauthorizedError('Token has expired', err);
        } else if (err instanceof jwt.JsonWebTokenError) {
          unauthorizedError = new UnauthorizedError('Invalid Token', err);
        } else {
          unauthorizedError = new UnauthorizedError('Token verification failed', err);
        }
        return response(res, "fail", { err: unauthorizedError }, "Unauthorized", UNAUTHORIZED);
      }

      req.id = decoded.id;
      req.role = decoded.role;
      req.signature = decoded.signature;
      req.email = decoded.email;

      next();
    });

  } catch (err) {
    const unauthorizedError = new UnauthorizedError(err.message);
    return response(res, "fail", { err: unauthorizedError }, "Unauthorized", UNAUTHORIZED);
  }
};

module.exports = { verifyJWT, createToken };
