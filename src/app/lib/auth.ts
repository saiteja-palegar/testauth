export async function validateToken(token: string): Promise<boolean> {
    try {
        const response = await fetch('https://www.googleapis.com/oauth2/v3/tokeninfo', {
            method: 'POST',
            body: JSON.stringify({ access_token: token }),
        });
        return response.ok;
    } catch (error) {
        console.error('Error validating token:', error);
        return false;
    }
}