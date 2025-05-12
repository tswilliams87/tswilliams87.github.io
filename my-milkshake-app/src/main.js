import { Amplify } from 'aws-amplify';
import awsExports from './aws-exports.js';
import { fetchProfiles } from './api.js';

// Configure Amplify (Auth still used if applicable)
Amplify.configure({
  ...awsExports
});

// Upload image via Lambda only — no Amplify Storage.put
export async function createProfileWithImage(form) {
  const name = form.name.value;
  const favoriteThing = form.favoriteThing.value;
  const file = form.picture.files[0];

  if (!file) {
    throw new Error("No picture file uploaded.");
  }

  const filename = `${Date.now()}_${file.name}`;

  const payload = {
    id: Date.now().toString(),
    name,
    favoriteThing,
    filename,
    picture: "" // unused in Lambda, left for compatibility
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

// Load and render profiles if element exists
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
