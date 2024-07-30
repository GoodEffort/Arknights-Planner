<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { usePlannerStore } from '../store/planner-store';
import { clientId, scope } from '../data/authInfo';

const { download, getConfigId } = usePlannerStore();

type CredentialResponse = google.accounts.id.CredentialResponse;
type TokenClient = google.accounts.oauth2.TokenClient;

const accessToken = ref<string | null>(localStorage.getItem('accessToken'));
const googleLoginBtn = ref<HTMLElement | null>(null);

let tokenClient: TokenClient | undefined;

const getTokenClient = () =>
    google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: scope,
        callback: (response) => {
            accessToken.value = response.access_token;
            localStorage.setItem('accessToken', response.access_token);
        }
    });

const gisLoaded = (response: CredentialResponse) => {
    console.log("gisLoaded:", response);
    tokenClient = getTokenClient();
    console.log("tokenClient", tokenClient);
    auth();
};

const auth = () => {
    console.log("auth");
    if (!tokenClient) {
        tokenClient = getTokenClient();
    }
    tokenClient.requestAccessToken();
}

const init = () => {
    google.accounts.id.initialize({
        use_fedcm_for_prompt: true,
        client_id: clientId,
        callback: gisLoaded,
        auto_select: true
    });

    renderButton();
    if (accessToken.value) {
        getConfigId().then(val => {
            if (val === 401) {
                auth();
            }
            else if (val !== undefined) {
                download();
            }
        });
    }
}

const renderButton = () => {
    if (!googleLoginBtn.value) {
        throw new Error("googleLoginBtn is not set");
    }

    google.accounts.id.renderButton(
        googleLoginBtn.value, {
        text: 'signin_with', // or 'signup_with' | 'continue_with' | 'signin'
        size: 'large', // or 'small' | 'medium'
        width: 200, // max width 400
        theme: 'filled_black', // or 'filled_black' |  'filled_blue'
        logo_alignment: 'left', // or 'center'
        type: 'standard', // or 'standard' | 'icon' | 'icon_outline'
    });
    if (!accessToken.value) {
        google.accounts.id.prompt();
    }
}

watch(accessToken, (oldval, newval) => {
    if (oldval === null && newval !== null) {
        download();
    }
});

onMounted(() => {
    init();
});
</script>


<template>
    <div ref="googleLoginBtn" style="color-scheme: light;" data-use_fedcm_for_prompt="true" />
</template>