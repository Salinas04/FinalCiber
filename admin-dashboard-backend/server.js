require('dotenv').config(); // Cargar las variables de entorno

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Conectar a MongoDB Atlas
mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 3000,
    socketTimeoutMS: 4500
})
    .then(() => console.log('Conectado a MongoDB Atlas'))
    .catch(error => console.log('Error de conexión:', error));

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/trucks', require('./routes/trucks'));
app.use('/api/drivers', require('./routes/drivers'));
app.use('/api/address', require('./routes/address'));
app.use('/api/package', require('./routes/package'));
app.use('/api/users', require('./routes/users'));
app.use('/api/assignedDelivery', require('./routes/assignedDelivery'));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
