const API_BASE_URL = 'https://kuiu45fc06.execute-api.us-east-1.amazonaws.com/profiles';
import { Amplify } from 'aws-amplify';
import awsExports from './aws-exports';
Amplify.configure({
    ...awsExports,
    Storage: {
      AWSS3: {
        bucket: 'milkshakeproddevs3071b7-dev', // ✅ Force correct bucket
        region: 'us-east-1',
        level: 'public', // Or 'protected' if you're using identity-based access
      }
    }
  });


//Amplify.configure(awsconfig);
// Fetch the latest profile ID from the backend
export async function getLastProfileId() {
    try {
        const response = await fetch(`${API_BASE_URL}/latest-id`, {
            method: 'GET',
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch the latest profile ID. Status: ${response.status}`);
        }

        const data = await response.json();
        const latestItem = data.data[0];
        const lastId = latestItem?.id?.S;

        if (!lastId) {
            throw new Error("No ID found in the latest profile.");
        }

        return lastId; // Return as string
    } catch (error) {
        console.error('Error fetching the latest profile ID:', error);
        throw error;
    }
}

// Add a new profile
export async function addProfile(profile) {
    try {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(profile),
        });

        if (!response.ok) {
            const errorMessage = `Failed to save profile. Status: ${response.status}`;
            console.error(errorMessage);
            throw new Error(errorMessage);
        }

        return await response.json();
    } catch (error) {
        console.error('Error adding profile:', error);
        throw error;
    }
}

// Fetch all profiles (for potential use in other pages)
export async function getAllProfiles() {
    try {
        const response = await fetch(API_BASE_URL, {
            method: 'GET',
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch profiles. Status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching profiles:', error);
        throw error;
    }
}

export async function fetchProfiles() {
    try {
        const response = await fetch(API_BASE_URL, {
            method: 'GET',
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const profiles = await response.json();
        return profiles;
    } catch (error) {
        console.error('Error fetching profiles:', error);
        throw error;
    }
}
export async function fetchOneProfile() {
    try {
        // might need something like this  as a variable to build the uri fetch(`https://kuiu45fc06.execute-api.us-east-1.amazonaws.com/profiles/user/${encodeURIComponent(userId)}`
        const response = await fetch(`${API_BASE_URL}/user/`,{
            method: 'GET',
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const profile = await response.json();
        return profile;
    } catch (error) {
        console.error('Error fetching profiles:', error);
        throw error;
    }
}