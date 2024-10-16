import QRCode from "qrcode";
import { Buffer } from 'buffer';
import { v2 as cloudinary } from 'cloudinary';
import { fetchToken } from './tokens.js';
import { uploadFileToWorkDrive } from './workDrive.js';
export const generateQRCode = async (text) => {
    try {
        // Generate QR code as a data URL (base64 string)
        const qrCodeData = await QRCode.toDataURL(text);

        // Convert the base64 string to a buffer
        const base64Data = qrCodeData.split(';base64,').pop();
        const qrCodeBuffer = Buffer.from(base64Data, 'base64');
        const { zohoEventQRFolderId } = await fetchToken()
        // Upload the QR code buffer directly to Zoho WorkDrive
        const uploadedFileResponse = await uploadFileToWorkDrive({
            buffer: qrCodeBuffer,
            originalname: `QRCode-${text}.png`,
            mimetype: 'image/png',
            folder_ID: zohoEventQRFolderId
        });
        return uploadedFileResponse.data;
    } catch (error) {
        console.error('Failed to generate QR code:', error);
        throw error;
    }
};


export const generateCloudinaryQRCode = async (text) => {
    try {
        // Generate QR code as a data URL
        const qrCodeData = await QRCode.toDataURL(text);
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_cloud_name,
            api_key: process.env.CLOUDINARY_api_key,
            api_secret: process.env.CLOUDINARY_api_secret
        })
        // Upload the QR code to Cloudinary
        const result = await cloudinary.uploader.upload(qrCodeData, { folder: 'qr_codes', });
        return result.secure_url;
    } catch (error) {
        console.error('Failed to generate QR code:', error);
        throw error;
    }
}

// Helper function to mask email
export const maskEmail = (email) => {
    if (!email) return "";
    const [localPart, domain] = email.split("@");
    const maskedLocalPart = localPart.slice(0, 2) + "*****";
    return maskedLocalPart + "@" + domain;
  };
  
  // Helper function to mask phone number
export const maskPhone = (phone) => {
    if (!phone) return "";
    const visibleDigits = phone.slice(-4); // Show last 4 digits
    return "*****" + visibleDigits;
  };