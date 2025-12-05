const mongoose=require('mongoose');

async function main() {
   await mongoose.connect(process.env.DATABASE_URL);
}

module.exports=main;