Recipe resourse
get reecipte /recipe
create recipe /recipe
single recipe /recipe/:id
delete recipe /recipe/:id
edit reciep /recipe/:id

Favourite
ref Users

Users

email
password
favourite
ref Favourite

## Filter

For the meaning of `$regex` check momgoose/mongodb doc

Example link
// http://localhost:5003/api/v1/recipes?recipe_name=Ewa cake&calories=40&ingredient_name=Beans&ingredient_quantity=20

```js
async function getRecipes(req, res, next) {
	try {
		const { recipe_name, calories, ingredient_name, ingredient_quantity } =
			req.query; // Destructure query params

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

		const ReceipesList = await Receipies.find(filter); // Apply the filter
		const countDoc = await Receipies.countDocuments(filter); // Count filtered documents

		if (ReceipesList.length === 0) {
			return res
				.status(200)
				.json({ ok: true, message: 'No recipes found matching your criteria' }); // More specific message
		}

		res.status(200).json({
			ok: true,
			message: 'All recipes',
			ReceipesList,
			count: countDoc,
		}); // Include count in the response
	} catch (error) {
		return next(error);
	}
}
```

## Paginatioon

```js
async function getRecipes(req, res, next) {
	try {
		const {
			recipe_name,
			calories,
			'ingredients.name': ingredientName,
			'ingredients.quantity': ingredientQuantity,
			page = 1,
			limit = 10,
		} = req.query; // Add page and limit, default values
		const filter = {}; // Build the filter object dynamically

		// ... (Filter logic remains the same as in the previous example)

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

		const ReceipesList = await Receipies.find(filter)
			.skip(skip) // Apply skip for pagination
			.limit(parsedLimit); // Apply limit for pagination

		const countDoc = await Receipies.countDocuments(filter); // Count matching documents

		if (ReceipesList.length === 0) {
			return res
				.status(200)
				.json({ ok: true, message: 'No recipes found matching your criteria' });
		}

		res.status(200).json({
			ok: true,
			message: 'All recipes',
			ReceipesList,
			count: countDoc,
			totalPages: Math.ceil(countDoc / parsedLimit), // Calculate total pages
			currentPage: parsedPage,
		});
	} catch (error) {
		return next(error);
	}
}
```
#   r e c i p e - c a t a l o g u e - a p i  
 