const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const listUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');
        const users = await User.find({});
        console.log('Total Users:', users.length);
        users.forEach(u => {
            console.log(`- ${u.name} (${u.email}) [${u.role}]`);
        });
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
};

listUsers();
