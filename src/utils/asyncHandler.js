export const asyncHandler = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      // console.log("error caught by asyncHandler");
      next(error);
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
