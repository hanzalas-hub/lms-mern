const Course = require('../models/Course');
const TeachingAssignment = require('../models/TeachingAssignment');

// @desc    Get all courses with teacher info
// @route   GET /api/courses
// @access  Public
exports.getAllCourses = async (req, res) => {
    try {
        const { search, category } = req.query;
        let query = {};

        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }
        if (category) {
            query.category = category;
        }

        const courses = await Course.find(query).lean();

        // Populate teacher info manually since it's in a different collection now
        const coursesWithTeachers = await Promise.all(courses.map(async (course) => {
            const assignment = await TeachingAssignment.findOne({ course_id: course._id })
                .populate('teacher_id', 'name email');
            return {
                ...course,
                teacher: assignment ? assignment.teacher_id : null,
                lecture_details: assignment ? {
                    lecture_minutes: assignment.lecture_minutes,
                    lectures_per_day: assignment.lectures_per_day
                } : null
            };
        }));

        res.json(coursesWithTeachers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
exports.getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id).lean();
        if (course) {
            const assignment = await TeachingAssignment.findOne({ course_id: course._id })
                .populate('teacher_id', 'name email');

            res.json({
                ...course,
                teacher_id: assignment ? assignment.teacher_id : null, // Keeping teacher_id key for frontend compatibility
                lecture_details: assignment ? {
                    lecture_minutes: assignment.lecture_minutes,
                    lectures_per_day: assignment.lectures_per_day
                } : null
            });
        } else {
            res.status(404).json({ message: 'Course not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a course
// @route   POST /api/courses
// @access  Private/Admin
exports.createCourse = async (req, res) => {
    try {
        // lectures_per_day, lecture_minutes are now required for TeachingAssignment
        const { title, category, description, daily_minutes, teacher_id, lecture_minutes, lectures_per_day } = req.body;

        // 1. Create Course
        const course = new Course({
            title,
            category,
            description,
            daily_minutes,
        });
        const createdCourse = await course.save();

        // 2. Create TeachingAssignment
        if (teacher_id) {
            await TeachingAssignment.create({
                teacher_id,
                course_id: createdCourse._id,
                lecture_minutes: lecture_minutes || 60,
                lectures_per_day: lectures_per_day || 1
            });
        }

        res.status(201).json(createdCourse);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a course
// @route   PUT /api/courses/:id
// @access  Private/Admin
exports.updateCourse = async (req, res) => {
    try {
        const { title, category, description, daily_minutes, teacher_id, lecture_minutes, lectures_per_day } = req.body;

        const course = await Course.findById(req.params.id);

        if (course) {
            course.title = title || course.title;
            course.category = category || course.category;
            course.description = description || course.description;
            course.daily_minutes = daily_minutes || course.daily_minutes;

            const updatedCourse = await course.save();

            // Update TeachingAssignment if teacher_id is provided
            if (teacher_id) {
                let assignment = await TeachingAssignment.findOne({ course_id: course._id });
                if (assignment) {
                    assignment.teacher_id = teacher_id;
                    if (lecture_minutes) assignment.lecture_minutes = lecture_minutes;
                    if (lectures_per_day) assignment.lectures_per_day = lectures_per_day;
                    await assignment.save();
                } else {
                    await TeachingAssignment.create({
                        teacher_id,
                        course_id: course._id,
                        lecture_minutes: lecture_minutes || 60,
                        lectures_per_day: lectures_per_day || 1
                    });
                }
            }

            res.json(updatedCourse);
        } else {
            res.status(404).json({ message: 'Course not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Private/Admin
exports.deleteCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (course) {
            await course.deleteOne();
            // Also delete associated teaching assignment
            await TeachingAssignment.deleteOne({ course_id: req.params.id });
            res.json({ message: 'Course removed' });
        } else {
            res.status(404).json({ message: 'Course not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
