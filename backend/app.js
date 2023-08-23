const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 8080;

app.use(cors());
app.use(express.json());

const url = 'mongodb://localhost:27017/online_learning';
mongoose.connect(url, {useNewUrlParser: true , useUnifiedTopology: true})
.then(() => { console.log('Connected to MongoDB'); })
.catch((error) => { console.error('Cannot connect to MongoDB',error); });

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true
    },
    password: {
        type: String,
        require: true
    },
    role: {
        type: String,
        default: "user"
    },
    courseEnrolled: [{type: mongoose.Schema.Types.ObjectId, ref: 'Course'}],
    createdAt: {type:Date , default: Date.now},
    updatedAt: {type:Date , default:Date.now},
});
const User = mongoose.model('User', userSchema);

const courseSchema = new mongoose.Schema({
    title: {type:String,require:true},
    description: String,
    instructor: {type: mongoose.Schema.Types.ObjectId, ref: "User", require: true},
    lessons: [{type: mongoose.Schema.Types.ObjectId, ref: "Lesson"}],
    enrolledStudents: [{type: mongoose.Schema.Types.ObjectId, ref: "User"}],
    type: {type: mongoose.Schema.Types.ObjectId, ref:"Type", require: true},
    url: {type: String,require:true},
    createdAt: {type:Date , default: Date.now},
    updatedAt: {type:Date , default:Date.now},
});
const Course = mongoose.model('Course', courseSchema);

const lessonSchema = new mongoose.Schema({
    course: [{type: mongoose.Schema.Types.ObjectId, ref: 'Course'}],
    title: String,
    content: String,
    videoURL: String,
    createdAt: {type:Date , default: Date.now},
    updatedAt: {type:Date , default:Date.now},
});
const Lesson = mongoose.model('Lesson', lessonSchema);

const typeSchema = new mongoose.Schema({
    name: String,
    createdAt: {type:Date , default: Date.now},
    updatedAt: {type:Date , default:Date.now},
});
const Type = mongoose.model('Type', typeSchema);

// User CRUD

app.get('/users', async (req,res) => {
    try {
        const users = await User.find();
        res.json(users);
    }catch (error){
        res.status(500).json({ error: 'Cannot retrieve users' });
    }
});

app.get('/users/:id', async (req,res) => {
    try {
        const users = await User.findById(req.params.id);
        res.json(users);
    }catch (error){
        res.status(500).json({ error: 'Cannot retrieve users' });
    }
});

app.put('/users/:id', async (req,res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true});
        res.json(updatedUser);
    }catch (error){
        res.status(400).json({ error: 'Cannot update user' });
    }
});

app.delete('/users/:id', async (req,res) =>{
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted successfully'});
    }catch (error){
        res.status(400).json({ error: 'Cannot delete user' });
    }
});

// Login and Sign Up

// Register
app.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username) {
            return res.status(400).json({ error: 'Missing username' });
        }
        if (!email) {
            return res.status(400).json({ error: 'Missing email' });
        }
        if (!password) {
            return res.status(400).json({ error: 'Missing password' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already in use' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
        });

        await newUser.save();
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ error: 'Cannot register user' });
    }
});

// Login
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        const token = jwt.sign({ userId: user._id }, 'j3eCq!2N#5ZdS9X*rF$GvHmTbQwKzE7a', { expiresIn: '1h' });
        const userID = user._id;

        res.json({ token , userID});
    } catch (error) {
        res.status(500).json({ error: 'Cannot log in' });
    }
});

// Course CRUD

app.post('/courses', async (req,res) => {
    try {
        const course = new Course(req.body);
        const instructor = await User.findById(req.body.instructor);
        const type = await Type.findById(req.body.type);
        course.instructor = instructor;
        course.type = type;
        await course.save();
        res.status(201).json(course);
    }catch (error){
        res.status(400).json({error: 'Cannot create course'});
    }
});

app.get('/courses', async (req,res) => {
    try {
        const courses = await Course.find()
        .populate('instructor', 'username email')
        .populate('type', 'name');
        res.json(courses);
    }catch (error){
        res.status(500).json({ error: 'Cannot retrieve courses' });
    }
});

app.get('/courses/:id', async (req,res) => {
    try {
        const course = await Course.findById(req.params.id)
        .populate('instructor', 'username email')
        .populate('type', 'name');
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }
        res.json(course);
    }catch (error){
        res.status(500).json({ error: 'Cannot retrieve course' });
    }
});

app.put('/courses/:id', async (req,res) => {
    try {
        const updatedCourse = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true});
        res.json(updatedCourse);
    }catch (error){
        res.status(400).json({ error: 'Cannot update course' });
    }
});

app.delete('/courses/:id', async (req,res) =>{
    try {
        await Course.findByIdAndDelete(req.params.id);
        res.json({ message: 'Course deleted successfully'});
    }catch (error){
        res.status(400).json({ error: 'Cannot delete course' });
    }
});

// Lesson CRUD

app.post('/lessons', async (req, res) => {
    try {
        const lesson = new Lesson(req.body);
        const courseId = req.body.course;
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }
        lesson.course = course;
        await lesson.save();

        await Course.findByIdAndUpdate(courseId, { $push: { lessons: lesson._id } });

        res.status(201).json(lesson);
    } catch (error) {
        res.status(400).json({ error: 'Cannot create lesson' });
    }
});


app.get('/lessons', async (req,res) => {
    try {
        const lessons = await Lesson.find();
        res.json(lessons);
    }catch (error){
        res.status(500).json({ error: 'Cannot retrieve lessons' });
    }
});

app.put('/lessons/:id', async (req,res) => {
    try {
        const updatedLesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, { new: true});
        res.json(updatedLesson);
    }catch (error){
        res.status(400).json({ error: 'Cannot update lesson' });
    }
});

app.delete('/lessons/:id', async (req,res) =>{
    try {
        await Lesson.findByIdAndDelete(req.params.id);
        res.json({ message: 'Lesson deleted successfully'});
    }catch (error){
        res.status(400).json({ error: 'Cannot delete lesson' });
    }
});

// Type CRUD
app.post('/types', async (req,res) => {
    try {
        const type = new Type(req.body);
        await type.save();
        res.status(201).json(type);
    }catch (error){
        res.status(400).json({error: 'Cannot create type'});
    }
});

app.get('/types', async (req,res) => {
    try {
        const types = await Type.find();
        res.json(types);
    }catch (error){
        res.status(500).json({ error: 'Cannot retrieve types' });
    }
});

app.listen(PORT, () => { 
    console.log(`Server is running on port ${PORT}`); 
});
