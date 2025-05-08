const API_BASE_URL = 'https://kuiu45fc06.execute-api.us-east-1.amazonaws.com/profiles';

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
        console.log(data.lastId + ' ' + typeof(data.lastId));
        if (data.lastId === null || data.lastId === undefined) {
            throw new Error('null or undefined returned from JSON response from /lates-id call data in response: ' + json.stringify(data));
            
        }
        return data.lastId; // Convert the latest ID to an integer
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