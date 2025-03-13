require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dbConfig = require('./config/db');
const recipeRoute = require('./routes/recipe.routes');
const app = express();
const fileUpload = require('express-fileupload');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');

const cloudinary = require('cloudinary').v2;
cloudinary.config({
	// secure: true,
	cloud_name: process.env.CLOUND_NAME,
	api_key: process.env.CLOUD_API,
	api_secret: process.env.CLOUD_SECRETE,
});
// Swagger definition
const swaggerOptions = {
	swaggerDefinition: {
		openapi: '3.0.0',
		info: {
			title: 'Reciepe Catalogue API',
			version: '1.0.0',
			description: 'API documentation for Reciepe Catalogue API',
			contact: {
				name: 'DVA Fullstack bootcamp +2347060960529',
			},
		},

		servers: [
			{
				url: `http://localhost:${process.env.PORT}`,
			},
		],
		components: {
			securitySchemes: {
				bearerAuth: {
					type: 'http',
					scheme: 'bearer',
					bearerFormat: 'JWT',
				},
			},
		},
	},
	apis: ['./routes/*.js'], // Path to your API docs
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use(fileUpload({ useTempFiles: true }));

// app.get('/', (req, res) => {
// 	res.send('Welcome to our Recipe API');
// });
app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use('/api/v1/recipes', recipeRoute);
morgan('tiny');
app.listen(process.env.PORT, () => {
	dbConfig(process.env.DATABASE_URL);
	console.log(`server runing on http://localhost:${process.env.PORT}`);
});

app.use((err, req, res, next) => {
	console.error('MY SRATCK', err.stack);
	res.status(500).json({ msg: err });
	next();
});
