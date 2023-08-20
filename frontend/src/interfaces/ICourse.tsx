export interface User {
    _id: string;
    username: string;
    email: string;
    password: string;
    courseEnrolled: Course[];
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface Course {
    _id: string;
    title: string;
    url: string;
    description: string;
    instructor: string;
    lessons: Lesson[];
    enrolledStudents: User[];
    type: Type;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface Lesson {
    _id: string;
    course: Course;
    title: string;
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
  