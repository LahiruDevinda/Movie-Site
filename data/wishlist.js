import { ACCOUNT_ID, BEARER_TOKEN } from "./userData.js";

export let favoritList = [];

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const moviesContainer = document.querySelector('.js-movie-container');

async function fetchFavorites() {
    const url = `https://api.themoviedb.org/3/account/${ACCOUNT_ID}/favorite/movies?language=en-US&page=1&sort_by=created_at.desc`;
    
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: `Bearer ${BEARER_TOKEN}`
        }
    };

    try {
        const response = await fetch(url, options);
        const data = await response.json();
        
        
        renderMovies(data.results || []); 
        
    } catch (error) {
        console.error('Error fetching favorites list:', error);
    }
}

function renderMovies(moviesArray) {
    
    if (!moviesContainer) return;

    if (moviesArray.length > 0) {
        let moviesHTML = '';

        moviesArray.forEach((movie) => {
            const imagePath = movie.poster_path 
                ? `${IMAGE_BASE_URL}${movie.poster_path}` 
                : 'images/movie-thumbnails/concept-cinema-with-film-elements.jpg'; 
            
            const year = movie.release_date ? movie.release_date.substring(0, 4) : 'N/A';
            const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'NR';

            moviesHTML += `
                <div class="movie-card">
                    <img class="movie-card-image" src="${imagePath}" alt="${movie.title}">
                    <div class="movie-card-details">
                        <div class="movie-name">${movie.title || movie.name}</div>
                        <div class="movie-data">
                            <div class="movie-year-rate">
                                <span class="year">${year}</span>
                                <img class="star" src="images/movie-card/star.svg">
                                <span class="rating">${rating}</span>
                            </div>
                            <button class="add-to-wishlist wishlist-active" data-movie-id="${movie.id}">
                                <img src="images/movie-card/heart.svg">
                            </button>
                        </div> 
                    </div>
                </div>
            `;
        });

        moviesContainer.innerHTML = moviesHTML;

    } else {
        moviesContainer.innerHTML = `<h3 style="color: white; text-align: center; width: 100%;">Your wishlist is currently empty.</h3>`;
    }
}

if (moviesContainer) {
    moviesContainer.addEventListener('click', async (event) => {
        const heartButton = event.target.closest('.add-to-wishlist');
        if (!heartButton) return;

        const movieId = heartButton.dataset.movieId;

        try {
            const options = {
                method: 'POST',
                headers: {
                    accept: 'application/json',
                    'content-type': 'application/json',
                    Authorization: `Bearer ${BEARER_TOKEN}`
                },
                body: JSON.stringify({
                    media_type: 'movie',
                    media_id: parseInt(movieId),
                    favorite: false
                })
            };

            const response = await fetch(`https://api.themoviedb.org/3/account/${ACCOUNT_ID}/favorite`, options);
            const data = await response.json();

            if (data.success) {
                
                heartButton.closest('.movie-card').remove();
                
                if (moviesContainer.querySelectorAll('.movie-card').length === 0) {
                    moviesContainer.innerHTML = `<h3 style="color: white; text-align: center; width: 100%;">Your wishlist is currently empty.</h3>`;
                }
            }
        } catch (error) {
            console.error('Error removing favorite:', error);
        }
    });
}

export async function fectchFavoriteList() {
    const url = `https://api.themoviedb.org/3/account/${ACCOUNT_ID}/favorite/movies?language=en-US&sort_by=created_at.asc&page=1`;
    
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: `Bearer ${BEARER_TOKEN}`
        }
    };

    try {
        const response = await fetch(url, options);
        const data = await response.json();
        favoritList = data.results.map(movie => movie.id); 
        return favoritList;
    } catch (error) {
        console.error("Error fetching favorites:", error);
        return [];
    }
}

fetchFavorites();