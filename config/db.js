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

    // Configure Mongoose buffering - allow buffering for better connection handling
    mongoose.set('bufferCommands', true);

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000, // 30 seconds timeout (increased for external access)
      socketTimeoutMS: 60000, // 60 seconds socket timeout (increased)
      connectTimeoutMS: 30000, // 30 seconds connection timeout (increased)
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
  console.warn('⚠️  MongoDB disconnected - attempting to reconnect...');
  // Automatically reconnect
  mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 60000,
    connectTimeoutMS: 30000,
  }).catch(err => {
    console.error('❌ Reconnection failed:', err);
  });
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected successfully');
});

mongoose.connection.on('connecting', () => {
  console.log('🔄 MongoDB connecting...');
});

mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB connected');
});

// Helper function to check if MongoDB is connected
export const isMongoConnected = () => {
  return mongoose.connection.readyState === 1; // 1 = connected
};

export default connectDB;
