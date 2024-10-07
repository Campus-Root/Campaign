import { MongoClient, ObjectId } from "mongodb";
import axios from 'axios';

// Fetch the stored token from MongoDB
export const fetchToken = async () => {
    const dburl = process.env.MONGO_URI;
    let client;

    try {
        // Connect to MongoDB
        client = await MongoClient.connect(dburl);

        // Fetch the token document using its _id
        const tokenData = await client.db('OneWindow').collection("tokens").findOne({ _id: new ObjectId(process.env.Tokens_MONGOID) });
        return tokenData;
    } catch (error) {
        console.error("Error fetching token:", error);
    } finally {
        // Close the client connection
        if (client) await client.close();
    }
}

// Regenerate the Zoho access token using the refresh token
export const regenerateToken = async () => {
    try {
        // Fetch tokens from MongoDB
        const tokenData = await fetchToken();
        const { zohoRefreshToken, zohoClientId, zohoClientSecret } = tokenData;

        // Regenerate Zoho access token
        const { data } = await axios.post('https://accounts.zoho.in/oauth/v2/token', null, {
            params: {
                refresh_token: zohoRefreshToken,
                client_secret: zohoClientSecret,
                grant_type: "refresh_token",
                client_id: zohoClientId
            }
        });

        // Store the new access token in MongoDB
        await storeNewToken(data.access_token);

        return data.access_token;
    } catch (error) {
        console.error("Error regenerating token:", error);
        return false;
    }
}

// Store the new Zoho access token in MongoDB
export const storeNewToken = async (zohoAccessToken) => {
    const dburl = process.env.MONGO_URI;
    let client;

    try {
        // Connect to MongoDB
        client = await MongoClient.connect(dburl);

        // Update the token document with the new access token
        await client.db('OneWindow').collection("tokens").findOneAndUpdate(
            { _id: new ObjectId(process.env.Tokens_MONGOID) },
            { $set: { zohoAccessToken } }
        );
    } catch (error) {
        console.error("Error storing new token:", error);
    } finally {
        // Close the client connection
        if (client) await client.close();
    }
}

export const validateAccessToken = async (token) => {
    try {
        // Making a minimal API call to validate the token
        await axios.get('https://www.zohoapis.in/workdrive/api/v1/users/me', {
            headers: {
                Authorization: `Zoho-oauthtoken ${token}`,
            },
        });
        return true; // Token is valid
    } catch (error) {
        // console.error(error);
        return false;
    }
}
