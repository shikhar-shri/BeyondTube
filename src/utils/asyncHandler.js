export const asyncHandler = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      res.status(error.code || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  };
};

//asyncHandler(getUsersFromDB,req,res,next);
/**
 * 
 * 
 * 
 * export const asyncHandler =  async (fn,req,res,next) => {
    
    try{
        const users = await fn();
        res.json(users);

    }
     catch(error){
        next(error)
     }
     

}
 * 
 * 
*/
