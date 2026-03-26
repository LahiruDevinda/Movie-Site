import { API_KEY, ACCOUNT_ID, BEARER_TOKEN } from "./userData.js";
import { favoritList, fectchFavoriteList } from "./wishlist.js";

const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

let currentPage = 1;
let isFetching = false;
let currentSearchTerm = '';

export async function fetchMovies(page, query = '') {
    isFetching = true; 
    currentSearchTerm = query;
    let API_URL = '';

    if (query !== '') {
        const encodedQuery = encodeURIComponent(query);
        API_URL = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodedQuery}&page=${page}`;
    } else {
        API_URL = `${BASE_URL}/trending/movie/week?api_key=${API_KEY}&page=${page}`;
    }

    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();

        if (page === 1) {
            const container = document.querySelector('.js-movies-container');
            if (container) container.innerHTML = '';
        }

        const cleanMovies = data.results.filter(movie => movie.poster_path !== null && movie.vote_count > 10);
        renderMovies(cleanMovies);

    } catch (error) {
        console.error('Error fetching movies:', error);
    } finally {
        isFetching = false; 
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

    const container = document.querySelector('.js-movies-container');
    if (container) container.innerHTML += moviesHTML;
}

window.addEventListener('scroll', () => {
    const scrollPosition = window.innerHeight + window.scrollY;
    const bodyHeight = document.body.offsetHeight;

    if (scrollPosition >= bodyHeight - 500 && !isFetching) {
        currentPage++; 
        fetchMovies(currentPage, currentSearchTerm); 
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    await fectchFavoriteList();
    
    fetchMovies(currentPage);

    document.body.addEventListener('click', async (event) => {
        const heartButton = event.target.closest('.add-to-wishlist');
        if (!heartButton) return;

        const movieId = parseInt(heartButton.dataset.movieId);
        const isCurrentlyFavorite = heartButton.classList.contains('wishlist-active');
        const newStatus = !isCurrentlyFavorite; 

        try {
            const response = await fetch(`https://api.themoviedb.org/3/account/${ACCOUNT_ID}/favorite`, {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'content-type': 'application/json',
                    'Authorization': `Bearer ${BEARER_TOKEN}`
                },
                body: JSON.stringify({
                    media_type: 'movie',
                    media_id: movieId,
                    favorite: newStatus
                })
            });

            const data = await response.json();

            if (data.success) {
                if (newStatus) {
                    favoritList.push(movieId);
                } else {
                    const index = favoritList.indexOf(movieId);
                    if (index > -1) favoritList.splice(index, 1);
                }

                if (window.location.pathname.includes('wishlist.html') && !newStatus) {
                    heartButton.closest('.movie-card').remove();
                } else {
                    heartButton.classList.toggle('wishlist-active');
                }
                
                console.log(newStatus ? "Added to TMDB" : "Removed from TMDB");
            }
        } catch (error) {
            console.error('Error updating TMDB favorite:', error);
        }
    });
});