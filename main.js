import { fetchProfiles } from './api.js';

// Convert File to Base64
export function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = error => reject(error);
    });
}

// Create a profile and send image to S3 via Lambda
export async function createProfileWithImage(form) {
    const name = form.name.value;
    const favoriteThing = form.favoriteThing.value;
    const file = form.picture.files[0];

    if (!file) {
        throw new Error("No picture file uploaded.");
    }

    const imageBase64 = await toBase64(file);
    const filename = `${Date.now()}_${file.name}`;

    const payload = {
        id: Date.now().toString(),
        name,
        favoriteThing,
        imageBase64,
        filename,
        picture: ""
    };

    const response = await fetch('https://kuiu45fc06.execute-api.us-east-1.amazonaws.com/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${errorText}`);
    }

    return await response.json();
}

// Optional: Load and render profiles if list is present
window.onload = async () => {
    try {
        const profiles = await fetchProfiles();
        console.log('Profiles:', profiles);

        const profileList = document.getElementById('profile-list');
        if (profileList) {
            profiles.forEach(profile => {
                const listItem = document.createElement('li');
                listItem.textContent = `${profile.name} (Favorite: ${profile.favoriteThing})`;
                profileList.appendChild(listItem);
            });
        }
    } catch (error) {
        console.error('Error loading profiles:', error);
    }
};

// main.js for amplify (clean and fixed)
import { Amplify } from 'https://cdn.jsdelivr.net/npm/aws-amplify@6.12.0/+esm';
import {
  uploadData,
  getUrl,
} from 'https://cdn.jsdelivr.net/npm/@aws-amplify/storage@6.8.4/+esm';

Amplify.configure({
  Auth: {
    region: 'us-east-1',
    identityPoolId: 'us-east-1:2f68656e-3c97-4ead-8c12-1376233ca7a0',
  },
  Storage: {
    region: 'us-east-1',
    bucket: 'milkshake-user-images',
    identityPoolId: 'us-east-1:2f68656e-3c97-4ead-8c12-1376233ca7a0',
    level: 'protected',
  },
});

export {
  uploadData,
  getUrl
};
