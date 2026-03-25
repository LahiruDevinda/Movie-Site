import { selectedGenres, selectedYear } from "../utils/filter.js";
import { API_KEY, ACCOUNT_ID, BEARER_TOKEN } from "./userData.js";
import { favoritList, fectchFavoriteList } from "./wishlist.js";

const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const TV_GENRE_MAP = {
    "Action": 10759, // Action & Adventure
    "Adventure": 10759,
    "Animation": 16,
    "Comedy": 35,
    "Crime": 80,
    "Documentary": 99,
    "Drama": 18,
    "Family": 10751,
    "Kids": 10762,
    "Mystery": 9648,
    "Sci-Fi": 10765,
    "Thriller": 80
};

let currentPage = 1;
let isFetching = false;
let currentSearchTerm = '';

const loader = document.querySelector('.js-loading');

export async function fetchTVSeries(page, query = '') {
    
    loader.classList.remove('hidden');

    isFetching = true; 
    currentSearchTerm = query; 
    let API_URL = '';

    if (query !== '') {
        const encodedQuery = encodeURIComponent(query);
        API_URL = `${BASE_URL}/search/tv?api_key=${API_KEY}&query=${encodedQuery}&page=${page}`;
    } else if (selectedGenres.length > 0 || selectedYear !== 'ALL') {

        API_URL = `${BASE_URL}/discover/tv?api_key=${API_KEY}&page=${page}`;
        
        if (selectedGenres.length > 0) {

            const tvGenreIds = selectedGenres
                .map(name => TV_GENRE_MAP[name])
                .filter(id => id !== undefined);
            
            if (tvGenreIds.length > 0) {
                API_URL += `&with_genres=${tvGenreIds.join(',')}`;
            }
        }

        if (selectedYear !== 'ALL') {
            if (selectedYear.includes('-')) {
                const years = selectedYear.split('-');
                
                API_URL += `&first_air_date.gte=${years[1]}-01-01&first_air_date.lte=${years[0]}-12-31`;
            } else {
                API_URL += `&first_air_date_year=${selectedYear}`;
            }
        }
    } else {

        API_URL = `${BASE_URL}/trending/tv/week?api_key=${API_KEY}&page=${page}`;
    }

    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();

        if (page === 1) {
            const container = document.querySelector('.js-movies-container');
            if (container) container.innerHTML = '';
        }

        const cleanTVShows = data.results.filter(tv => tv.poster_path !== null);
        renderTVSeries(cleanTVShows);

    } catch (error) {
        console.error('Error fetching TV series:', error);
    } finally {
        isFetching = false; 
        loader.classList.add('hidden');
    }
}

function renderTVSeries(tvArray) {
    let tvHTML = '';

    tvArray.forEach((tv) => {
        const imagePath = tv.poster_path 
            ? `${IMAGE_BASE_URL}${tv.poster_path}` 
            : 'images/movie-thumbnails/concept-cinema-with-film-elements.jpg'; 

        const title = tv.name || tv.original_name;
        const year = tv.first_air_date ? tv.first_air_date.substring(0, 4) : 'N/A';
        const rating = tv.vote_average ? tv.vote_average.toFixed(1) : 'NR';

        const isFavorite = favoritList.includes(tv.id);
        const heartClass = isFavorite ? 'wishlist-active' : '';

        tvHTML += `
            <div class="movie-card">
                <img class="movie-card-image" src="${imagePath}" alt="${title}">
                <div class="movie-card-details">
                    <div class="movie-name">${title}</div>
                    <div class="movie-data">
                        <div class="movie-year-rate">
                            <span class="year">${year}</span>
                            <img class="star" src="images/movie-card/star.svg">
                            <span class="rating">${rating}</span>
                        </div>
                        <button class="add-to-wishlist ${heartClass}" data-tv-id="${tv.id}">
                            <img src="images/movie-card/heart.svg">
                        </button>
                    </div> 
                </div>
            </div>
        `;
    });

    const container = document.querySelector('.js-movies-container');
    if (container) container.innerHTML += tvHTML;
}

window.addEventListener('scroll', () => {
    const scrollPosition = window.innerHeight + window.scrollY;
    const bodyHeight = document.body.offsetHeight;

    if (scrollPosition >= bodyHeight - 500 && !isFetching) {
        currentPage++; 
        fetchTVSeries(currentPage, currentSearchTerm); 
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    await fectchFavoriteList();
    fetchTVSeries(currentPage);
});

document.body.addEventListener('click', async (event) => {
    const heartButton = event.target.closest('.add-to-wishlist');

    if (!heartButton || !heartButton.dataset.tvId) return;

    const tvId = parseInt(heartButton.dataset.tvId);
    const isFavorite = heartButton.classList.contains('wishlist-active');
    
    heartButton.classList.toggle('wishlist-active');

    try {
        const options = {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'content-type': 'application/json',
                'Authorization': `Bearer ${BEARER_TOKEN}`
            },
            body: JSON.stringify({
                media_type: 'tv',
                media_id: tvId,
                favorite: !isFavorite
            })
        };

        const response = await fetch(`https://api.themoviedb.org/3/account/${ACCOUNT_ID}/favorite`, options);
        const data = await response.json();

        if (data.success) {
            console.log(`TV Series ${!isFavorite ? "Added" : "Removed"}`);
        } else {
            heartButton.classList.toggle('wishlist-active');
        }

    } catch (error) {
        heartButton.classList.toggle('wishlist-active');
        console.error('TV Error:', error);
    }
});