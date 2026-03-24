import { API_KEY } from "./userData.js";

const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

let currentPage = 1;
let isFetching = false;
let currentSearchTerm = '';

export async function fetchMovies(page, query = '') {
    isFetching = true; 
    let API_URL = '';

    if (query !== '') {
        
        const encodedQuery = encodeURIComponent(query);
        API_URL = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodedQuery}&page=${page}`;
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

        const cleanMovies = data.results.filter((movie) => {
            return movie.poster_path !== null && movie.vote_count > 10;
        });
        
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

        moviesHTML += `
            <div class="movie-card">
                <img class="movie-card-image" src="${imagePath}" alt="${movie.title}">
                <div class="movie-card-details">
                    <div class="movie-name">
                        ${movie.title || movie.name}
                    </div>
                    <div class="movie-data">
                        <div class="movie-year-rate">
                            <span class="year">${year}</span>
                            <img class="star" src="images/movie-card/star.svg">
                            <span class="rating">${rating}</span>
                        </div>

                        <button class="add-to-wishlist" data-movie-id="${movie.id}">
                            <img src="images/movie-card/heart.svg">
                        </button>
                    </div> 
                </div>
            </div>
        `;
    });

    document.querySelector('.js-movies-container').innerHTML += moviesHTML;
}

window.addEventListener('scroll', () => {

    const scrollPosition = window.innerHeight + window.scrollY;
    const bodyHeight = document.body.offsetHeight;

    if (scrollPosition >= bodyHeight - 500) {
        if (!isFetching) {
            currentPage++; 
            console.log(`Loading page ${currentPage}...`);
            
            fetchMovies(currentPage, currentSearchTerm); 
        }
    }
});

fetchMovies(currentPage);

document.addEventListener('DOMContentLoaded', () => {
    
    fetchMovies(currentPage);

    document.body.addEventListener('click', (event) => {

        const heartButton = event.target.closest('.add-to-wishlist');
        
        if (!heartButton) return;

        const movieId = String(heartButton.dataset.movieId);
        let wishlist = JSON.parse(localStorage.getItem('movieWishlist')) || [];

        if (wishlist.includes(movieId)) {
            wishlist = wishlist.filter(id => id !== movieId);
            heartButton.classList.remove('wishlist-active');
            console.log(`Removed movie ${movieId}`);
        } else {
            wishlist.push(movieId);
            heartButton.classList.add('wishlist-active');
            console.log(`Saved movie ${movieId}`);
        }

        localStorage.setItem('movieWishlist', JSON.stringify(wishlist));
    });
});