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
  const picture = `profiles/${filename}`;

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
    filename,
    picture
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


export async function updateUserLocationToAPI() {
  try {
    const user = await Auth.currentAuthenticatedUser();
    const userId = user?.attributes?.sub;
    console.log("User ID:", userId);
    console.log("User attributes:", user?.attributes); 

    if (!userId) {
      console.error("User ID not found");
      return;
    }

    if (!navigator.geolocation) {
      console.error("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const timestamp = new Date().toISOString();
        console.log("Geolocation position:", position);

        const response = await fetch(`https://kuiu45fc06.execute-api.us-east-1.amazonaws.com/profiles/user/${userId}/location`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            latitude,
            longitude,
            timestamp
          })
         
        });
         console.log("Location sent to API:", { latitude, longitude, timestamp });
         console.log("API response:", response);

        if (!response.ok) {
          console.error("Failed to send location:", await response.text());
        } else {
          console.log("Location sent successfully");
        }
      },
      (err) => {
        console.error("Geolocation error:", err.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  } catch (err) {
    console.error("Auth error or location fetch failed:", err);
  }
}



export { Storage };
