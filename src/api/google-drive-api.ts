import { SaveRecord } from "../types/planner-types";

type CredentialResponse = google.accounts.id.CredentialResponse;
type TokenResponse = google.accounts.oauth2.TokenResponse;

type DriveJSON = {
    s: string[];
    i: {
        [k: string]: number;
    };
    p: SaveRecord[];
};

class DriveClient {
    public credentials: CredentialResponse | null;
    public clientId: string;
    public scope: string;
    public fileId: string | undefined;

    constructor(clientId: string, scope: string) {
        this.clientId = clientId;
        this.scope = scope;
        this.credentials = null;

        this.initialize().then((r) => {
            this.credentials = r;
        });
    }

    public initialize = () =>
        new Promise<CredentialResponse>((resolve) => {
            google.accounts.id.prompt();
            google.accounts.id.initialize({
                use_fedcm_for_prompt: true,
                client_id: this.clientId,
                callback: r => resolve(r),
                auto_select: true
            });
        });

    public renderButton = (googleLoginBtn: HTMLElement) => {
        google.accounts.id.renderButton(
            googleLoginBtn, {
            text: 'signin_with', // or 'signup_with' | 'continue_with' | 'signin'
            size: 'large', // or 'small' | 'medium'
            width: 200, // max width 400
            theme: 'filled_black', // or 'filled_black' |  'filled_blue'
            logo_alignment: 'left', // or 'center'
            type: 'standard', // or 'standard' | 'icon' | 'icon_outline'
        });
    }

    private getAccessTokenFromClient = () => new Promise<{ accessToken: string; expirationTime: number }>((resolve) => {
        const callback: (tokenResponse: TokenResponse) => void =
            ({ expires_in, access_token }) => {
                resolve({
                    accessToken: access_token,
                    expirationTime: Date.now() + (+expires_in * 1000)
                });
            };

        google.accounts.oauth2.initTokenClient({
            client_id: this.clientId,
            scope: this.scope,
            callback
        });
    })

    private getAccessToken = async () => {
        let accessToken = localStorage.getItem('accessToken');
        let expirationTime = +(localStorage.getItem('accessToken_expiration_time') ?? 0)

        if (!accessToken || expirationTime < Date.now()) {
            const { accessToken: newAccessToken, expirationTime: newExpirationTime } = await this.getAccessTokenFromClient();
            accessToken = newAccessToken;
            expirationTime = newExpirationTime;

            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('accessToken_expiration_time', expirationTime.toString());
        }

        return accessToken;
    }

    private getHeaders = async () => ({
        Authorization: `Bearer ${await this.getAccessToken()}`
    });

    private getFileId = async () => {
        if (this.fileId) {
            return this.fileId;
        }

        const queryParams = new URLSearchParams({
            spaces: 'appDataFolder',
            fields: 'files(id, name)'
        });

        const headers = await this.getHeaders();

        const searchResponse = await fetch(`https://www.googleapis.com/drive/v3/files?${queryParams}`, { headers });

        if (searchResponse.status === 401) {
            throw new Error('Unauthorized');
        }

        const searchJson: { files: { id: string; name: string }[] } = await searchResponse.json();

        this.fileId = searchJson.files.find((file) => file.name === 'config.json')?.id || undefined;
        return this.fileId;
    }

    public upload = async (data: DriveJSON) => {
        const fileMetadata = {
            name: 'config.json',
            mimeType: 'application/json',
            parents: ['appDataFolder'],
        };

        const file = new Blob([JSON.stringify(data)], { type: 'application/json' });

        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(fileMetadata)], { type: 'application/json' }));
        form.append('file', file);

        const uploadResponse = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${await this.getAccessToken()}`,
            },
            body: form,
        });

        console.log(uploadResponse);

        if (uploadResponse.ok) {
            this.fileId = (await uploadResponse.json()).id;
            return this.fileId;
        }
    }

    public download = async () => {
        console.log("download");
        const fileId = await this.getFileId();

        const headers = {
            Authorization: `Bearer ${await this.getAccessToken()}`
        };

        const downloadResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
            headers
        });

        console.log(downloadResponse);
        const configData: DriveJSON = await downloadResponse.json();
        console.log(configData);

        return configData;
    }

    public watchFile = async () => {
        const fileId = await this.getFileId();

        const headers = await this.getHeaders();

        const watchResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?supportsAllDrives=true`, {
            headers
        });

        console.log(watchResponse);
    }

    public updateFile = async (data: DriveJSON) => {
        const fileId = await this.getFileId();

        const headers = await this.getHeaders();

        const updateResponse = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify(data)
        });

        console.log(updateResponse);
    }
}

export default DriveClient;