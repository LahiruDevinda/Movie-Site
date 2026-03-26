import { API_KEY } from "./userData.js";

const popup = document.querySelector('.pop-up'); 
const loading = document.querySelector('.loading');
const movieDetails = document.querySelector('.movie-details');

async function getMoviePopUpDetails(id) {
    movieDetails.classList.add('hidden-movie-details');
    loading.classList.remove('hidden-js-popup-loading');

    try {
        const response = await fetch(`https://api.themoviedb.org/3/tv/${id}?api_key=${API_KEY}&language=en-US`);
        const data = await response.json();

        document.querySelector('.js-title').textContent = data.name;
        document.querySelector('.js-description').textContent = data.overview;
        document.querySelector('.js-genre-content').textContent = data.genres.map(g => g.name).join(', ');
        document.querySelector('.js-release-date-section').textContent = data.release_date;
        document.querySelector('.js-language-content').textContent = data.original_language.toUpperCase();
        document.querySelector('.js-rating-content').textContent = data.vote_average.toFixed(1);

        const posterPath = `https://image.tmdb.org/t/p/w500${data.poster_path}`;
        document.querySelector('.movie-image').src = posterPath;

        const button = document.querySelector('.js-site-link-button');
        button.onclick = () => {
            if (data.homepage) window.open(data.homepage, '_blank');
            else alert("No official website available.");
        };

    } catch (error) {
        console.error("Error:", error);
    } finally {
        loading.classList.add('hidden-js-popup-loading');
        movieDetails.classList.remove('hidden-movie-details');
    }
}

document.addEventListener('click', (event) => {

    const card = event.target.closest('.movie-card');
    const isWishlist = event.target.closest('.add-to-wishlist');

    if (card && !isWishlist) {
        const movieId = card.dataset.movieId;
        if (popup) {
            popup.classList.remove('hidden-popup');
            getMoviePopUpDetails(movieId);
        }
    }

    if (event.target.closest('.js-movie-details-close')) {
        if (popup) popup.classList.add('hidden-popup');
    }
});

popup.addEventListener('click', (event) => {
    if (event.target === popup) {
        popup.classList.add('hidden-popup');
    }
});