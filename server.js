import { config } from 'dotenv'
config()
import app from './src/app.js'
import connectDb from './src/db/connect.js'

const PORT = 8081

connectDb()






app.listen(PORT, () => {
  console.log(`server running on port number ${PORT}`);
})