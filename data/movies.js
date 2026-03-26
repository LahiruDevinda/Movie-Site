import { selectedGenres, selectedYear } from "../utils/filter.js";
import { API_KEY, ACCOUNT_ID, BEARER_TOKEN } from "./userData.js";
import { favoritList } from "./wishlist.js";

const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const moviesContainer =  document.querySelector('.js-movies-container');
const loader = document.querySelector('.js-loading');

let currentPage = 1;
let isFetching = false;
let currentSearchTerm = '';

export async function fetchMovies(page, query = '') {

    isFetching = true; 
    let API_URL = '';

    loader.classList.remove('hidden');

    if (query !== '') {
        
        const encodedQuery = encodeURIComponent(query);
        API_URL = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodedQuery}&page=${page}`;
        
    } else if (selectedGenres.length > 0 || selectedYear !== 'ALL') {
        
        API_URL = `${BASE_URL}/discover/movie?api_key=${API_KEY}&page=${page}`;
        
        if (selectedGenres.length > 0) {
            const genreString = selectedGenres.join(',');
            API_URL += `&with_genres=${genreString}`;
        }

        if (selectedYear !== 'ALL') {
            if (selectedYear.includes('-')) {
                const years = selectedYear.split('-');
                const endYear = years[0];
                const startYear = years[1];
                
                API_URL += `&primary_release_date.gte=${startYear}-01-01&primary_release_date.lte=${endYear}-12-31`;
            } else {
                API_URL += `&primary_release_year=${selectedYear}`;
            }
        }
        
        } else {
            
            API_URL = `${BASE_URL}/trending/movie/week?api_key=${API_KEY}&page=${page}`;
        }

    try {
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();

        if (page === 1) {
            document.querySelector('.js-movies-container').innerHTML = '';
        }
        
        const cleanMovies = data.results.filter(movie => movie.poster_path !== null && movie.vote_count > 10);
        
        renderMovies(cleanMovies);

    } catch (error) {
        console.error('Error fetching movies:', error);
    } finally {
        isFetching = false; 
        loader.classList.add('hidden');
    }
}

function renderMovies(moviesArray) {
    let moviesHTML = '';

    moviesArray.forEach((movie) => {
        const imagePath = movie.poster_path 
            ? `${IMAGE_BASE_URL}${movie.poster_path}` 
            : 'images/movie-thumbnails/concept-cinema-with-film-elements.jpg'; 
        
        const year = movie.release_date ? movie.release_date.substring(0, 4) : 'N/A';
        const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'NR';

        const isFavorite = favoritList.includes(movie.id);
        const heartClass = isFavorite ? 'wishlist-active' : '';

        moviesHTML += `
            <div class="movie-card" data-movie-id="${movie.id}">
                <img class="movie-card-image" src="${imagePath}" alt="${movie.title}">
                <div class="movie-card-details">
                    <div class="movie-name">${movie.title || movie.name}</div>
                    <div class="movie-data">
                        <div class="movie-year-rate">
                            <span class="year">${year}</span>
                            <img class="star" src="images/movie-card/star.svg">
                            <span class="rating">${rating}</span>
                        </div>
                        <button class="add-to-wishlist ${heartClass}" data-movie-id="${movie.id}">
                            <img src="images/movie-card/heart.svg">
                        </button>
                    </div> 
                </div>
            </div>
        `;
    });

   moviesContainer.innerHTML += moviesHTML;
}

window.addEventListener('scroll', () => {
    const scrollPosition = window.innerHeight + window.scrollY;
    const bodyHeight = document.body.offsetHeight;

    if (scrollPosition >= bodyHeight - 50) {
        if (!isFetching) {
            currentPage++; 
            console.log(`Loading page ${currentPage}...`);
            fetchMovies(currentPage, currentSearchTerm); 
        }
    }
});

document.body.addEventListener('click', async (event) => {
    const heartButton = event.target.closest('.add-to-wishlist');

    if (!heartButton || !heartButton.dataset.movieId) return;

    const movieId = heartButton.dataset.movieId;
    const tvId = heartButton.dataset.tvId;

    if (!movieId && !tvId) return;

    const mediaType = movieId ? 'movie' : 'tv';
    const mediaId = movieId ? parseInt(movieId) : parseInt(tvId);
    
    const isFavorite = heartButton.classList.contains('wishlist-active');
    const newStatus = !isFavorite; 

    try {
        const options = {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'content-type': 'application/json',
                'Authorization': `Bearer ${BEARER_TOKEN}`
            },
            body: JSON.stringify({
                media_type: mediaType,
                media_id: mediaId,
                favorite: newStatus
            })
        };

        const response = await fetch(`https://api.themoviedb.org/3/account/${ACCOUNT_ID}/favorite`, options);
        const data = await response.json();

        if (data.success) {

            if (window.location.pathname.includes('wishlist.html') && !newStatus) {
                heartButton.closest('.movie-card').remove();
            } else {
                heartButton.classList.toggle('wishlist-active');
            }

            if (newStatus) {
                if (!favoritList.includes(mediaId)) favoritList.push(mediaId);
            } else {
                const index = favoritList.indexOf(mediaId);
                if (index > -1) favoritList.splice(index, 1);
            }

            console.log(`${mediaType === 'movie' ? 'Movie' : 'TV Series'} ${newStatus ? "Added" : "Removed"}`);
        }
    } catch (error) {
        console.error('Error updating TMDB favorite:', error);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    fetchMovies(currentPage);
});