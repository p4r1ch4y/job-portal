// configuration file
// This can be used to export consolidated configuration settings


module.exports = {
    port: process.env.PORT || 5000,
    jwtSecret: process.env.JWT_SECRET,
    mongoURI: process.env.MONGO_URI,
    nodeEnv: process.env.NODE_ENV || 'development',
};
