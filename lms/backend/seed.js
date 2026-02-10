require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Course = require('./models/Course');

const users = [
    {
        name: 'Admin User',
        email: 'admin@lms.com',
        password: 'password123',
        role: 'admin',
    },
    {
        name: 'Teacher User',
        email: 'teacher@lms.com',
        password: 'password123',
        role: 'teacher',
    },
    {
        name: 'Student User',
        email: 'student@lms.com',
        password: 'password123',
        role: 'student',
    },
];

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/lms');
        console.log('Connected to MongoDB for seeding...');

        // Clear existing data
        await User.deleteMany();
        await Course.deleteMany();
        console.log('Cleared existing users and courses.');

        // Create users
        const createdUsers = await User.create(users);
        console.log('Seed: Created 3 users (Admin, Teacher, Student)');

        const teacher = createdUsers.find(u => u.role === 'teacher');

        // Create courses
        const courses = [
            {
                title: 'Full Stack Web Development',
                category: 'Programming',
                description: 'Learn MERN stack from scratch.',
                daily_minutes: 60,
                teacher_id: teacher._id,
            },
            {
                title: 'Data Science with Python',
                category: 'Data Science',
                description: 'Master data analysis and machine learning.',
                daily_minutes: 45,
                teacher_id: teacher._id,
            },
            {
                title: 'UI/UX Design Fundamentals',
                category: 'Design',
                description: 'Create beautiful user interfaces.',
                daily_minutes: 30,
                teacher_id: teacher._id,
            },
        ];

        await Course.create(courses);
        console.log('Seed: Created 3 courses.');

        console.log('Database seeded successfully!');
        process.exit();
    } catch (error) {
        console.error(`Error during seeding: ${error.message}`);
        process.exit(1);
    }
};

seedData();
