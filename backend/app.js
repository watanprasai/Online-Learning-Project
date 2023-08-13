const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 8080;
app.use(cors());
app.use(express.json());

const url = 'mongodb://localhost:27017/online_learning';
mongoose.connect(url, {useNewUrlParser: true , useUnifiedTopology: true})
.then(() => { console.log('Connected to MongoDB'); })
.catch((error) => { console.error('Cannot connect to MongoDB',error); });

const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    courseEnrolled: [{type: mongoose.Schema.Types.ObjectId, ref: 'Course'}],
    createdAt: {type:Date , default: Date.now},
    updatedAt: {type:Date , default:Date.now},
});
const User = mongoose.model('User', userSchema);

const courseSchema = new mongoose.Schema({
    title: String,
    description: String,
    instructor: String,
    lessons: [{type: mongoose.Schema.Types.ObjectId, ref: "Lesson"}],
    enrolledStudents: [{type: mongoose.Schema.Types.ObjectId, ref: "User"}],
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

app.post('/users', async (req,res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).json(user);
    }catch (error){
        res.status(400).json({error: 'Cannot create user'});
    }
});

app.get('/users', async (req,res) => {
    try {
        const users = await User.find();
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


app.listen(PORT, () => { 
    console.log(`Server is running on port ${PORT}`); 
});
