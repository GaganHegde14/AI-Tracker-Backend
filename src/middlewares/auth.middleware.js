import jwt from "jsonwebtoken"

const authMiddleware = (req, res , next)=>{
   try {
    console.log(`🔐 Auth middleware called for: ${req.method} ${req.originalUrl}`);
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith("Bearer ")){
        console.log(`🔐 Auth failed: Missing or invalid auth header`);
        return res.status(401).json({message : "Unauthorized"})
    }

    const token = authHeader.split(" ")[1]
    console.log(`🔐 Token present, verifying...`);

    const decoded = jwt.verify(token , process.env.JWT_SECRET)
    req.user = { _id: decoded.id };
    console.log(`🔐 Auth successful for user:`, decoded.id);

    next();

   } catch (error) {
     console.log(`🔐 Auth error:`, error.message);
    res.status(401).json({message:"Unauthorized ."})
   }
}


export default authMiddleware