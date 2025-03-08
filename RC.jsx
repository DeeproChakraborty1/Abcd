// RecipeHub (React)

// Folder Structure:

// recipehub/
// ├── public/
// │   └── ... (images, etc.)
// ├── src/
// │   ├── components/
// │   │   ├── Layout.js
// │   │   ├── RecipeCard.js
// │   │   ├── Search.js
// │   │   ├── Loading.js
// │   │   ├── Error.js
// │   │   └── Pagination.js
// │   ├── pages/
// │   │   ├── Home.js
// │   │   ├── Recipes.js
// │   │   ├── Category.js
// │   │   └── index.js (redirect to /Home)
// │   ├── api/
// │   │   ├── randomRecipes.js
// │   │   └── searchByIngredient.js
// │   ├── services/
// │   │   └── api.js
// │   ├── App.js
// │   └── index.js
// ├── package.json
// └── ...

// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Recipes from './pages/Recipes';
import Category from './pages/Category';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/Home" element={<Home />} />
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/category/:category" element={<Category />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;

// src/components/Layout.js
import React from 'react';
import { Link } from 'react-router-dom';

function Layout({ children }) {
  return (
    <div>
      <nav>
        <ul>
          <li><Link to="/Home">Home</Link></li>
          <li><Link to="/recipes">Recipes</Link></li>
        </ul>
      </nav>
      <main>{children}</main>
      <footer>
        <p>&copy; {new Date().getFullYear()} RecipeHub</p>
      </footer>
    </div>
  );
}

export default Layout;

// src/components/RecipeCard.js
import React from 'react';

function RecipeCard({ recipe }) {
  return (
    <div style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
      <img src={recipe.strMealThumb} alt={recipe.strMeal} style={{ maxWidth: '200px' }} />
      <h3>{recipe.strMeal}</h3>
    </div>
  );
}

export default RecipeCard;

// src/components/Search.js
import React, { useState } from 'react';
import api from '../services/api';

function Search({ onResults }) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = async () => {
    try {
      const results = await api.searchByIngredient(searchTerm);
      onResults(results);
    } catch (error) {
      console.error('Search error:', error);
      onResults([]);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>
    </div>
  );
}

export default Search;

// src/components/Loading.js
import React from 'react';

function Loading() {
  return <div>Loading...</div>;
}

export default Loading;

// src/components/Error.js
import React from 'react';

function Error({ message }) {
  return <div>Error: {message}</div>;
}

export default Error;

// src/components/Pagination.js
import React from 'react';

function Pagination({ currentPage, totalPages, onPageChange }) {
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div>
      {pageNumbers.map((number) => (
        <button key={number} onClick={() => onPageChange(number)}>
          {number}
        </button>
      ))}
    </div>
  );
}

export default Pagination;

// src/pages/Home.js
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import RecipeCard from '../components/RecipeCard';
import Loading from '../components/Loading';
import Error from '../components/Error';

function Home() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchRandomRecipes() {
      try {
        const data = await api.getRandomRecipes();
        setRecipes(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }
    fetchRandomRecipes();
  }, []);

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;

  return (
    <div>
      <h1>Featured Recipes</h1>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.idMeal} recipe={recipe} />
        ))}
      </div>
    </div>
  );
}

export default Home;

// src/pages/Recipes.js
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import RecipeCard from '../components/RecipeCard';
import Loading from '../components/Loading';
import Error from '../components/Error';
import Search from '../components/Search';
import Pagination from '../components/Pagination';

function Recipes() {
  const [recipes, setRecipes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const recipesPerPage = 12;

  useEffect(() => {
    async function fetchRecipes() {
      try {
        setLoading(true);
        let data;
        if (selectedCategory) {
          data = await api.getMealsByCategory(selectedCategory);
        } else {
          data = await api.getAllMeals();
        }
        setRecipes(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }
    fetchRecipes();
  }, [selectedCategory]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await api.getCategories();
        setCategories(data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    }
    fetchCategories();
  }, []);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSearch = (results) => {
    setSearchResults(results);
  };

  const indexOfLastRecipe = currentPage * recipesPerPage;
  const indexOfFirstRecipe = indexOfLastRecipe - recipesPerPage;
  const currentRecipes = searchResults.length > 0 ? searchResults.slice(indexOfFirstRecipe, indexOfLastRecipe) : recipes.slice(indexOfFirstRecipe, indexOfLastRecipe);

  const totalPages = Math.ceil((searchResults.length > 0 ? searchResults.length : recipes.length) / recipesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;

  return (
    <div>
      <h1>Recipes</h1>
      <Search onResults={handleSearch} />
      <div>
        <select value={selectedCategory} onChange={(e) => handleCategoryChange(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category.strCategory} value={category.strCategory}>
              {category.strCategory}
            </option>
          ))}
        </select>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
