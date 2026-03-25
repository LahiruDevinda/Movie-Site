import { ACCOUNT_ID, BEARER_TOKEN } from "./userData.js";

export let favoritList = [];

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const moviesContainer = document.querySelector('.js-movie-container');
const loader = document.querySelector('.js-loading');

async function fetchFavorites() {
    
    loader.classList.remove('hidden');
    moviesContainer.classList.add('hidden');

    const movieUrl = `https://api.themoviedb.org/3/account/${ACCOUNT_ID}/favorite/movies?language=en-US&page=1&sort_by=created_at.desc`;
    const tvUrl = `https://api.themoviedb.org/3/account/${ACCOUNT_ID}/favorite/tv?language=en-US&page=1&sort_by=created_at.desc`;
    
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: `Bearer ${BEARER_TOKEN}`
        }
    };

    try {
       
        const [movieRes, tvRes] = await Promise.all([
            fetch(movieUrl, options),
            fetch(tvUrl, options)
        ]);

        const movieData = await movieRes.json();
        const tvData = await tvRes.json();

        const combinedResults = [...(movieData.results || []), ...(tvData.results || [])];
        
        renderMovies(combinedResults); 
        
    } catch (error) {
        console.error('Error fetching favorites list:', error);
    }finally {
        loader.classList.add('hidden');
        moviesContainer.classList.remove('hidden');
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
            
            const displayName = movie.title || movie.name || "Unknown Title";
            
            const dateSource = movie.release_date || movie.first_air_date || '';
            const year = dateSource ? dateSource.substring(0, 4) : 'N/A';
            
            const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'NR';

            const isTV = movie.first_air_date !== undefined || movie.name !== undefined;
            const idAttribute = isTV ? `data-tv-id="${movie.id}"` : `data-movie-id="${movie.id}"`;

            moviesHTML += `
                <div class="movie-card">
                    <img class="movie-card-image" src="${imagePath}" alt="${displayName}">
                    <div class="movie-card-details">
                        <div class="movie-name">${displayName}</div>
                        <div class="movie-data">
                            <div class="movie-year-rate">
                                <span class="year">${year}</span>
                                <img class="star" src="images/movie-card/star.svg">
                                <span class="rating">${rating}</span>
                            </div>
                            <button class="add-to-wishlist wishlist-active" ${idAttribute} data-media-type="${isTV ? 'tv' : 'movie'}">
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

        const mediaId = heartButton.dataset.movieId || heartButton.dataset.tvId;
        const mediaType = heartButton.dataset.mediaType;

        try {
            const options = {
                method: 'POST',
                headers: {
                    accept: 'application/json',
                    'content-type': 'application/json',
                    Authorization: `Bearer ${BEARER_TOKEN}`
                },
                body: JSON.stringify({
                    media_type: mediaType,
                    media_id: parseInt(mediaId),
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
    const movieUrl = `https://api.themoviedb.org/3/account/${ACCOUNT_ID}/favorite/movies?language=en-US&sort_by=created_at.asc&page=1`;
    const tvUrl = `https://api.themoviedb.org/3/account/${ACCOUNT_ID}/favorite/tv?language=en-US&sort_by=created_at.asc&page=1`;
    
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: `Bearer ${BEARER_TOKEN}`
        }
    };

    try {
        const [movieRes, tvRes] = await Promise.all([
            fetch(movieUrl, options),
            fetch(tvUrl, options)
        ]);

        const movieData = await movieRes.json();
        const tvData = await tvRes.json();

        const movieIds = movieData.results.map(movie => movie.id);
        const tvIds = tvData.results.map(tv => tv.id);

        favoritList = [...movieIds, ...tvIds]; 
        return favoritList;
    } catch (error) {
        console.error("Error fetching combined favorites:", error);
        return [];
    }
}

fetchFavorites();