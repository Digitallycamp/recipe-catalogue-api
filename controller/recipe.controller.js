const RecipesModel = require('../models/recipe.model');
const crypto = require('crypto');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const Receipies = require('../models/recipe.model');
const mongoose = require('mongoose');

async function createRecipe(req, res, next) {
	console.log(req.body);
	const { name, calories, ingredients } = req.body;
	// const recipePhoto = req.files;
	const localPhoto = req.files;
	console.log(localPhoto);
	if (!name || !calories || !ingredients) {
		throw new Error('Filed required');
	}

	const getExtentionName = path.extname(localPhoto.recipePhoto.name);
	const allowedExtention = ['.jpg', '.jpeg', '.png', '.PNG', '.JPG', '.JPEG'];

	// https://sebhastian.com/express-fileupload/

	try {
		const imageSize = 1024 * 1024 * 2;
		// if (!localPhoto.recipePhoto.mimetype.startsWith('image')) {
		// 	// return next(new Error('Photo too big'));
		// 	throw new Error('Only image file allowed');
		// }
		if (!allowedExtention.includes(getExtentionName)) {
			throw new Error(
				`${getExtentionName} not allowed. Only .jpg, .jpeg, .png allowed`
			);
		}
		if (localPhoto.recipePhoto.size > imageSize) {
			return next(new Error('Photo too big'));
		}
		// gebetrate the qunie image
		const randomId = crypto.randomBytes(8).toString('hex');
		// const splitImage = localPhoto.recipePhoto.name.split('.');
		// const uniqueImage = `${splitImage[0]}${randomId}${'.'}${splitImage[1]}`;

		const result = await cloudinary.uploader.upload(
			localPhoto.recipePhoto.tempFilePath,
			{
				use_filename: true,
				resource_type: 'image',

				folder: 'reciepe-api',
				public_id: randomId,
			}
		);

		fs.unlinkSync(localPhoto.recipePhoto.tempFilePath);
		console.log(result);
		// continue from moving
		// const uploadPath = path.join(__dirname, '../uploads', uniqueImage);

		// console.log(uploadPath);
		// await localPhoto.recipePhoto.mv(uploadPath);

		const recipe = new RecipesModel({
			recipe_name: name,
			calories: parseInt(calories),
			ingredients: ingredients,
			photo: result.secure_url,
		});

		await recipe.save();

		return res
			.status(200)
			.json({ ok: true, message: 'Recipe created sucessfully' });
	} catch (error) {
		// return next(new Error('Creating recipe failed'));
		console.log(error);
		return next(error);
	}
}
/****GET ALL RECIEPES */
async function getRecipes(req, res, next) {
	console.log('MY QUERY', req.query);
	// const {
	// 	recipe_name,
	// 	calories,
	// 	'ingredients.name': ingredientName,
	// 	'ingredients.quantity': ingredientQuantity,
	// } = req.query;
	// console.log(ingredientName);
	const {
		recipe_name,
		calories,
		ingredient_name,
		ingredient_quantity,
		page = 1,
		limit = 5,
	} = req.query; // Destructure query params
	// include filter query
	const filter = {}; // Build the filter object dynamically
	if (recipe_name) {
		filter.recipe_name = { $regex: recipe_name, $options: 'i' }; // Case-insensitive regex search
	}
	if (calories) {
		filter.calories = parseInt(calories); // Convert calories to a number
		if (isNaN(filter.calories)) {
			return res.status(400).json({
				ok: false,
				message: 'Invalid calories value. Must be a number.',
			});
		}
	}

	if (ingredient_name) {
		filter['ingredients.name'] = { $regex: ingredient_name, $options: 'i' }; // Filter by ingredient name
	}

	if (ingredient_quantity) {
		const parsedQuantity = parseInt(ingredient_quantity);
		if (isNaN(parsedQuantity)) {
			return res.status(400).json({
				ok: false,
				message: 'Invalid quantity value. Must be a number.',
			});
		}
		filter['ingredients.quantity'] = parsedQuantity; // Filter by ingredient quantity
	}

	// include pagination
	const parsedPage = parseInt(page);
	const parsedLimit = parseInt(limit);
	if (isNaN(parsedPage) || parsedPage < 1) {
		return res.status(400).json({
			ok: false,
			message: 'Invalid page number. Must be a positive integer.',
		});
	}

	if (isNaN(parsedLimit) || parsedLimit < 1) {
		return res.status(400).json({
			ok: false,
			message: 'Invalid limit. Must be a positive integer.',
		});
	}
	const skip = (parsedPage - 1) * parsedLimit; // Calculate how many documents to skip
	// documentation with swagger
	// deploy
	try {
		const ReceipesList = await Receipies.find(filter)
			.skip(skip) // Apply skip for pagination
			.limit(parsedLimit); // Apply limit for pagination;
		// Share the problem with countDocument() it is a promise
		const countDoc = await Receipies.countDocuments();
		console.log(countDoc);
		if (ReceipesList.length === 0) {
			return res.status(200).json({ ok: true, message: 'No reciepes' });
		}
		res.status(200).json({
			ok: true,
			length: ReceipesList.length,
			message: 'all recipes',
			ReceipesList,
		});
	} catch (error) {
		return next(error);
	}
}

/**GET A SINGLE RECIPE */
async function getRecipe(req, res, next) {
	const id = req.params.id;

	try {
		// addded ! because isValidObjectId() return true
		// cehck if its is a mongooose id
		// if (!mongoose.isValidObjectId(id)) {
		// 	return res.status(400).json({ ok: true, message: 'Invalid reciepe id' });
		// }

		// There is no need for this anyways not necessary just flexing my muscle
		let recipe;
		if (!mongoose.isValidObjectId(id)) {
			return res.status(400).json({ ok: true, message: 'Invalid reciepe id' });
		}
		recipe = await Receipies.findById(id);

		// changed from findOne()

		if (!recipe) {
			return res.status(400).json({ ok: true, message: 'reciepe not found' });
		}

		res.status(200).json({ ok: true, message: 'get recipe', recipe });
	} catch (error) {
		return next(error);
	}
}
async function editRecipe(req, res, next) {
	const id = req.params.id;

	try {
		if (!mongoose.isValidObjectId(id)) {
			return res.status(400).json({ ok: true, message: 'Invalid reciepe id' });
		}
		let recipe = await Receipies.findById(id);
		if (!recipe) {
			return res.status(400).json({ ok: true, message: 'reciepe not found' });
		}
		recipe = await Receipies.findByIdAndUpdate(id, req.body);
		res.status(201).json({ ok: true, message: 'RECIPE EDITED', recipe });
	} catch (error) {
		return next(error);
	}
}
async function deleteRecipe(req, res, next) {
	const id = req.params.id;
	try {
		if (!mongoose.isValidObjectId(id)) {
			return res.status(400).json({ ok: true, message: 'Invalid reciepe id' });
		}

		let recipe = await Receipies.findById(id);
		if (!recipe) {
			return res.status(400).json({ ok: true, message: 'reciepe not found' });
		}
		await Receipies.findByIdAndDelete(id, req.body);
		res.status(201).json({ ok: true, message: 'RECIPE deleted' });
	} catch (error) {
		return next(error);
	}
}

module.exports = {
	createRecipe,
	getRecipes,
	getRecipe,
	editRecipe,
	deleteRecipe,
};
