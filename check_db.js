import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: './server/.env' });

async function checkDb() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const rooms = await db.collection('rooms').find({}).toArray();
  console.log('--- ROOMS IN MONGODB ATLAS ---');
  console.log(rooms.map(r => ({ id: r._id, roomId: r.roomId, code: r.code ? r.code.substring(0, 30) : null, hasYjsState: Boolean(r.yjsState) })));
  await mongoose.disconnect();
}

checkDb();
