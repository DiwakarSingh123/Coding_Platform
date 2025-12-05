const Submission=require('../modules/submitSchema');
const Problem=require('../modules/problemSchema');
const {getLanguageById,submitBatch,submitToken}=require('../utils/problemUtility');

// For submitting code here
const submitCode = async (req,res)=>{
    try{
        const userId=req.result._id;
        const problemId=req.params.id;
        let {code, language}=req.body;

        // if(language==='cpp'){
        //     language='c++'
        // }
        // console.log(language);
        

        if(!userId || !problemId || !code || !language){
            return res.status(400).send("Field is missing");
        }

        const problem=await Problem.findById(problemId);

        // Now before sending the submited code to Jude0 firslty we store the user code in Database after this wu update it.....
        const submittedResult=await Submission.create({
            userId,
            problemId,
            code,
            language,
            status:"pending",
            testCasesTotal:problem.hiddenTestCases.length
        })

        //finding the code langusge......
        const languageId=getLanguageById(language);

         // Now I am creating Batch submission
        const submissions = problem.hiddenTestCases.map((testcase)=>({
            source_code:code,
            language_id: languageId,
            stdin: testcase.input,
            expected_output: testcase.output
        }));

        const submitResult = await submitBatch(submissions);
        // console.log(submitResult);
        
        const resultToken =  submitResult.map((value)=> value.token);
        // console.log(resultToken);
                
        // ["db54881d-bcf5-4c7b-a2e3-d33fe7e25de7","ecc52a9b-ea80-4a00-ad50-4ab6cc3bb2a1","1b35ec3b-5776-48ef-b646-d5522bdeb2cc"]
                
        const testResult = await submitToken(resultToken);
        //  console.log(testResult);

        // updating the submittedResult.......
        let testCasesPassed=0;
        let time=0;
        let memory=0;
        let errorMessage=null;
        let status='accepted';

        for(const test of testResult){
            if(test.status_id==3){
                testCasesPassed+=1;
                time=test.time;
                memory=Math.max(memory,test.memory);
            }else{
                if(test.status_id==4){
                    status="error";
                    errorMessage=test.stderr;
                }else{
                     status="wrong";
                    errorMessage=test.stderr;
                }
            }
        }

        // Store the result in Database in Submission
        submittedResult.status=status;
        submittedResult.runtime=time;
        submittedResult.memory=memory;
        submittedResult.errorMessage=errorMessage;
        submittedResult.testCasesPassed=testCasesPassed;
        
        await submittedResult.save();

        // Now here we store the ID of solved problem in User Schema where solvedProblem is awliable....
        if(!req.result.problemSolved.includes(problemId)){
            req.result.problemSolved.push(problemId);
            await req.result.save();
        }
        
        res.status(201).send(submittedResult);

    }catch(err){
        res.status(500).send("Internal server error"+err)
    }
}

// for running code here.....
const runCode = async (req,res)=>{
    try{
        const userId=req.result._id;
        const problemId=req.params.id;
        let {code, language}=req.body;

        if(!userId || !problemId || !code || !language){
            return res.status(400).send("Field is missing");
        }

        // if(language==='cpp'){
        //     language='c++'
        // }
        // console.log(language);

        const problem=await Problem.findById(problemId);

        // Now before sending the submited code to Jude0 firslty we store the user code in Database after this wu update it.....
        const submittedResult=await Submission.create({
            userId,
            problemId,
            code,
            language,
            status:"pending",
            testCasesTotal:problem.visibleTestCases.length
        })

        //finding the code langusge......
        const languageId=getLanguageById(language);

         // Now I am creating Batch submission
        const submissions = problem.visibleTestCases.map((testcase)=>({
            source_code:code,
            language_id: languageId,
            stdin: testcase.input,
            expected_output: testcase.output
        }));

        const submitResult = await submitBatch(submissions);
        // console.log(submitResult);
        
        const resultToken =  submitResult.map((value)=> value.token);
        // console.log(resultToken);
                
        // ["db54881d-bcf5-4c7b-a2e3-d33fe7e25de7","ecc52a9b-ea80-4a00-ad50-4ab6cc3bb2a1","1b35ec3b-5776-48ef-b646-d5522bdeb2cc"]
                
        const testResult = await submitToken(resultToken);
        //  console.log(testResult);

        // updating the submittedResult.......
        let testCasesPassed=0;
        let time=0;
        let memory=0;
        let errorMessage=null;
        let status='accepted';

        for(const test of testResult){
            if(test.status_id==3){
                testCasesPassed+=1;
                time=test.time;
                memory=Math.max(memory,test.memory);
            }else{
                if(test.status_id==4){
                    status="error";
                    errorMessage=test.stderr;
                }else{
                     status="wrong";
                    errorMessage=test.stderr;
                }
            }
        }

        // Store the result in Database in Submission
        submittedResult.status=status;
        submittedResult.runtime=time;
        submittedResult.memory=memory;
        submittedResult.errorMessage=errorMessage;
        submittedResult.testCasesPassed=testCasesPassed;
        
        await submittedResult.save();

        // Now here we store the ID of solved problem in User Schema where solvedProblem is awliable....
        // if(!req.result.problemSolved.includes(problemId)){
        //     req.result.problemSolved.push(problemId);
        //     await req.result.save();
        // }
        
        res.status(201).send(submittedResult);

    }catch(err){
        res.status(500).send("Internal server error"+err)
    }
}
module.exports={submitCode,runCode};