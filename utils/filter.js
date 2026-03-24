import { fetchMovies } from "../data/movies.js";

export let selectedGenres = [];
export let selectedYear = 'ALL';

let currentSearchTerm = '';
let currentPage = 1;
let isAdult = false;

const genreMap = {
    "Action": 28, "Adventure": 12, "Biography": 36, "Comedy": 35, 
    "Crime": 80, "Drama": 18, "Fantasy": 14, "History": 36, 
    "Horror": 27, "Sci-Fi": 878, "Thriller": 53
};

const searchBar = document.querySelector('.js-filter-search-bar');
const genreButtons = document.querySelectorAll('.js-genre');
const adultButton = document.querySelector('.js-adult-button');
const filterYear = document.querySelector('.js-filter-year');
const clearButton = document.querySelector('.js-clear-button');

function handleSearch() {
    const searchTerm = searchBar.value.trim();

    if (searchTerm !== '') {
        
        currentSearchTerm = searchTerm;
        currentPage = 1;
        
        fetchMovies(currentPage, currentSearchTerm);
    } else {

        currentSearchTerm = '';
        currentPage = 1;
        fetchMovies(currentPage, '');
    }
}

searchBar.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        handleSearch();
    }
});

genreButtons.forEach((button) => {
    button.addEventListener('click', () => {
        
        const genreName = button.innerText;
        const genreId = genreMap[genreName];

        
        if (!selectedGenres.includes(genreId)) {
            selectedGenres.push(genreId);
            button.classList.add('genre-active');
        } else {
            const index = selectedGenres.indexOf(genreId);
            selectedGenres.splice(index, 1);
            button.classList.remove('genre-active');
        }
        
        currentPage = 1;
        fetchMovies(currentPage);
    });
});

adultButton.addEventListener('click', () => {
    isAdult = !isAdult;
    adultButton.classList.toggle('genre-active');

    currentPage = 1;
    fetchMovies(currentPage);
});

filterYear.addEventListener('change', (event) => {
    selectedYear = event.target.value;

    currentPage = 1;
    fetchMovies(currentPage);
});

clearButton.addEventListener('click', () => {
    selectedGenres = [];

    genreButtons.forEach((button) => {
        button.classList.remove('genre-active');
    });

    selectedYear = 'ALL';
    document.querySelector('.js-filter-year').value = 'ALL';

    currentPage = 1;
    fetchMovies(currentPage);
});