import { ExportData } from "@/store/store-operator-functions";

type CredentialResponse = google.accounts.id.CredentialResponse;
type TokenResponse = google.accounts.oauth2.TokenResponse;
type IdConfiguration = google.accounts.id.IdConfiguration;



class DriveClient {
    public credentials: CredentialResponse | null;
    public clientId: string;
    public scope: string;
    public fileId: string | undefined;
    public initializationPromise: Promise<CredentialResponse | void>;
    public data: ExportData | null = null;

    constructor() {
        this.clientId = import.meta.env.VITE_CLIENT_ID;
        this.scope = import.meta.env.VITE_SCOPE;
        console.log(import.meta.env.VITE_CLIENT_ID);
        this.credentials = null;

        this.initializationPromise = this.initialize();

        this.initializationPromise.then((r) => {
            if (r) {
                this.credentials = r;
                localStorage.setItem('drive-credentials', r.credential);
            }
        });
    }

    private initialize = () => {
        const client_id = this.clientId;

        return new Promise<CredentialResponse | void>((resolve) => {
            const login_hint = 'lukehsurvey@gmail.com'; //localStorage.getItem('drive-credentials');
            const config: IdConfiguration = {
                use_fedcm_for_prompt: true,
                client_id,
                callback: r => resolve(r),
                auto_select: true,
                cancel_on_tap_outside: false,
            };

            if (login_hint) {
                config.login_hint = login_hint;
            }

            google.accounts.id.initialize(config);
            google.accounts.id.prompt(notification => {
                if (notification.isNotDisplayed() || notification.isSkippedMoment() || notification.isDismissedMoment() && notification.getDismissedReason() != 'credential_returned') {
                    resolve();
                }
            });
        })
    };

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
        const tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: this.clientId,
            scope: this.scope,
            callback,
            prompt: ''
        });

        tokenClient.requestAccessToken();
    })

    private getAccessToken = async () => {
        let accessToken = localStorage.getItem('accessToken');
        accessToken = accessToken === 'undefined' || accessToken === 'null' || accessToken === '' ? null : accessToken;

        let expirationTime = +(localStorage.getItem('accessToken_expiration_time') ?? 0);
        expirationTime = isNaN(expirationTime) ? 0 : expirationTime;

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

    private uploadFile = async (data: ExportData) => {
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

    public downloadFile = async () => {
        console.log("download");
        const fileId = await this.getFileId();

        const headers = {
            Authorization: `Bearer ${await this.getAccessToken()}`
        };

        const downloadResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
            headers
        });

        console.log(downloadResponse);
        const configData: ExportData = await downloadResponse.json();
        console.log(configData);

        this.data = configData;

        return configData;
    }

    public updateFile = async (data: ExportData) => {
        if (JSON.stringify(data) === JSON.stringify(this.data)) {
            return this.fileId;
        }

        const fileId = await this.getFileId();

        if (!fileId) {
            return this.uploadFile(data);
        }
        else {
            const headers = await this.getHeaders();

            const fileMetadata = {
                name: 'config.json',
                mimeType: 'application/json',
            };

            const file = new Blob([JSON.stringify(data)], { type: 'application/json' });

            const form = new FormData();
            form.append('metadata', new Blob([JSON.stringify(fileMetadata)], { type: 'application/json' }));
            form.append('file', file);

            const updateResponse = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`, {
                method: 'PATCH',
                headers,
                body: form,
            });

            console.log(updateResponse);

            if (updateResponse.ok) {
                this.data = data;
                return fileId;
            }
        }
    }

    public signOut = () => {
        google.accounts.id.disableAutoSelect();
        google.accounts.id.prompt(notification => {
            if (notification.isNotDisplayed() || notification.isSkippedMoment() || notification.isDismissedMoment() && notification.getDismissedReason() != 'credential_returned') {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('accessToken_expiration_time');
                localStorage.removeItem('drive-credentials');
                this.credentials = null;
                this.fileId = undefined;
                this.data = null;
            }
        });
    }
}

export default DriveClient;
export type { DriveClient };