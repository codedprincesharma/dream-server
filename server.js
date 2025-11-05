import { config } from 'dotenv';
config();
import app from './src/app.js';
import connectDb from './src/db/connect.js';

// ✅ Use the Cloud Run-provided PORT environment variable
const PORT = process.env.PORT || 8080;

connectDb();

// ✅ Always bind to 0.0.0.0 (required in Cloud Run)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
