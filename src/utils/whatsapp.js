import axios from 'axios';
import { fetchToken } from './tokens.js';
export const sendWhatsAppMessage = async (name, phoneNumber, qrCodeUrl) => {
    const { WAaccessToken, WAurl, WAFromPhoneNumber } = await fetchToken();
    const data = {
        from: WAFromPhoneNumber || "+919642004141",
        campaignName: "api-test",
        to: phoneNumber,
        type: "template",
        templateName: "viz_test",
        components: {
            header: {
                type: "image",
                "image": {
                    "link": qrCodeUrl
                }
            },
            body: {
                "params": [name]
            }
        },
    };
    try {
        const response = await axios.post(`${WAurl}`, data, {
            headers: {
                'apiKey': `${WAaccessToken}`,
                'Content-Type': 'application/json',
            }
        });
        return response.data
    } catch (error) {
        console.error(error);
        console.error('Error sending WhatsApp message:', error.response ? error.response.data : error.message);
        throw new Error(error);
    }
}

