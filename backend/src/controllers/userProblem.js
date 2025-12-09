const {getLanguageById,submitBatch,submitToken} = require("../utils/problemUtility");
const Problem = require("../modules/problemSchema")
const User=require('../modules/user');
const Submission = require("../modules/submitSchema");
const createProblem = async (req,res)=>{

    const {title,description,difficulty,tags,
        visibleTestCases,hiddenTestCases,startCode,
        refranceSolution, problemCreator
    } = req.body;


    try{
       
      for(const {language,completeCode} of refranceSolution){
         

        // source_code:
        // language_id:
        // stdin: 
        // expectedOutput:

        const languageId = getLanguageById(language);
          
        // I am creating Batch submission
        const submissions = visibleTestCases.map((testcase)=>({
            source_code:completeCode,
            language_id: languageId,
            stdin: testcase.input,
            expected_output: testcase.output
        }));
        // console.log(submissions);
        

        const submitResult = await submitBatch(submissions);
        // console.log(submitResult);

        const resultToken =  submitResult.map((value)=> value.token);
        // console.log(resultToken);
        
        // ["db54881d-bcf5-4c7b-a2e3-d33fe7e25de7","ecc52a9b-ea80-4a00-ad50-4ab6cc3bb2a1","1b35ec3b-5776-48ef-b646-d5522bdeb2cc"]
        
       const testResult = await submitToken(resultToken);
       console.log(testResult);
    

       for(const test of testResult){
        if(test.status_id!=3){
         return res.status(400).send("Error Occured");
        }
       }

      }


      // We can store it in our DB

    const userProblem =  await Problem.create({
        ...req.body,
        problemCreator: req.result._id
      });

      res.status(201).send("Problem Saved Successfully");
    }
    catch(err){
        res.status(400).send("Error: "+err);
    }
}

const updateProblem= async (req,res) =>{
  const {title,description,difficulty,tags,
        visibleTestCases,hiddenTestCases,startCode,
        refranceSolution, problemCreator
    } = req.body;

    try{
      const {id} = req.params;
      if(!id){
        return res.status(400).send("Invalid Problem ID");
      }

      const problemInfo=await Problem.findById(id);
      if(!problemInfo){
        return res.status(400).send("Problem Not Found");
      }

      for(const {language,completeCode} of refranceSolution){
         

        // source_code:
        // language_id:
        // stdin: 
        // expectedOutput:

        const languageId = getLanguageById(language);
          
        // I am creating Batch submission
        const submissions = visibleTestCases.map((testcase)=>({
            source_code:completeCode,
            language_id: languageId,
            stdin: testcase.input,
            expected_output: testcase.output
        }));


        const submitResult = await submitBatch(submissions);
        console.log(submitResult);

        const resultToken =  submitResult.map((value)=> value.token);
        console.log(resultToken);
        
        // ["db54881d-bcf5-4c7b-a2e3-d33fe7e25de7","ecc52a9b-ea80-4a00-ad50-4ab6cc3bb2a1","1b35ec3b-5776-48ef-b646-d5522bdeb2cc"]
        
       const testResult = await submitToken(resultToken);
       console.log(testResult);
      //  console.log(testResult);

       for(const test of testResult){
        if(test.status_id!=3){
         return res.status(400).send("Error Occured");
        }
       }

      }

      // now here i update.....
      const newProblem=await Problem.findByIdAndUpdate(id,{...req.body},{runValidators:true, new:true});

      res.status(200).send(newProblem);

    }catch(err){
      res.status(400).send("Error: "+err);
    }
  
}


const deleteProblem=async (req,res) =>{
  try{
     const {id} = req.params;
     if(!id){
       return res.status(400).send("Invalid Problem ID");
     }
     const problemDeleted = await Problem.findByIdAndDelete(id);

     if(!problemDeleted){
      return res.status(400).send("Problem Not Found");
     }

     res.status(200).json({ message: "Problem deleted successfully" });


  }catch(err){
    res.status(400).send("Error: "+err);
  }
}

const getProblemById=async (req,res)=>{
  try{
     const {id} = req.params;
   if(!id){
     return res.status(400).send("Invalid Problem ID");
   }

   const getProblem=await Problem.findById(id).select('_id title description difficulty tags visibleTestCases hiddenTestCases startCode refranceSolution');

   if(!getProblem){
    return res.status(400).send("Problem Not Found");
   }
   res.status(200).send(getProblem);
   
  }catch(err){
    res.status(400).send("Error: "+err);
  }
}

const getAllProblem=async (req,res)=>{
  try{
    console.log("Hellow");
    
    const allProblem=await Problem.find({}).select('_id title difficulty tags createdAt');

    if(!allProblem){
      return res.status(400).send("Problem Not Found");
    }
    res.status(200).send(allProblem);
   
  }catch(err){
    res.status(400).send("Error: "+err);
  }
}

const solvedProblemByUser= async (req,res) =>{
  try{
    const id=req.result._id;
    const user=await User.findById(id).populate({
      path:"problemSolved",
      select:"_id title difficulty tags"
    });
    res.status(200).send(user.problemSolved);
  }catch(err){
    res.status(401).send("Server error");
  }
}

const submittedProblem= async (req,res) =>{
  try{
    const userId=req.result._id;
    const problemId=req.params.pid;
    // console.log(userId,problemId);
    
    const ans=await Submission.find({userId,problemId})
    console.log(ans);
    
    if(ans.length==0){
      res.status(201).send("Submission is not avliable")
    }
    res.status(200).send(ans);
  }catch(err){
     res.status(500).send("Internal Server Error");
  }
  
}

module.exports = {createProblem,updateProblem,deleteProblem,getProblemById,getAllProblem,solvedProblemByUser,submittedProblem};


// const submissions = [
//     {
//       "language_id": 46,
//       "source_code": "echo hello from Bash",
//       stdin:23,
//       expected_output:43,
//     },
//     {
//       "language_id": 123456789,
//       "source_code": "print(\"hello from Python\")"
//     },
//     {
//       "language_id": 72,
//       "source_code": ""
//     }
//   ]