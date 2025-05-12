import { Amplify } from 'aws-amplify';
import { Storage } from '@aws-amplify/storage'; // ✅ FIXED import path
import awsExports from './aws-exports.js';
import { fetchProfiles } from './api.js';


Amplify.configure(awsExports);

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

export { Storage };


/*
import {
  uploadData
  //getUrl,
} from 'https://cdn.jsdelivr.net/npm/@aws-amplify/storage@6.8.4/+esm';


export {
  uploadData,
  //getUrl
};
*/

console.log('Amplify Storage config:', Amplify.getConfig());
