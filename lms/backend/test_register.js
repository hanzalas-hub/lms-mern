const axios = require('axios');

const testRegister = async () => {
    try {
        console.log('Sending registration request...');
        const response = await axios.post('http://localhost:5000/api/auth/register', {
            name: 'Direct Test User',
            email: 'directtest@example.com',
            password: 'password123'
        });
        console.log('Response Status:', response.status);
        console.log('Response Data:', response.data);
    } catch (error) {
        if (error.response) {
            console.error('Error Status:', error.response.status);
            console.error('Error Data:', error.response.data);
        } else {
            console.error('Error Message:', error.message);
        }
    }
};

testRegister();
