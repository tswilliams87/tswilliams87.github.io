// Base API URL (replace with your API Gateway URL if different)
const API_BASE_URL = "https://kuiu45fc06.execute-api.us-east-1.amazonaws.com/";

// Function to fetch all profiles
export const fetchProfiles = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}profiles`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`Error fetching profiles: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
};

// Function to add a new profile
export const addProfile = async (profile) => {
    try {
        const response = await fetch(`${API_BASE_URL}profiles`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(profile),
        });

        if (!response.ok) {
            throw new Error(`Error adding profile: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
};

// Function to update a profile by ID
export const updateProfile = async (profileId, updatedProfile) => {
    try {
        const response = await fetch(`${API_BASE_URL}profiles/${profileId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedProfile),
        });

        if (!response.ok) {
            throw new Error(`Error updating profile: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
};