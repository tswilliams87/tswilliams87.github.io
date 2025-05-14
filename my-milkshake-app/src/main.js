import { Amplify, Auth } from 'aws-amplify';
import { Storage } from '@aws-amplify/storage';
import awsExports from './aws-exports.js';

Amplify.configure({
  ...awsExports,
  Storage: {
    AWSS3: {
      bucket: 'milkshakeproddevs3071b7-dev',
      region: 'us-east-1',
      level: 'public',
    }
  }
});

export async function createProfileWithImage(form, id, email) {
  const name = form.name.value;
  const favoriteThing = form.favoriteThing.value;
  const file = form.picture.files[0];

  if (!file) {
    throw new Error("No picture file uploaded.");
  }

  const filename = `${Date.now()}_${file.name}`;

  try {
    await Storage.put(`profiles/${filename}`, file, {
      level: 'public',
      contentType: file.type
    });
    console.log("S3 upload successful:", filename);
  } catch (uploadError) {
    console.error("S3 upload failed:", uploadError);
    throw new Error("Failed to upload image to S3.");
  }

  const payload = {
    id, // Cognito sub
    email,
    name,
    favoriteThing,
    filename
  };

  const response = await fetch('https://kuiu45fc06.execute-api.us-east-1.amazonaws.com/profiles', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error("Failed to save profile in database.");
  }
}

export { Storage };
