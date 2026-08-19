const fs = require('fs');
const path = require('path');

// Load disposable domains from JSON
let disposableDomains = [];
try {
    const dataPath = path.join(__dirname, '../data/disposable-domains.json');
    const data = fs.readFileSync(dataPath, 'utf8');
    disposableDomains = JSON.parse(data);
} catch (error) {
    console.error('Error loading disposable domains:', error);
}

/**
 * Check if an email domain is in the disposable list
 * @param {string} email - The email to check
 * @returns {boolean} - True if it's disposable, false otherwise
 */
const isDisposableEmail = (email) => {
    if (!email || typeof email !== 'string') return false;

    const domain = email.split('@')[1];
    if (!domain) return false;

    const normalizedDomain = domain.toLowerCase();

    // Check exact domain match
    if (disposableDomains.includes(normalizedDomain)) {
        return true;
    }

    // Optional: Check if the domain is a subdomain of a disposable domain
    // For now exact match is sufficient for the provided list

    return false;
};

module.exports = {
    isDisposableEmail
};
