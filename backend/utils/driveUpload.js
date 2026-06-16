const { google } = require('googleapis');
const { Readable } = require('stream');
const path = require('path');
const fs = require('fs');

const localKeyPath = path.join(__dirname, '../service-account.json');
const renderKeyPath = '/etc/secrets/service-account.json';
const keyFilePath = fs.existsSync(localKeyPath)
  ? localKeyPath
  : (fs.existsSync(renderKeyPath) ? renderKeyPath : localKeyPath);

let auth = null;
let driveAvailable = false;

if (fs.existsSync(keyFilePath)) {
  try {
    auth = new google.auth.GoogleAuth({
      keyFile: keyFilePath,
      scopes: ['https://www.googleapis.com/auth/drive'],
    });
    driveAvailable = true;
    console.log(`Google Drive API configuration loaded successfully from ${keyFilePath}`);
  } catch (error) {
    console.error(`Error loading service account key from ${keyFilePath}:`, error.message);
  }
} else {
  console.warn(
    'WARNING: service account key file not found.\n' +
    'Profile pictures will be converted to base64 Data URLs instead of being uploaded to Google Drive.\n' +
    'To enable Google Drive uploads, place your key at backend/service-account.json or as a Render Secret File at /etc/secrets/service-account.json'
  );
}

/**
 * Uploads a file buffer to Google Drive (or returns base64 Data URL if credentials aren't set)
 * @param {Buffer} fileBuffer 
 * @param {string} fileName 
 * @param {string} mimeType 
 * @returns {Promise<string>} Publicly accessible file URL
 */
async function uploadToDrive(fileBuffer, fileName, mimeType) {
  if (!driveAvailable || !auth) {
    // Fallback to Base64 Data URL so the application works out-of-the-box
    const base64Data = fileBuffer.toString('base64');
    return `data:${mimeType};base64,${base64Data}`;
  }

  try {
    const drive = google.drive({
      version: 'v3',
      auth,
    });

    // Use environment variable or fallback to user's folder ID
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID || '1cV9VF98sLMyRviUH8ccjobh9jkzkKitK';

    const bufferStream = new Readable();
    bufferStream.push(fileBuffer);
    bufferStream.push(null);

    const response = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [folderId],
      },
      media: {
        mimeType: mimeType,
        body: bufferStream,
      },
      fields: 'id',
      supportsAllDrives: true, // Enables support for Shared Drives to bypass quota issues
    });

    const fileId = response.data.id;

    // Make the file publicly readable
    await drive.permissions.create({
      fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    // Return the direct image view link
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  } catch (err) {
    console.error('Google Drive Upload Failed, falling back to base64:', err);
    // If upload fails, fallback to base64 Data URL
    const base64Data = fileBuffer.toString('base64');
    return `data:${mimeType};base64,${base64Data}`;
  }
}

module.exports = uploadToDrive;
