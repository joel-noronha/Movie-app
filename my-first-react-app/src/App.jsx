import React from 'react'
import {useDebounce} from "react-use";
import {useEffect, useState} from 'react';
import Search from "./components/Search.jsx";
import Spinner from "./components/Spinner.jsx";
import MovieCard from "./components/MovieCard.jsx";
import {getTrendingMovies, updateSearchCount} from "./appwrite.js";

const API_BASE_URL = 'https://api.themoviedb.org/3/';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_OPTIONS = {
    method:'GET',
    headers:{
        accept: 'application/json',
        Authorization: `Bearer ${API_KEY}`
    }
}
const App = () => {
    const [searchTerm, setSearchTerm] = React.useState('');
    const [movieList,setMovieList] = React.useState([]);
    const [isLoading,setIsLoading] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = React.useState('');
    const [trendingMovies,setTrendingMovies] = React.useState([]);
useDebounce(()=>setDebouncedSearchTerm(searchTerm),500, [searchTerm])
    const fetchmovies=async (query='')=>{
        setIsLoading(true); // loading to true
        setErrorMessage('');// set error message as nothing
        try{
            const endpoint= query ?
                `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
                :`${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

            const response = await fetch(endpoint, API_OPTIONS);
            //throw new Error('Failed to fetch movies'); //simulate fetching error
            if(!response.ok){
                throw new Error('Failed to fetch movies');
            }
            const data = await response.json();
            //console.log(data);
            if (data.Response==='False'){
                setErrorMessage(data.Error || 'Failed to fetch movies');
                setMovieList([]);
                return;
            }
            setMovieList(data.results || []);
            if(query && data.results.length > 0){
                await updateSearchCount(query,data.results[0]);
            }

        }catch(error){
            console.error(`Error fetching movies: ${error}`);
            setErrorMessage('Error fetching movies please try again.');
        }finally {
            setIsLoading(false);
        }
    }
    const loadTrendingMovies=async()=>{
    try{
        const movies = await getTrendingMovies();
        setTrendingMovies(movies);
    }catch (error){
        console.error(`Error fetching trending movies${error}`);

    }
    }


useEffect(()=>{
    fetchmovies(debouncedSearchTerm);
},[debouncedSearchTerm]);

useEffect(() => {
        loadTrendingMovies();
    }, []);
    return (
        <main>
                <div className="pattern"/>
            <div className="wrapper">
                <header>
                    <img src="./hero.png" alt="Hero Banner"/>
                    <h1>Find <span className="text-gradient">Movies</span> You'll Enjoy Without the Hassle. </h1>
                    <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                </header>

                {trendingMovies.length > 0 && (
                    <section className="trending">
                        <h2>Trending Movies</h2>
                        <ul>
                            {trendingMovies.map((movie,index)=>(
                                <li key={movie.$id}>
                                    <p>{index+1}</p>
                                    <img src={movie.poster_url} alt={movie.title}/>
                                </li>
                                ))}
                        </ul>
                    </section>
                )}

                <section className="all-movies">
                    <h2 >All Movies</h2>
                    {isLoading?(
                        <Spinner />
                    ):errorMessage ?(
                        <p className="text-red-500">Error: {errorMessage}</p>
                    ):(
                        <ul>
                            {movieList.map((movie)=>(
                                <MovieCard key={movie.id} movie={movie}/>
                            ))}
                        </ul>
                    )
                    }
                </section>
            </div>
        </main>
    )
}
export default App
