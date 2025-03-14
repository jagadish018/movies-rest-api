import { serve } from "@hono/node-server";
import { Hono } from "hono";

type Movie = {
  id: string;
  title: string;
  director: string;
  releaseYear: number;
  genre: string;
  ratings?: number[];
};

const app = new Hono();
const movies: Movie[] = [];

// Add a new movie
app.post("/movies", async (c) => {
  const movie: Movie = await c.req.json();
  if (
    !movie.id ||
    !movie.title ||
    !movie.director ||
    !movie.releaseYear ||
    !movie.genre
  ) {
    return c.json({ error: "Missing required fields" }, 400);
  }
  movies.push(movie);
  return c.json({ message: "Movie added successfully" }, 201);
});

app.get("/movies", (check) => {
  return check.json(movies);
})

// Update a movie partially
app.patch("/movies/:id", async (c) => {
  const { id } = c.req.param();
  const updates = await c.req.json();
  const movie = movies.find((m) => m.id === id);
  if (!movie) return c.json({ error: "Movie not found ~~~>" }, 404);
  Object.assign(movie, updates);
  return c.json({ message: "Movie updated successfully" });
});


// Search movies by keyword in title
app.get("/movies/search", (c) => {
  const { keyword } = c.req.query();
  const result = movies.filter((m) => m.title.toLowerCase().includes(keyword.toLowerCase()));
  return result.length
    ? c.json(result)
    : c.json({ error: "No movies found!!!" }, 404);
});

// Get top-rated movies
app.get("/movies/top-rated", (c) => {
  if (movies.length === 0) return c.json({ error: "No movies found-->" }, 404);
  const sortedMovies = [...movies]
    .filter((m) => m.ratings && m.ratings.length > 0)
    .sort((a, b) => {
      const avgA = a.ratings
        ? a.ratings.reduce((sum, r) => sum + r, 0) / a.ratings.length
        : 0;
      const avgB = b.ratings
        ? b.ratings.reduce((sum, r) => sum + r, 0) / b.ratings.length
        : 0;
      return avgB - avgA;
    });
  return c.json(sortedMovies);
});

// Get movie details by ID
app.get("/movies/:id", (c) => {
  const { id } = c.req.param();
  const movie = movies.find((m) => m.id === id);
  return movie ? c.json(movie) : c.json({ error: "Movie not found_-_-_>" }, 404);
});

// Delete a movie by ID
app.delete("/movies/:id", (c) => {
  const { id } = c.req.param();
  const index = movies.findIndex((m) => m.id === id);
  if (index === -1) return c.json({ error: "Movie not found !!==>" }, 404);
  movies.splice(index, 1);
  return c.json({ message: "Movie deleted successfully" });
});

// Rate a movie
app.post("/movies/:id/rating", async (c) => {
  const { id } = c.req.param();
  const { rating } = await c.req.json();
  if (rating < 1 || rating > 5)
    return c.json({ error: "Rating must be between 1 and 5" }, 400);
  const movie = movies.find((m) => m.id === id);
  if (!movie) return c.json({ error: "Movie not found!!!!!" }, 404);
  movie.ratings = movie.ratings || [];
  movie.ratings.push(rating);
  return c.json({ message: "Rating added successfully" });
});

// Get average rating of a movie
app.get("/movies/:id/rating", (c) => {
  const { id } = c.req.param();
  const movie = movies.find((m) => m.id === id);
  if (!movie) return c.json({ error: "Movie not found****>" }, 404);
  if (!movie.ratings || movie.ratings.length === 0) return c.json({}, 200);
  const avgRating =
    movie.ratings.reduce((a, b) => a + b, 0) / movie.ratings.length;
  return c.json({ averageRating: avgRating });
});





// Get movies by genre
app.get("/movies/genre/:genre", (c) => {
  const { genre } = c.req.param();
  const result = movies.filter(
    (m) => m.genre.toLowerCase() === genre.toLowerCase()
  );
  return result.length
    ? c.json(result)
    : c.json({ error: "No movies found=>" }, 404);
});

// Get movies by director
app.get("/movies/director/:director", (c) => {
  const { director } = c.req.param();
  const result = movies.filter(
    (m) => m.director.toLowerCase() === director.toLowerCase()
  );
  return result.length
    ? c.json(result)
    : c.json({ error: " movies not exit%%%%" }, 404);
});



  

serve(app);
console.log(`Server is running on http://localhost:3000`);
