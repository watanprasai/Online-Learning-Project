const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const generateRandomString = require('./controller/generate.js')

const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, '../frontend/src/files')
    },
    filename: function (req, file, callback) {
        const timestamp = new Date().getTime();
        const ext = file.originalname.split('.').pop();
        const randomNumber = generateRandomString(10);
        const newName = `${timestamp}-${randomNumber}.${ext}`;
        callback(null, newName);
    },
})
const upload = multer({ storage })

const app = express();
const PORT = 8080;

app.use(cors());
app.use(express.json());

const url = 'mongodb://localhost:27017/online_learning';
mongoose.connect(url, {useNewUrlParser: true , useUnifiedTopology: true})
.then(() => { console.log('Connected to MongoDB'); })
.catch((error) => { console.error('Cannot connect to MongoDB',error); });

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'o.learing.with.me@gmail.com',
        pass: 'plibzccwuzuwbheg'
    }
});

function return_html(otpNumber){
    const html_template = `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Confirmation</title>
        <style>
            body {
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
            }
            .confirmation-box {
                padding: 20px;
                border-radius: 4px;
                text-align: center;
            }
        </style>
    </head>
    <body>
        <div class="confirmation-box">
            <h1>Email Confirmation</h1>
            <p>Thank you for signing up! Please enter the following confirmation code:</p>
            <h2 style="background-color: #f0f0f0; padding: 10px; border-radius: 4px;">${otpNumber}</h2>
            <p>If you did not sign up for our service, you can safely ignore this email.</p>
        </div>
    </body>
    </html>
    `
    return html_template;
}

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

const otpSchema = new mongoose.Schema({
    otp: {
        type: Number,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    expiredAt: {
        type: Date,
        default: function () {
            return new Date(+this.createdAt + 5 * 60 * 1000); // หมดอายุใน 5 นาที
        },
    },
});
const Otp = mongoose.model('Otp', otpSchema);

// Generate OTP
app.post('/getOTP', async (req,res) => {
    try {
        const otp = Math.floor(Math.random() * (99999 - 10000 + 1) ) + 10000;
        const email = req.body.email;
        const otpData = new Otp({
            otp: otp,
            email: email,
        });
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ error: 'Email already in use' });
        }
        await otpData.save();

        const mailOptions = {
            from: 'o.learing.with.me@gmail.com',
            to: email,
            subject: 'Email verifacation form Online Learning',
            html: return_html(otp)
        };
        
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
        });

        res.status(200).json({status:"ok"});
    }catch {
        res.status(500).json({ error: 'Cannot generate OTP' });
    }
});

app.post('/checkEmail', async(req,res) => {
    try {
        const otp = Math.floor(Math.random() * (99999 - 10000 + 1) ) + 10000;
        const email = req.body.forgetemail;
        const otpData = new Otp({
            otp: otp,
            email: email,
        });
        const existingEmail = await User.findOne({ email });
        if (!existingEmail) {
            console.log("Can not find email");
            return res.status(400).json({ error: 'Have not found your email'});
        }
        await otpData.save();

        const mailOptions = {
            from: 'o.learing.with.me@gmail.com',
            to: email,
            subject: 'Recovery your password',
            html: return_html(otp)
        };
        
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
        });

        res.status(200).json({status:"ok"});
    }catch (error) {
        res.status(500).json({ error: 'Cannot generate OTP' });
    };
});

app.post('/upload', upload.single('file'), (req, res) => {
    res.json(req.file.filename);
})

// Check OTP
app.post('/checkOTP', async (req, res) => {
    try {
        const { email, otp } = req.body;

        const otpData = await Otp.findOne({ email, otp });
        if (!otpData) {
            return res.status(400).json({ error: 'Invalid OTP' });
        }

        const currentTime = new Date();
        if (otpData.expiredAt < currentTime) {
            return res.status(400).json({ error: 'OTP has expired' });
        }

        await Otp.findByIdAndDelete(otpData._id);

        res.status(200).json({ status: 'ok' });
    } catch (error) {
        res.status(500).json({ error: 'Cannot check OTP' });
    }
});

// Reset Password
app.post('/resetPassword',async(req,res) => {
    try {
        const { email , password } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Missing email' });
        }
        if (!password) {
            return res.status(400).json({ error: 'Missing new password' });
        }

        const hashedPassword = await bcrypt.hash(password,10);

        const updatedUser = await User.findOneAndUpdate(
            { email: email},
            { password: hashedPassword},
            { new: true}
        );

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({ message: 'Password reset successful' });
        
    }catch (error) {
        res.status(500).json({ error: 'Cannot reset password' });
    }
})


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

        const token = jwt.sign({ userId: user._id , username: user.username}, 'j3eCq!2N#5ZdS9X*rF$GvHmTbQwKzE7a', { expiresIn: '1h' });
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
        const { title , description , url } = req.body
        const instructor = await User.findById(req.body.instructor);
        const type = await Type.findById(req.body.type);
        course.instructor = instructor;
        course.type = type;

        if (!instructor) {
            return res.status(404).json({ error: 'โปรดใส่ชื่อผู้สอน' });
        }

        if (!title) {
            return res.status(400).json({ error: 'โปรดใส่ชื่อคอร์ส' });
        }

        if (!description) {
            return res.status(400).json({ error: 'โปรดใส่คำอธิบายคอร์ส' });
        }

        if (!url) {
            return res.status(400).json({ error: 'โปรดใส่ URL หน้าปก' });
        }

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
        .populate('type', 'name')
        .populate('lessons', 'title content videoURL');
        res.json(courses);
    }catch (error){
        res.status(500).json({ error: 'Cannot retrieve courses' });
    }
});

app.get('/courses/:id', async (req,res) => {
    try {
        const course = await Course.findById(req.params.id)
        .populate('instructor', 'username email')
        .populate('type', 'name')
        .populate('lessons', 'title content videoURL');
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
        const { title , content , videoURL } = req.body;
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }
        lesson.course = course;

        if (!title) {
            return res.status(400).json({ error: 'โปรดใส่ชื่อเนื้้อหา' });
        }

        if (!content) {
            return res.status(400).json({ error: 'โปรดใส่เนื้อหาการสอน' });
        }

        if (!videoURL) {
            return res.status(400).json({ error: 'โปรดใส่ลิ้งวิดีโอ' });
        }

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
