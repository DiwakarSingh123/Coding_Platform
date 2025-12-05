const express=require('express');
const problemRouter=express.Router();
const adminMiddleware=require('../middleware/adminMiddleware');
const userMiddleware=require('../middleware/userMiddleware');
const {createProblem,updateProblem,deleteProblem,getProblemById,getAllProblem,solvedProblemByUser}=require('../controllers/userProblem');
//this code handle by only admin....
problemRouter.post("/create",adminMiddleware,createProblem);
problemRouter.patch("/update/:id",adminMiddleware,updateProblem);
problemRouter.delete("/delete/:id",adminMiddleware,deleteProblem);


// And this can handle anyone user or admin.......
// problemRouter.get("/:id",fetchProblem);
// problemRouter.get("/:id",fetchAllProblem);
// problemRouter.get("/:id",solvedProblem);

// Public routes (user or admin)
problemRouter.get("/problemById/:id",userMiddleware, getProblemById);          // fetch specific problem
problemRouter.get("/allProblem", userMiddleware,getAllProblem);             // fetch all problems
problemRouter.get("/solved",userMiddleware, solvedProblemByUser);        // get solved status by user/problem ID

module.exports=problemRouter;