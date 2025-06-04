import { useEffect, useState } from 'react'
import Search from './comps/search.jsx'
import Spinner from './comps/Spinner.jsx';
import MovieCard from './comps/MovieCard.jsx';
import {useDebounce} from 'react-use'
import {getTrendingMovies, updateSearchCount } from './appwrite.js'


const TMDB_API_URL = 'https://api.themoviedb.org/3';

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization:`Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2NzAyYzIyNWY2NzYxOWVmODA1NTRjZjhjZjEwYTE0ZCIsIm5iZiI6MTc0ODgwMjM0Mi40LCJzdWIiOiI2ODNjOWIyNjM1MWI3NmYxNmVkMjE0YmUiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.4CFuez7mCQ2AAQ6YTeWcZ0JccJKEX2wjCw78kXO7n_E`
  }
}

const App = () => {

  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [searchTerm, setSearchTerm] = useState('');
  const [movieList, setMovieList] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [trendingMovies, setTrendingMovies] = useState([]);
  useDebounce(() => setDebouncedSearchTerm(searchTerm) , 500, [searchTerm])


  const fetchmovies = async (query = '') => {
  try{
    setIsLoading(true);
    setErrorMessage('');
    const endpoint = query
        ? `${TMDB_API_URL}/search/movie?query=${encodeURIComponent(query)}`
        : `${TMDB_API_URL}/discover/movie?sort_by=popularity.desc`;

    const response = await fetch(endpoint, API_OPTIONS);

    if(!response) {
      throw new Error('Failed to fetch movies');
    }
    const data = await response.json();

    if(data.Response === 'False'){
      setErrorMessage(data.Error || 'Falied to fetch movies');
      setMovieList([]);
    }

    updateSearchCount();

    setMovieList(data.results || []);

      if(query && data.results.length > 0) {
        await updateSearchCount(query, data.results[0]);
      }
  } catch (error) {
    console.log(`Error Fetching Movies: ${error}`);
  } finally{
    setIsLoading(false);
  }
}

  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();

      setTrendingMovies(movies);
    } catch (error) {
      console.error(`Error fetching trending movies: ${error}`);
    }
  }

  useEffect(() => {
    fetchmovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    loadTrendingMovies();
  }, []);

  return (
    <main>
      <div className='pattern'/>

      <div className='wrapper'>
        <header>
          <img src="./hero.png" alt="Hero Banner" />
          <h1>Find <span className='text-gradient'>Movies</span> You'll Enjoy without the Hassle</h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        {trendingMovies.length > 0 && (
          <section className="trending">
            <h2>Trending Movies</h2>

            <ul>
              {trendingMovies.map((movie, index) => (
                <li key={movie.$id}>
                  <p>{index + 1}</p>
                  <img src={movie.poster_url} alt={movie.title} />
                </li>
              ))}
            </ul>
          </section>
        )}
        
        <section className='all-movies'>
          <h2>All Movies</h2>

          {isLoading ? (
            <Spinner/>
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : (
            <ul>
              {movieList.map((movie) => (
                <MovieCard key={movie.id} movie={movie}/>
              ))}
            </ul>
          )}
        </section>
        

        
      </div>
    </main>
  )
}

export default App 