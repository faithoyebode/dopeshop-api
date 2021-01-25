import express from 'express';
import dotenv from 'dotenv';
import colors from 'colors';
import { notFound, errorHandler } from './middlewares/errorMiddleware.js'
import connectDB from './config/db.js';
import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';


dotenv.config();


const app = express();

connectDB(app);

//app.use(express.urlencoded());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('API is running...'); 
});

app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);


app.use(notFound);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;


//app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold));