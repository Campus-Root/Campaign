import axios from 'axios';
import { fetchToken } from './tokens.js';
export const sendWhatsAppMessage = async (name, phoneNumber, qrCodeUrl) => {
    const { WAaccessToken, WAurl, WAFromPhoneNumber } = await fetchToken();
    const data = {
        from: WAFromPhoneNumber || "+919642004141",
        campaignName: "api-test",
        to: phoneNumber,
        type: "template",
        templateName: "mbnr_new_viz",
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
        return { error: true, message: error.message }
    }
}

