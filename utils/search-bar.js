import { fetchMovies } from "../data/popular-movies.js";

let currentSearchTerm = '';
let currentPage = 1;

const searchBar = document.querySelector('.js-search-bar');
const searchButton = document.querySelector('.js-search-button');

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

searchButton.addEventListener('click', () => {
    handleSearch();
});

searchBar.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        handleSearch();
    }
});