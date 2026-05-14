const express=require('express');
const problemRouter=express.Router();
const adminMiddleware=require('../middleware/adminMiddleware');
const userMiddleware=require('../middleware/userMiddleware');
const userOrAdminMiddleware=require('../middleware/userOrAdminMiddleware');
const {createProblem,updateProblem,deleteProblem,getProblemById,getAllProblem,solvedProblemByUser,submittedProblem}=require('../controllers/userProblem');
//this code handle by only admin....
problemRouter.post("/create",adminMiddleware,createProblem);
problemRouter.patch("/update/:id",adminMiddleware,updateProblem);
problemRouter.delete("/delete/:id",adminMiddleware,deleteProblem);


// And this can handle anyone user or admin.......
// problemRouter.get("/:id",fetchProblem);
// problemRouter.get("/:id",fetchAllProblem);
// problemRouter.get("/:id",solvedProblem);

// Public routes (user or admin)
problemRouter.get("/problemById/:id",userOrAdminMiddleware, getProblemById);          // fetch specific problem
problemRouter.get("/allProblem", userOrAdminMiddleware,getAllProblem);             // fetch all problems
problemRouter.get("/solved",userOrAdminMiddleware, solvedProblemByUser);        // get solved status by user/problem ID
problemRouter.get("/submitedProblem/:pid",userOrAdminMiddleware, submittedProblem); // get submissions for a problem by user

// DEBUG route - remove after fixing
problemRouter.get("/debug/:id", userOrAdminMiddleware, async (req, res) => {
    const Problem = require('../modules/problemSchema');
    const p = await Problem.findById(req.params.id);
    if (!p) return res.status(404).json({ message: "Not found" });
    res.json({
        title: p.title,
        hiddenTestCasesCount: p.hiddenTestCases?.length,
        visibleTestCasesCount: p.visibleTestCases?.length,
        startCodeLanguages: p.startCode?.map(s => s.language),
        refranceSolutionLanguages: p.refranceSolution?.map(s => s.language),
        hiddenTestCases: p.hiddenTestCases,
        visibleTestCases: p.visibleTestCases
    });
});

module.exports=problemRouter;