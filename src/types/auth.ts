interface UserInfo {
    email: string;
    name: string;
    picture: string;
}

interface TokenData {
    access_token: string;
    user: UserInfo;
}

interface GoogleAuthResponse {
    access_token: string;
    error?: string;
    expires_in: number;
    scope: string;
    token_type: string;
}