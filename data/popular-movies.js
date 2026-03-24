const API_KEY = '9ec2995f36ec4c59498ad443ece4510e';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

let currentPage = 1;
let isFetching = false;


async function fetchMovies(page) {
    
    isFetching = true; 

    const API_URL = `${BASE_URL}/trending/movie/week?api_key=${API_KEY}&page=${page}`;

    try {
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        renderMovies(data.results);

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
            fetchMovies(currentPage);
        }
    }
});

fetchMovies(currentPage);