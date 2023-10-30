const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const generateRandomString = require('./controller/generate.js');
const authMiddleware = require('./controller/middleware.js');

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

function return_html_confirm_email(isAccepted) {
    const subject = isAccepted ? "ยืนยันการเป็นแอดมิน" : "คำขอของคุณถูกปฎิเสธ";
    const confirmationText = isAccepted
        ? "คำขอของคุณได้รับการยอมรับและคุณได้รับสิทธิ์ในระบบ Online-Learning-with-me แล้ว"
        : "ขออภัย คำขอของคุณถูกปฏิเสธจากระบบ Online-Learning-with-me";

    const html_template = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>${subject}</title>
        </head>
        <body>
            <h1>${subject}</h1>
            <p>${confirmationText}</p>
        </body>
        </html>
    `;

    return html_template;
}

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
    phone: String,
    progress: [{type: mongoose.Schema.Types.ObjectId, ref: 'Progress'}],
    courseEnrolled: [{type: mongoose.Schema.Types.ObjectId, ref: 'Course'}],
    createdAt: {type:Date , default: Date.now},
    updatedAt: {type:Date , default:Date.now},
});
const User = mongoose.model('User', userSchema);

const requestAdminSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    phone: String,
    role: String,
    createdAt: {type:Date , default: Date.now},
    updatedAt: {type:Date , default:Date.now},
});
const RequestAdmin = mongoose.model('RequestAdmin', requestAdminSchema);

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
    quizzes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' }],
    scorePass: String,
    videoURL: String,
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now},
});
const Lesson = mongoose.model('Lesson', lessonSchema);

const quizSchema = new mongoose.Schema({
    question: { type: String, required: true },
    options: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Option'}],
    correctOption: { type: mongoose.Schema.Types.ObjectId, ref: 'Option'},
    lesson : { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});
const Quiz = mongoose.model('Quiz', quizSchema);

const optionSchema = new mongoose.Schema({
    option: { type: String, required: true },
    createdAt: { type: Date, default: Date.now},
    updatedAt: { type: Date, default: Date.now }
});
const Option = mongoose.model('Option', optionSchema);

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
            return new Date(+this.createdAt + 5 * 60 * 1000);
        },
    },
});
const Otp = mongoose.model('Otp', otpSchema);

const progressSchema = new mongoose.Schema({
    user : { type:mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
    videoProgress : Number,
    quizAnswer: [{ type:mongoose.Schema.Types.ObjectId, ref: 'QuizAnswer'}],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});
const Progress = mongoose.model('Progress', progressSchema);

const quizAnswerSchema = new mongoose.Schema({
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    answer: { type: mongoose.Schema.Types.ObjectId, ref: 'Option', required: true },
    isCorrect: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});
const QuizAnswer = mongoose.model('QuizAnswer', quizAnswerSchema);

// Quiz
app.post('/lessons/:lessonId/quizzes', authMiddleware, async (req, res) => {
    try {
        const { question, options, correctOption } = req.body;
        const lessonId = req.params.lessonId;

        const newQuiz = new Quiz({
            question,
            options,
            correctOption,
            lesson: lessonId,
        });
        await newQuiz.save();

        await Lesson.findByIdAndUpdate(lessonId, { $push: { quizzes: newQuiz._id }});

        res.status(201).json(newQuiz);
    } catch (error) {
        res.status(500).json({ error: 'Cannot create quiz in lesson' });
    }
});

// create Quiz but no option
app.post('/createQuiz', authMiddleware, async (req, res) => {
    try {
        const { question , lessonId } = req.body;

        const newQuiz = new Quiz({
            question,
            lesson: lessonId,
        });
        await newQuiz.save();
        await Lesson.findByIdAndUpdate(lessonId, { $push: { quizzes: newQuiz._id }});
        res.status(201).json(newQuiz);
    } catch (error) {
        res.status(500).json({ error: 'Cannot create quiz' });
    }
});

// Option
app.post('/options', authMiddleware, async (req, res) => {
    try {
        const option = req.body.option;

        const newOption = new Option({
            option,
        });

        await newOption.save();
        
        res.status(201).json({ _id: newOption._id });
    } catch (error) {
        res.status(500).json({ error: 'Cannot create option' });
    }
});

// Option and add option to quizId
app.post('/options-with-quizId', authMiddleware, async (req, res) => {
    try {
        const { option , quizId }= req.body;

        const newOption = new Option({
            option,
        });

        await newOption.save();
        await Quiz.findByIdAndUpdate(quizId, { $push: { options: newOption._id }});
        res.status(201).json({ _id: newOption._id });
    } catch (error) {
        res.status(500).json({ error: 'Cannot create option' });
        console.log(error);
    }
});

// add Correct option to quiz
app.post('/options-add-correct-quizId', authMiddleware, async (req, res) => {
    try {
        const { correctOptionId , quizId }= req.body;
        await Quiz.findByIdAndUpdate(quizId, { $push: { correctOption: correctOptionId }});
        res.status(201).json({ messaage: "ok"});
    } catch (error) {
        res.status(500).json({ error: 'Cannot add corect option' });
        console.log(error);
    }
});

// Update Option with the same option
app.put('/option/:id',authMiddleware,async (req,res) => {
    try {
        const optionId = req.params.id;
        const {option} = req.body;
        const updateOption = await Option.findByIdAndUpdate(optionId, {
            option,
        });
        if (!updateOption) {
            return res.status(404).json({ error: 'Option not found' });
        }
        res.status(200).json("update Option Succesfully");
    } catch (error) {
        res.status(500).json({ error: 'Cannot update option' });
    }
});

// Delete Option
app.put('/option/remove/:optionId',authMiddleware,async (req,res) => {
    try {
        const optionId = req.params.optionId;
        await Option.findByIdAndDelete(optionId);
        await Quiz.findOneAndUpdate({ $pull: { options: optionId }});
        res.json({ message: 'Option deleted successfully'});
    } catch (error) {
        res.status(400).json({ error: 'Cannot delete option' });
    }
})

// Update Option with add option
app.post('/option/add/:quizId',authMiddleware,async (req,res) => {
    try {
        const option = req.body.option;
        const quizId = req.params.quizId;
        const newOption = new Option({
            option,
        });

        await newOption.save();
        await Quiz.findByIdAndUpdate(quizId, { $push: { options: newOption._id }});
        res.status(200).json("add Option Succesfully");

    } catch (error) {
        res.status(500).json({ error: 'Cannot add option' });
    }
});

// Update Option with correct option
app.post('/option/add/correct/:quizId',authMiddleware,async (req,res) => {
    try {
        const option = req.body.option;
        const quizId = req.params.quizId;
        const newOption = new Option({
            option,
        });

        await newOption.save();
        await Quiz.findByIdAndUpdate(quizId, { $push: { options: newOption._id }});
        const updatedQuiz = await Quiz.findByIdAndUpdate(quizId, {
            correctOption: newOption._id,
        });
        if (!updatedQuiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }
        res.status(200).json({res:"add Correct Option Succesfully",_id:newOption._id});

    } catch (error) {
        res.status(500).json({ error: 'Cannot add option' });
    }
});

// Update Quiz
app.put('/quizzes/:quizId', authMiddleware, async (req, res) => {
    try {
        const quizId = req.params.quizId;
        const { question, correctOption } = req.body;
        const updatedQuiz = await Quiz.findByIdAndUpdate(quizId, {
            question,
            correctOption,
        });

        if (!updatedQuiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }

        res.status(200).json("update Quiz Successfully");
    } catch (error) {
        res.status(500).json({ error: 'Cannot update quiz' });
    }
});


app.get('/quizzes/:quizId', authMiddleware, async (req, res) => {
    try {
        const quizId = req.params.quizId;

        const quiz = await Quiz.findById(quizId)
            .populate('options', 'option');

        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }

        res.status(200).json(quiz);
    } catch (error) {
        res.status(500).json({ error: 'Cannot get quiz' });
    }
});

app.get('/quizzes-lesson/:lessonId', authMiddleware, async (req,res) => {
    try {
        const lessonId = req.params.lessonId;
        const quizzes = await Quiz.find({ lesson: lessonId })
        .populate('options', 'option');
        res.status(200).json(quizzes);
    } catch (error) {
        res.status(500).json({ error: 'Cannot get quiz' });
    }
})

// Delete Quiz
app.delete('/quizzes/:quizId', authMiddleware, async (req, res) => {
    try {
        const quizId = req.params.quizId;

        const deletedQuiz = await Quiz.findByIdAndRemove(quizId);

        if (!deletedQuiz) {
            return res.status(404).json({ error: 'ควิซที่ต้องการลบไม่พบ' });
        }

        const lessonId = deletedQuiz.lesson;
        await Lesson.findByIdAndUpdate(lessonId, { $pull: { quizzes: quizId }});

        await QuizAnswer.deleteMany({ quiz: quizId });

        res.status(200).json({ message: 'ลบควิซสำเร็จ' });
    } catch (error) {
        res.status(500).json({ error: 'ไม่สามารถลบควิซ' });
    }
});

// Check Quiz Answer
app.post('/checkQuizAnswer', authMiddleware, async (req, res) => {
    try {
        const { quizId, selectedOptionId } = req.body;
        const userId = req.userData.userId;

        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }

        if (quiz.correctOption.toString() === selectedOptionId) {
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            const quizAnswer = new QuizAnswer({
                quiz: quizId,
                answer: selectedOptionId,
                isCorrect: true,
            });
            await quizAnswer.save();

            res.status(200).json({ message: 'Correct answer', isCorrect: true , quiz_id: quizAnswer._id});
        } else {
            const quizAnswer = new QuizAnswer({
                quiz: quizId,
                answer: selectedOptionId,
                isCorrect: false,
            });
            await quizAnswer.save();
            res.status(200).json({ message: 'Incorrect answer', isCorrect: false , quiz_id: quizAnswer._id});
        }
    } catch (error) {
        res.status(500).json({ error: 'Cannot check quiz answer' });
    }
});

// Update Quiz Progress
app.post('/updateQuizProgress', authMiddleware, async (req,res) => {
    try {
        const userId = req.userData.userId;
        const { courseId , lessonId , quizId } = req.body;
        const progress = new Progress({
            user: userId,
            course: courseId,
            lesson: lessonId,
            quizAnswer: quizId,
        });
        await progress.save();

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        user.progress.push(progress);
        await user.save();

        res.status(200).json({status:"ok"});
    } catch (error) {
        res.status(500).json({ error: 'Cannot update progress' });
    }
});

// Get Progress by lessonId
app.get('/getProgress/:lessonId',authMiddleware, async (req,res) => {
    const userId = req.userData.userId;
    const lessonId = req.params.lessonId;
    const progress = await Progress.findOne({
        lesson: lessonId, 
        user: userId,
    });
    if (!progress || progress.length === 0) {
        return res.json({ error: 'progress not found' });
    }
    res.json(progress);
});

// Update Video Progress or Create if not exists
app.post('/updateOrCreateVideoProgress', authMiddleware, async (req, res) => {
    try {
        const userId = req.userData.userId;
        const { courseId, lessonId, videoProgress } = req.body;
        const user = await User.findById(userId);
        const existingProgress = await Progress.findOne({
            user: userId,
            course: courseId,
            lesson: lessonId,
        });

        if (existingProgress) {
            existingProgress.videoProgress = videoProgress;
            await existingProgress.save();
            res.status(200).json({ message: 'อัปเดตความคืบหน้าของวิดีโอสำเร็จ' });
        } else {
            const progress = new Progress({
                user: userId,
                course: courseId,
                lesson: lessonId,
                videoProgress: videoProgress
            });
            await progress.save();
            user.progress.push(progress);
            await user.save();
            res.status(201).json({ message: 'สร้างความคืบหน้าของวิดีโอสำเร็จ' });
        }
    } catch (error) {
        res.status(500).json({ error: 'ไม่สามารถอัปเดตหรือสร้างความคืบหน้าของวิดีโอ' });
    }
});

app.get('/getProgress',async (req,res) => {

        const progresses = await Progress.find()
        .populate({path: 'quizAnswer', populate: {
            path: 'answer'
        }});

        if (!progresses) {
            return res.status(404).json({ error: 'progresses not found for this quiz' });
        }

        res.json(progresses);
})

app.get('/options/:quizId', async (req, res) => {
    try {
        const quizId = req.params.quizId;

        const options = await Option.find({ quiz: quizId });

        if (!options) {
            return res.status(404).json({ error: 'Options not found for this quiz' });
        }

        res.json(options);
    } catch (error) {
        res.status(500).json({ error: 'Cannot retrieve options' });
    }
});

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
            return res.status(400).json({ error: 'อีเมลถูกใช้งานแล้ว' });
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

// Send email confirm
app.post('/confirmEmail',authMiddleware, async (req, res) => {
    try {
        const { id, isAccepted } = req.body;
        const requestData = await RequestAdmin.findById(id);
        const mailOptions = {
            from: 'o.learning.with.me@gmail.com',
            to: requestData.email,
            subject: isAccepted
                ? 'คำขอของคุณได้รับการยอมรับ'
                : 'คำขอของคุณถูกปฎิเสธ',
            html: return_html_confirm_email(isAccepted),
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                res.status(500).json({ error: 'เกิดข้อผิดพลาดในการส่งอีเมล' });
            } else {
                console.log('Email sent: ' + info.response);
                res.status(200).json({ message: 'ส่งอีเมลสำเร็จ' });
            }
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการส่งอีเมล' });
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

// Change Password
app.post('/changePassword', async (req, res) => {
    try {
      const { currentPassword, newPassword, confirmPassword, email } = req.body;
  
      if (!currentPassword || !newPassword || !confirmPassword || !email) {
        return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ถูกต้อง' });
      }
  
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ error: 'ผู้ใช้ไม่พบ' });
      }
  
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'รหัสผ่านปัจจุบันไม่ถูกต้อง' });
      }
  
      if (newPassword !== confirmPassword) {
        return res.status(400).json({ error: 'รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน' });
      }
  
      const hashedPassword = await bcrypt.hash(newPassword, 10);
  
      const updatedUser = await User.findOneAndUpdate(
        { email },
        { password: hashedPassword },
        { new: true }
      );
  
      if (!updatedUser) {
        return res.status(500).json({ error: 'ไม่สามารถเปลี่ยนรหัสผ่านได้' });
      }
  
      res.status(200).json({ message: 'เปลี่ยนรหัสผ่านสำเร็จ' });
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน:', error);
      res.status(500).json({ error: 'ไม่สามารถเปลี่ยนรหัสผ่านได้' });
    }
  });

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

app.get('/getuser', authMiddleware, async (req, res) => {
    try {
        const userId = req.userData.userId;
        const user = await User.findById(userId)
            .populate('courseEnrolled', 'title description instructor lessons type')
            .populate({
                path: 'courseEnrolled',
                populate: {
                    path: 'instructor',
                    select: 'username email'
                }
            })
            .populate('progress');
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Cannot retrieve user' });
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

// send Request Admin
app.post('/request-admin',async (req, res) => {
    try {
        const { username, email, password , phone , role} = req.body;
        if (!username) {
            return res.status(400).json({ error: 'Missing username' });
        }
        if (!email) {
            return res.status(400).json({ error: 'Missing email' });
        }
        if (!password) {
            return res.status(400).json({ error: 'Missing password' });
        }
        if (!phone) {
            return res.status(400).json({ error: 'Missing phone' });
        }
        if (!role) {
            return res.status(400).json({ error: 'Missing role' });
        }
        const existingRequest = await RequestAdmin.findOne({ email });
        if (existingRequest) {
            return res.status(400).json({ error: 'Request is already sent' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newRequest = new RequestAdmin({
            username,
            email,
            password:hashedPassword,
            phone,
            role,
        });
        await newRequest.save();
        res.status(201).json(newRequest);
    } catch (error) {
        res.status(500).json({ error: 'Cannot send request' });
    }
});

// Get register admin
app.get('/request-admin',authMiddleware,async(req,res) => {
    try {
        const requests = await RequestAdmin.find();
        res.json(requests);
    }catch (error){
        res.status(500).json({ error: 'Cannot retrieve request' });
    }
});

// Reject request admin
app.delete('/request-admin/:requestId',authMiddleware,async(req,res) => {
    try {
        const requestId = req.params.requestId;
        await RequestAdmin.findByIdAndDelete(requestId);
        res.json({ message: 'Reject request successfully'});
    }catch (error){
        res.status(500).json({ error: 'Cannot reject request' });
    }
});

// Register Admin
app.post('/register-as-admin',authMiddleware, async (req, res) => {
    try {
        const requestId = req.body.id;
        const requestAdmin = await RequestAdmin.findById(requestId);

        if (!requestAdmin) {
            return res.status(404).json({ error: 'Request not found' });
        }

        const existingUser = await User.findOne({ email:requestAdmin.email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already in use' });
        }

        const newUser = new User({
            username: requestAdmin.username,
            email: requestAdmin.email,
            password: requestAdmin.password,
            phone: requestAdmin.phone,
            role: requestAdmin.role,
        });

        await newUser.save();
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ error: 'Cannot register user' });
    }
});

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


// Test Check Token
app.get('/secure-route', authMiddleware, (req, res) => {
    const role = req.userData.role;
    res.json({ message: 'This is a secure route' , role: role});
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

        const token = jwt.sign({ userId: user._id , username: user.username , role: user.role}, 'j3eCq!2N#5ZdS9X*rF$GvHmTbQwKzE7a', { expiresIn: '3h' });
        const userID = user._id;
        const userRole = user.role;
        res.json({ token , userID , userRole});
    } catch (error) {
        res.status(500).json({ error: 'Cannot log in' });
    }
});

// Enroll in a course
app.post('/courses/:id/enroll', authMiddleware,async (req, res) => {
    try {
        const courseId = req.params.id;
        const userId = req.userData.userId;

        const course = await Course.findById(courseId);
        const user = await User.findById(userId);

        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.courseEnrolled.includes(courseId)) {
            return res.status(400).json({ error: 'User is already enrolled in this course' });
        }

        course.enrolledStudents.push(userId);
        await course.save();

        user.courseEnrolled.push(courseId);
        await user.save();

        res.status(200).json({ message: 'Enrolled in the course successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to enroll in the course' });
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
        .populate('lessons', 'title content videoURL')
        .populate('enrolledStudents', '_id username email');
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
        .populate('lessons', 'title content videoURL quizzes')
        .populate({
            path: 'lessons',
            populate: {
                path: 'quizzes',
                populate: {
                    path: 'options',
                },
            },
        })
        .populate({
            path: 'lessons',
            populate: {
                path: 'quizzes',
                populate: {
                    path: 'correctOption',
                },
            },
        })
        .populate('enrolledStudents', '_id username email');
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }
        res.json(course);
    }catch (error){
        res.status(500).json({ error: 'Cannot retrieve course' });
    }
});

// getCourse by User ID
app.get('/courseByUserId',authMiddleware, async (req,res) => {
    try {
        const userId = req.userData.userId;
        const courses = await Course.find({ instructor: userId })
        .populate('instructor', 'username email')
        .populate('type', 'name')
        .populate('lessons', 'title content videoURL quizzes')
        .populate('enrolledStudents', '_id username email');
        if (!courses) {
            return res.status(404).json({ error: 'Courses not found' });
        }
        res.json(courses);
    }catch (error){
        res.status(500).json({ error: error });
    }
})

app.put('/courses/:id', async (req,res) => {
    try {
        const updatedCourse = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true});
        res.json(updatedCourse);
    }catch (error){
        res.status(400).json({ error: 'Cannot update course' });
    }
});

app.delete('/courses/:id', async (req, res) => {
    try {
        const courseId = req.params.id;
        const progressData = await Progress.find({ course: courseId }).populate('user', 'username');
        await Lesson.deleteMany({ course: courseId });
        await Progress.deleteMany({ course: courseId });
        await Course.findByIdAndDelete(courseId);

        for (const progress of progressData) {
            if (!progress.user) {
                continue;
            }
            const user = await User.findById(progress.user._id);
            if (user) {
                user.progress.pull(progress._id);
                await user.courseEnrolled.pull(courseId);
                await user.save();
            }
        }

        res.json({ message: 'Course and related data deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: 'Cannot delete course and related data' });
    }
});



// Lesson CRUD

app.post('/lessons-quiz', authMiddleware, async(req,res) => {
    const lesson = new Lesson(req.body)
    const courseId = req.body.course;
    const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }
    lesson.course = course;
    await lesson.save();
    
    await Course.findByIdAndUpdate(courseId, { $push: { lessons: lesson._id } });
    res.status(201).json({_id : lesson._id});
})

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

app.delete('/lessons/:id/:courseId', async (req,res) =>{
    try {
        const lessonId = req.params.id;
        const courseId = req.params.courseId;
        await Course.findByIdAndUpdate(courseId, { $pull: { lessons: lessonId }});
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

app.delete('/types/:typeId', async (req, res) => {
    try {
      const typeId = req.params.typeId;
      await Type.findByIdAndDelete(typeId);
      res.json({ message: 'Type deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete type' });
    }
});

app.listen(PORT, () => { 
    console.log(`Server is running on port ${PORT}`); 
});
