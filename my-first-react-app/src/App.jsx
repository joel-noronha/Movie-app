import React from 'react'
import {useEffect, useState} from 'react';
import Search from "./components/Search.jsx";
import Spinner from "./components/Spinner.jsx";

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

    const fetchmovies=async ()=>{
        setIsLoading(true); // loading to true
        setErrorMessage('');// set error message as nothing
        try{
            const endpoint= `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
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
        }catch(error){
            console.error(`Error fetching movies: ${error}`);
            setErrorMessage('Error fetching movies please try again.');
        }finally {
            setIsLoading(false);
        }
    }

useEffect(()=>{
    fetchmovies();
},[]);
    return (
        <main>
                <div className="pattern"/>
            <div className="wrapper">
                <header>
                    <img src="./hero.png" alt="Hero Banner"/>
                    <h1>Find <span className="text-gradient">Movies</span> You'll Enjoy Without the Hassle. </h1>
                    <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                </header>
                <section className="all-movies">
                    <h2 className="mt-[40px]">All Movies</h2>
                    {isLoading?(
                        <Spinner />
                    ):errorMessage ?(
                        <p className="text-red-500">Error: {errorMessage}</p>
                    ):(
                        <ul>
                            {movieList.map((movie)=>(
                                <p key={movie.id} className="text-white">{movie.title}</p>
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
