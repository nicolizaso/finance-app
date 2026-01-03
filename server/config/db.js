const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Intentamos conectar usando la variable de entorno
        const conn = await mongoose.connect(process.env.MONGO_URI);
        
        console.log(`✅ MongoDB Conectado: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ Error de conexión: ${error.message}`);
        // Si falla la base de datos, el servidor no sirve de nada. Apagamos todo.
        process.exit(1);
    }
};

module.exports = connectDB;