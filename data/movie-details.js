import { API_KEY } from "./userData.js";

const popup = document.querySelector('.pop-up');
const loading = document.querySelector('.js-loading');
const movieDetails = document.querySelector('.movie-details');

async function getPopUpDetails(id, mediaType) {
    movieDetails.classList.add('hidden-movie-details');
    loading.classList.remove('hidden-loading');

    try {
        const response = await fetch(
            `https://api.themoviedb.org/3/${mediaType}/${id}?api_key=${API_KEY}&language=en-US`
        );
        const data = await response.json();

        document.querySelector('.js-title').textContent =
            data.title || data.name || 'Untitled';

        document.querySelector('.js-description').textContent =
            data.overview || 'No description available.';

        document.querySelector('.js-genre-content').textContent =
            data.genres?.map(g => g.name).join(', ') || 'N/A';

        document.querySelector('.js-release-date-section').textContent =
            data.release_date || data.first_air_date || 'N/A';

        document.querySelector('.js-language-content').textContent =
            data.original_language ? data.original_language.toUpperCase() : 'N/A';

        document.querySelector('.js-rating-content').textContent =
            data.vote_average ? data.vote_average.toFixed(1) : 'NR';

        const posterPath = data.poster_path
            ? `https://image.tmdb.org/t/p/w500${data.poster_path}`
            : 'images/movie-thumbnails/concept-cinema-with-film-elements.jpg';

        document.querySelector('.movie-image').src = posterPath;

        const button = document.querySelector('.js-site-link-button');
        button.onclick = () => {
            if (data.homepage) {
                window.open(data.homepage, '_blank');
            } else {
                alert("No official website available.");
            }
        };

    } catch (error) {
        console.error("Error:", error);
    } finally {
        loading.classList.add('hidden-loading');
        movieDetails.classList.remove('hidden-movie-details');
    }
}

document.addEventListener('click', (event) => {
    const card = event.target.closest('.movie-card');
    const isWishlistButton = event.target.closest('.add-to-wishlist');

    if (card && !isWishlistButton) {
        let mediaType = 'movie';
        let mediaId = card.dataset.movieId;

        if (card.dataset.tvId) {
            mediaType = 'tv';
            mediaId = card.dataset.tvId;
        }

        if (card.dataset.mediaType) {
            mediaType = card.dataset.mediaType;
        }

        if (popup && mediaId) {
            popup.classList.remove('hidden-popup');
            getPopUpDetails(mediaId, mediaType);
        }
    }

    if (event.target.closest('.js-movie-details-close')) {
        if (popup) popup.classList.add('hidden-popup');
    }
});