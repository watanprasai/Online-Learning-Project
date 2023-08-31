const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
    const token = req.headers.authorization;

    if (!token) {
        console.log("ไม่มี TOKEN!!");
        return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, 'j3eCq!2N#5ZdS9X*rF$GvHmTbQwKzE7a', (err, decodedToken) => {
        if (err) {
            console.log("Token ผิด หรือหมดอายุ");
            return res.status(401).json({ message: 'Token expired or invalid' });
        }

        req.userData = decodedToken;
        next();
    });
}

module.exports = authMiddleware;