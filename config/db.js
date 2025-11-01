import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // Check if MONGO_URI is set
    if (!process.env.MONGO_URI) {
      console.error("❌ MONGO_URI is not set in environment variables!");
      console.error("Please set MONGO_URI in your .env file");
      process.exit(1);
    }

    console.log("🔄 Attempting to connect to MongoDB...");
    console.log("Connection string:", process.env.MONGO_URI.replace(/\/\/[^:]+:[^@]+@/, "//***:***@")); // Hide password

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 15000, // 15 seconds timeout
      socketTimeoutMS: 45000, // 45 seconds socket timeout
      connectTimeoutMS: 15000, // 15 seconds connection timeout
      maxPoolSize: 10, // Maximum number of connections
      retryWrites: true,
      w: 'majority',
    });
    
    console.log(`✅ MongoDB Connected successfully!`);
    console.log(`   Host: ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name}`);
    console.log(`   Ready State: ${conn.connection.readyState} (1=connected)`);
  } catch (error) {
    console.error("❌ MongoDB connection failed!");
    console.error("Error details:", {
      message: error.message,
      name: error.name,
      code: error.code,
    });
    
    if (error.message.includes("authentication failed")) {
      console.error("⚠️  Authentication failed - Check your MongoDB username and password");
    } else if (error.message.includes("ENOTFOUND") || error.message.includes("getaddrinfo")) {
      console.error("⚠️  Could not resolve MongoDB host - Check your connection string");
    } else if (error.message.includes("timeout")) {
      console.error("⚠️  Connection timeout - Possible issues:");
      console.error("   1. Check if your IP address is whitelisted in MongoDB Atlas");
      console.error("   2. Check if MongoDB Atlas cluster is running");
      console.error("   3. Check your network connection");
    }
    
    console.error("\n💡 Troubleshooting steps:");
    console.error("   1. Verify MONGO_URI in your .env file is correct");
    console.error("   2. Check MongoDB Atlas Network Access - ensure your IP is whitelisted");
    console.error("   3. Ensure MongoDB Atlas cluster is running");
    console.error("   4. Test connection string in MongoDB Compass");
    
    process.exit(1);
  }
};

// Handle connection events
mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected');
});

export default connectDB;
