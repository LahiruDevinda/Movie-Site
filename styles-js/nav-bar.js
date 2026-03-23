const menuOpen = document.querySelector('.menu-open');
const menuClose = document.querySelector('.close-btn');
const navLinks = document.querySelector('.links');

menuOpen.addEventListener('click', () => {
    navLinks.classList.add('show-menu');
});

menuClose.addEventListener('click', () => {
    navLinks.classList.remove('show-menu');
});