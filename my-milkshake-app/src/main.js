import { Amplify } from 'aws-amplify';
import { Storage } from '@aws-amplify/storage';
import awsExports from './aws-exports.js';
import { fetchProfiles } from './api.js';

Amplify.configure(awsExports);

// Upload image to S3 and create a profile in DynamoDB via Lambda
export async function createProfileWithImage(form) {
  const name = form.name.value;
  const favoriteThing = form.favoriteThing.value;
  const file = form.picture.files[0];

  if (!file) {
    throw new Error("No picture file uploaded.");
  }

  const filename = `${Date.now()}_${file.name}`;

  // Upload to S3 using Amplify Storage
  try {
    await Storage.put(`profiles/${filename}`, file, {
      contentType: file.type
    });
  } catch (uploadError) {
    console.error("S3 upload failed:", uploadError);
    throw new Error("Failed to upload image to S3.");
  }

  // Then call the Lambda to store the metadata in DynamoDB
  const payload = {
    id: Date.now().toString(),
    name,
    favoriteThing,
    filename, // Backend uses this to build the S3 URL
    picture: "" // Not used anymore but left for backward compatibility
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

// Load and render profiles on page load
window.onload = async () => {
  try {
    const profiles = await fetchProfiles();
    console.log('Profiles:', profiles);

    const profileList = document.getElementById('profile-list');
    if (profileList && Array.isArray(profiles)) {
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
