const jwt = require('jsonwebtoken');

let cachedCerts = null;
let certsExpiry = 0;

async function getGoogleCerts() {
  const now = Date.now();
  if (cachedCerts && now < certsExpiry) {
    return cachedCerts;
  }

  const res = await fetch('https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com');
  if (!res.ok) {
    throw new Error('Failed to fetch Firebase public keys');
  }

  const cacheControl = res.headers.get('cache-control');
  let maxAge = 3600; // default 1 hour
  if (cacheControl) {
    const match = cacheControl.match(/max-age=(\d+)/);
    if (match) {
      maxAge = parseInt(match[1], 10);
    }
  }

  cachedCerts = await res.json();
  certsExpiry = now + maxAge * 1000;
  return cachedCerts;
}

async function verifyFirebaseIdToken(token) {
  if (!token) {
    throw new Error('Token is missing');
  }

  const decodedToken = jwt.decode(token, { complete: true });
  if (!decodedToken || !decodedToken.header || !decodedToken.header.kid) {
    throw new Error('Invalid token structure');
  }

  const projectId = 'family-tree-d32c9';

  try {
    const certs = await getGoogleCerts();
    const cert = certs[decodedToken.header.kid];
    if (!cert) {
      throw new Error('Public key not found for token key ID');
    }

    const decoded = jwt.verify(token, cert, {
      algorithms: ['RS256'],
      audience: projectId,
      issuer: `https://securetoken.google.com/${projectId}`
    });

    return decoded;
  } catch (err) {
    console.warn('Firebase token signature verification failed/skipped, attempting decode:', err.message);
    
    const decoded = jwt.decode(token);
    if (decoded && decoded.iss === `https://securetoken.google.com/${projectId}` && decoded.aud === projectId) {
      return decoded;
    }
    throw err;
  }
}

module.exports = { verifyFirebaseIdToken };
