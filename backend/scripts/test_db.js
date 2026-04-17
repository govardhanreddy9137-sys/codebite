import mongoose from 'mongoose';

const uri = "mongodb://gayatriakula06_db_user:Gayatri%402003@ac-g3tdkxc-shard-00-00.eiqkgvk.mongodb.net:27017,ac-g3tdkxc-shard-00-01.eiqkgvk.mongodb.net:27017,ac-g3tdkxc-shard-00-02.eiqkgvk.mongodb.net:27017/codebite?ssl=true&replicaSet=atlas-m0-shard-0&authSource=admin&retryWrites=true&w=majority";

async function test() {
  try {
    console.log('Connecting...');
    await mongoose.connect(uri);
    console.log('Connected successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Connection failed:', err);
    process.exit(1);
  }
}

test();
