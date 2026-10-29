import jwt from "jsonwebtoken";

const isAuthenticated = (req, res, next) => {
    try {   
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({
                message: "Unauthorized access",
                success: false
            });
        }
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        if (!decoded) {
            return res.status(401).json({
                message: "Unauthorized access",
                success: false
            });
        }
        req.id = decoded.userId;
        req.companyId = decoded.companyId;
        next();


    } catch (error) {
        console.log(error);
        return res.status(401).json({
            message: "Unauthorized access",
            success: false
        });
    }

};

export default isAuthenticated;