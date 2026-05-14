const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.DATABASE_URL).then(async () => {
    const Problem = require('./src/modules/problemSchema');
    await Problem.updateMany({}, {
        $set: {
            driverCode: [
                { language: 'C++', code: '' },
                { language: 'Java', code: '' },
                { language: 'JavaScript', code: '' }
            ]
        }
    });
    console.log('Database updated successfully.');
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
