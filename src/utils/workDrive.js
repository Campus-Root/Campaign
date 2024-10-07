import FormData from 'form-data';
import { fetchToken, regenerateToken, validateAccessToken } from './tokens.js';
import axios from 'axios';
export const uploadFileToWorkDrive = async ({ buffer, originalname, mimetype, folder_ID }) => {
    const formData = new FormData();
    formData.append('content', buffer, { filename: originalname, contentType: mimetype });
    formData.append('parent_id', folder_ID);
    formData.append('override-name-exist', 'true');
    let uploadData;
    try {
        const { zohoAccessToken } = await fetchToken();
        const isValidToken = await validateAccessToken(zohoAccessToken);
        const ZOHO_ACCESS_TOKEN = isValidToken ? zohoAccessToken : await regenerateToken();
        const response = await axios.post(
            'https://www.zohoapis.in/workdrive/api/v1/upload',
            formData,
            {
                headers: {
                    Authorization: `Zoho-oauthtoken ${ZOHO_ACCESS_TOKEN}`,
                    ...formData.getHeaders(),
                },
            }
        );

        const resourceId = response.data.data[0].attributes.resource_id;
        const previewResponse = await axios.get(
            `https://www.zohoapis.in/workdrive/api/v1/files/${resourceId}/previewinfo`,
            {
                headers: {
                    Authorization: `Zoho-oauthtoken ${ZOHO_ACCESS_TOKEN}`,
                },
            }
        );
        uploadData = previewResponse.data.data.attributes.preview_url;
    } catch (error) {
        console.error(error.response?.data || error.message);
        return { success: false, message: 'Error uploading file to WorkDrive', data: error.response?.data || error.message };
    }
    return { success: true, message: 'File uploaded to WorkDrive', data: uploadData };
};