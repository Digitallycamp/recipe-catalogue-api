const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	quantity: String,
	unit: String,
});
const recipeSchema = new mongoose.Schema({
	recipe_name: {
		type: String,
		required: true,
	},
	ingredients: [ingredientSchema],
	calories: Number,
	photo: String,
});

module.exports = mongoose.model('Recipes', recipeSchema);
