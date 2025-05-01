const express = require('express');
const {
	createRecipe,
	getRecipes,
	getRecipe,
	editRecipe,
	deleteRecipe,
} = require('../controller/recipe.controller');

const recipeRoute = express.Router();

/**
 * @swagger
 * /api/v1/recipes:
 *   post:
 *     summary: Create a Recipe.
 *     description: Creating a Recipe.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *
 *     responses:
 *       '200':
 *         description: A successful response
 *       '404':
 *         description: Failed to create
 *       '500':
 *         description: Internal server error
 */
recipeRoute.post('/create', createRecipe);
/**
 * @swagger
 * /api/v1/recipes:
 *   get:
 *     summary: Get all Recipe.
 *     description: Creating a Recipe.
 *
 *     responses:
 *       '200':
 *         description: A successful response
 *       '404':
 *         description: Failed to get recipes
 *       '500':
 *         description: Internal server error
 */
recipeRoute.get('/all', getRecipes);
/**
 * @swagger
 * /api/v1/recipes/{id}:
 *   get:
 *     summary: Get a single  Recipe.
 *     description: Retriving a sinlge Recipe.
 *
 *
 *     responses:
 *       '200':
 *         description: A successful response
 *       '404':
 *         description: Failed to get recipes
 *       '500':
 *         description: Internal server error
 */
recipeRoute.get('/recipe/:id', getRecipe);
recipeRoute.put('/recipe/:id', editRecipe);
recipeRoute.delete('/recipe/:id', deleteRecipe);

module.exports = recipeRoute;
