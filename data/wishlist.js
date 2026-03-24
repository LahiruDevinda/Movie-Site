import { ACCOUNT_ID,BEARER_TOKEN } from "./userData.js";

export let wishlist = JSON.parse(localStorage.getItem('movieWishlist')) || [];

const moviesContainer = document.querySelector('.movies-container'); 

moviesContainer.addEventListener('click', async (event) => {
    
    const heartButton = event.target.closest('.add-to-wishlist');
    if (!heartButton) return;

    const movieId = heartButton.dataset.movieId;

    const isAlreadyFavorited = heartButton.classList.contains('wishlist-active');

    const newFavoriteState = !isAlreadyFavorited; 

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
                favorite: newFavoriteState
            })
        };

        const response = await fetch(`https://api.themoviedb.org/3/account/${ACCOUNT_ID}/favorite`, options);
        const data = await response.json();

        if (data.success) {
            
            heartButton.classList.toggle('wishlist-active');
            
            if (newFavoriteState) {
                console.log(`Added Movie ID ${movieId} to Favorites!`);
            } else {
                console.log(`Removed Movie ID ${movieId} from Favorites!`);
            }
        } else {
            console.error('TMDB rejected the request:', data);
        }

    } catch (error) {
        console.error('Error saving movie:', error);
    }
});