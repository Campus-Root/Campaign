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
            cloud_name: 'decw3lpd2', // Replace with your Cloudinary cloud name
            api_key: '874754171659833',       // Replace with your Cloudinary API key
            api_secret: 'kr8lLaCbXzNQbtv2Ims3vpFS4uQ', // Replace with your Cloudinary API secret
        });
        // Upload the QR code to Cloudinary
        const result = await cloudinary.uploader.upload(qrCodeData, { folder: 'qr_codes', });

        return result.secure_url;
    } catch (error) {
        console.error('Failed to generate QR code:', error);
        throw error;
    }
}