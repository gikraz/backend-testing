module.exports = function (...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      req.user = {
        _id: "68e7dfbc62465d8d29276146",          
        name: "test businessOwner",
        role: "businessOwner" //  "manager"  "user" 
      };
    }
//fake momxmareblebia exla eseni da roca auths gaaketebt es fakec shecvale realuri momxmareblit
 
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied. Not enough permissions." });
    }

    next();
  };
};