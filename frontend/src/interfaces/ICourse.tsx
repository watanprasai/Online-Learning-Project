export interface User {
  _id: string;
  username: string;
  email: string;
  password: string;
  role: string;
  progress: Progress[];
  courseEnrolled: Course[];
  createdAt: Date;
  updatedAt: Date;
}

export interface RequestAdmin {
  _id: string;
  username: string;
  email: string;
  password: string;
  phone: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}
  
export interface Progress {
  _id: string;
  user: User;
  course: Course;
  lesson: Lesson;
  videoProgress: number;
  quizAnswer: QuizAnswer[];
  createdAt: Date;
  updatedAt: Date;
}
  
export interface QuizAnswer {
  _id: string;
  quiz: Quiz;
  answer: Option;
  isCorrect: string;
  createdAt: Date;
  updatedAt: Date;
}

  export interface Course {
  _id: string;
  title: string;
  url: string;
  description: string;
  instructor: User;
  lessons: Lesson[];
  enrolledStudents: User[];
  type: Type;
  createdAt: Date;
  updatedAt: Date;
}

export interface Quiz {
  _id: string;
  question: string;
  options: Option[];
  correctOption: Option;
  lesson: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Option {
  _id: string;
  option: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Lesson {
  _id: string;
  course: Course;
  title: string;
  scorePass: number;
  quizzes: Quiz[];
  content: string;
  videoURL: string;
  createdAt: Date;
  updatedAt: Date;
}
  
export interface Type {
  _id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}
  