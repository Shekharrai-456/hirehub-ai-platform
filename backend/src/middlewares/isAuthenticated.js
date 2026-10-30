import jwt from "jsonwebtoken";

const isAuthenticated = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Unauthorized access", success: false });

    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.id = decoded.userId;
        req.companyId = decoded.companyId;
        return next();
    } catch (error) {
        console.error(error);
        return res.status(401).json({ message: "Unauthorized access", success: false });
    }
};

export default isAuthenticated;