const axios = require('axios');

const RAPIDAPI_KEY = 'ab99c6ec42mshfd636ec7c6687efp1b9043jsna684835b0591';
const JUDGE0_HOST = 'judge0-ce.p.rapidapi.com';

const getLanguageById = (lang) => {
    const language = {
        "c++": 54,
        "java": 62,
        "javascript": 63
    };
    return language[lang.toLowerCase()];
};

const submitBatch = async (submissions) => {
    try {
        const response = await axios.post(
            'https://judge0-ce.p.rapidapi.com/submissions/batch',
            { submissions },
            {
                params: { base64_encoded: 'false' },
                headers: {
                    'x-rapidapi-key': RAPIDAPI_KEY,
                    'x-rapidapi-host': JUDGE0_HOST,
                    'Content-Type': 'application/json'
                }
            }
        );
        console.log('Judge0 submitBatch response:', JSON.stringify(response.data));
        // Judge0 batch POST returns array directly: [{token: "..."}, ...]
        return response.data;
    } catch (error) {
        console.error('Judge0 submitBatch error:', error.response?.data || error.message);
        throw new Error('Judge0 submission failed: ' + (error.response?.data?.message || error.message));
    }
};

const waiting = (timer) => new Promise(resolve => setTimeout(resolve, timer));

const submitToken = async (resultToken) => {
    if (!resultToken || resultToken.length === 0) {
        throw new Error('No tokens provided for polling');
    }

    while (true) {
        try {
            const response = await axios.get(
                'https://judge0-ce.p.rapidapi.com/submissions/batch',
                {
                    params: {
                        tokens: resultToken.join(','),
                        base64_encoded: 'false',
                        fields: 'token,status_id,stdout,stderr,compile_output,message'
                    },
                    headers: {
                        'x-rapidapi-key': RAPIDAPI_KEY,
                        'x-rapidapi-host': JUDGE0_HOST
                    }
                }
            );

            const result = response.data;
            // Judge0 batch GET returns { submissions: [...] }
            const subs = result.submissions || result;

            if (!Array.isArray(subs)) {
                throw new Error('Invalid response format from Judge0 batch poll');
            }

            const isDone = subs.every((r) => r.status_id <= 2 ? false : true);
            if (isDone) return subs;

            await waiting(1500);
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.response?.data || error.message;
            console.error('Judge0 submitToken error:', errorMsg);
            throw new Error('Judge0 polling failed: ' + errorMsg);
        }
    }
};

module.exports = { getLanguageById, submitBatch, submitToken };
