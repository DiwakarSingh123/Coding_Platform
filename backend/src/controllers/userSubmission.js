const Submission = require('../modules/submitSchema');
const Problem = require('../modules/problemSchema');
const { getLanguageById, submitBatch, submitToken } = require('../utils/problemUtility');

const submitCode = async (req, res) => {
    try {
        const userId = req.result._id;
        const problemId = req.params.id;
        let { code, language } = req.body;

        if (!userId || !problemId || !code || !language) {
            return res.status(400).json({ message: "Field is missing" });
        }

        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({ message: "Problem not found" });
        }

        if (!problem.hiddenTestCases || problem.hiddenTestCases.length === 0) {
            return res.status(400).json({ message: "Problem has no hidden test cases" });
        }

        const languageId = getLanguageById(language);
        if (!languageId) {
            return res.status(400).json({ message: `Unsupported language: ${language}` });
        }

        // Create pending submission first
        const submittedResult = await Submission.create({
            userId,
            problemId,
            code,
            language,
            status: "pending",
            testCasesTotal: problem.hiddenTestCases.length
        });

        // Build batch for Judge0
        const submissions = problem.hiddenTestCases.map((testcase) => {
            // Find driver code for this language (case-insensitive)
            const driverObj = problem.driverCode && problem.driverCode.find(d => d.language.toLowerCase() === language.toLowerCase());
            let finalCode = code;
            if (driverObj && driverObj.code) {
                // Put user code first, then driver code
                finalCode = code + "\n\n" + driverObj.code;
            }

            return {
                source_code: finalCode,
                language_id: languageId,
                stdin: testcase.input,
                expected_output: testcase.output
            };
        });

        const submitResult = await submitBatch(submissions);

        if (!submitResult || !Array.isArray(submitResult)) {
            submittedResult.status = "error";
            submittedResult.errorMessage = "Judge0 API returned invalid response";
            await submittedResult.save();
            return res.status(201).send(submittedResult);
        }

        const resultToken = submitResult.map((value) => value.token);
        const testResult = await submitToken(resultToken);

        let testCasesPassed = 0;
        let time = 0;
        let memory = 0;
        let errorMessage = null;
        let status = 'accepted';

        for (const test of testResult) {
            if (test.status_id === 3) {
                testCasesPassed += 1;
                time = parseFloat(test.time) || 0;
                memory = Math.max(memory, test.memory || 0);
            } else {
                status = test.status_id === 4 ? "error" : "wrong";
                errorMessage = test.stderr || test.compile_output || test.message || "Unknown error";
            }
        }

        submittedResult.status = status;
        submittedResult.runtime = time;
        submittedResult.memory = memory;
        submittedResult.errorMessage = errorMessage;
        submittedResult.testCasesPassed = testCasesPassed;
        await submittedResult.save();

        // Track solved problems only on accepted
        if (status === 'accepted' && !req.result.problemSolved.includes(problemId)) {
            req.result.problemSolved.push(problemId);
            await req.result.save();
        }

        res.status(201).send(submittedResult);

    } catch (err) {
        console.error('submitCode error:', err);
        res.status(500).json({ message: "Internal server error: " + err.message });
    }
};

const runCode = async (req, res) => {
    try {
        const userId = req.result._id;
        const problemId = req.params.id;
        let { code, language } = req.body;

        if (!userId || !problemId || !code || !language) {
            return res.status(400).json({ message: "Field is missing" });
        }

        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({ message: "Problem not found" });
        }

        if (!problem.visibleTestCases || problem.visibleTestCases.length === 0) {
            return res.status(400).json({ message: "Problem has no visible test cases" });
        }

        const languageId = getLanguageById(language);
        if (!languageId) {
            return res.status(400).json({ message: `Unsupported language: ${language}` });
        }

        const submittedResult = await Submission.create({
            userId,
            problemId,
            code,
            language,
            status: "pending",
            testCasesTotal: problem.visibleTestCases.length
        });

        const submissions = problem.visibleTestCases.map((testcase) => {
            // Find driver code for this language (case-insensitive)
            const driverObj = problem.driverCode && problem.driverCode.find(d => d.language.toLowerCase() === language.toLowerCase());
            let finalCode = code;
            if (driverObj && driverObj.code) {
                // Put user code first, then driver code
                finalCode = code + "\n\n" + driverObj.code;
            }

            return {
                source_code: finalCode,
                language_id: languageId,
                stdin: testcase.input,
                expected_output: testcase.output
            };
        });

        const submitResult = await submitBatch(submissions);

        if (!submitResult || !Array.isArray(submitResult)) {
            submittedResult.status = "error";
            submittedResult.errorMessage = "Judge0 API returned invalid response";
            await submittedResult.save();
            return res.status(201).send(submittedResult);
        }

        const resultToken = submitResult.map((value) => value.token);
        const testResult = await submitToken(resultToken);

        let testCasesPassed = 0;
        let time = 0;
        let memory = 0;
        let errorMessage = null;
        let status = 'accepted';

        for (const test of testResult) {
            if (test.status_id === 3) {
                testCasesPassed += 1;
                time = parseFloat(test.time) || 0;
                memory = Math.max(memory, test.memory || 0);
            } else {
                status = test.status_id === 4 ? "error" : "wrong";
                errorMessage = test.stderr || test.compile_output || test.message || "Unknown error";
            }
        }

        submittedResult.status = status;
        submittedResult.runtime = time;
        submittedResult.memory = memory;
        submittedResult.errorMessage = errorMessage;
        submittedResult.testCasesPassed = testCasesPassed;
        await submittedResult.save();

        res.status(201).send(submittedResult);

    } catch (err) {
        console.error('runCode error:', err);
        res.status(500).json({ message: "Internal server error: " + err.message });
    }
};

module.exports = { submitCode, runCode };
