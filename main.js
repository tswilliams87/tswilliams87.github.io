import { fetchProfiles, addProfile, updateProfile} from './api.js';

// Example: Fetch profiles on page load
window.onload = async () => {
    try {
        const profiles = await fetchProfiles();
        console.log('Profiles:', profiles);

        // Optionally, render profiles on the page
        const profileList = document.getElementById('profile-list');
        profiles.forEach(profile => {
            const listItem = document.createElement('li');
            listItem.textContent = `${profile.name} (Favorite: ${profile.favoriteThing})`;
            profileList.appendChild(listItem);
        });
    } catch (error) {
        console.error('Error loading profiles:', error);
    }
};