const menu = document.querySelector('#mobile-menu');
const menuLinks = document.querySelector('.navbar__menu');
const userDisplay = document.createElement('div');
userDisplay.className = 'navbar__user';

menu.addEventListener('click', function () {
    menu.classList.toggle('is-active');
    menuLinks.classList.toggle('active');
});

// Display username if logged in
function displayUsername() {
    const username = localStorage.getItem('username');
    console.log('Stored username:', username); // Add this line for debugging
    if (username && username !== "undefined") {
        userDisplay.textContent = `Welcome, ${username}`;
        document.querySelector('.navbar__container').appendChild(userDisplay);
    }
}

// Call the function to display username on page load
displayUsername();

// Logout functionality
const logoutButton = document.getElementById('logout-button');
if (logoutButton) {
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        alert('Logged out successfully');
        document.querySelector('.login-container').style.display = 'block';
        document.querySelector('.learnlist-container').style.display = 'none';
    });
}

// Sample video data
const videos = [
    { title: "Top Tips for English Pool Players", category: "englishpool", url: "https://www.youtube.com/embed/3GmLiK_Qwbc?start=72" },
    { title: "How to Win a Game of Pool", category: "englishpool", url: "https://www.youtube.com/embed/zPSYPuBdEC4?start=87" },
    { title: "Snooker Basics", category: "snooker", url: "https://www.youtube.com/embed/9ADf4MvQN_A" },
    { title: "Advanced Snooker Techniques", category: "snooker", url: "https://www.youtube.com/embed/LevAyoxZQDg" },
    { title: "Billiards - How to Play", category: "billiards", url: "https://www.youtube.com/embed/oulwP9N5D9s" },
    { title: "Professional Billiards - Watch the Best", category: "billiards", url: "https://www.youtube.com/embed/G13Orva4DFw" },
    { title: "American Pool for Beginners", category: "americanpool", url: "https://www.youtube.com/embed/WAr0maE00qA" },
    { title: "Professional American Pool Tips", category: "americanpool", url: "https://www.youtube.com/embed/7raN6I_KTus" }
];

const videoGrid = document.getElementById('video-grid');
const videoGridLogin = document.getElementById('video-grid-login');
const searchBar = document.getElementById('search-bar');
const searchBarLogin = document.getElementById('search-bar-login');
const categoryFilter = document.getElementById('category-filter');
const categoryFilterLogin = document.getElementById('category-filter-login');

// Function to display videos
function displayVideos(videosToDisplay, videoGridElement) {
    if (videoGridElement) {
        videoGridElement.innerHTML = '';
        videosToDisplay.forEach(video => {
            const videoCard = document.createElement('div');
            videoCard.classList.add('video-card');
            videoCard.innerHTML = `
                <iframe src="${video.url}" frameborder="0" allowfullscreen></iframe>
                <p>${video.title}</p>
            `;
            if (window.location.pathname.includes('Login.html')) {
                videoCard.innerHTML += `<button class="add-learnlist-btn" onclick="addToLearnlist('${video.title}', '${video.url}')">Add to my learnlist</button>`;
            }
            videoGridElement.appendChild(videoCard);
        });
    }
}

// Initial display
if (videoGrid) displayVideos(videos, videoGrid);
if (videoGridLogin) displayVideos(videos, videoGridLogin);

// Event listener for search bar
if (searchBar) {
    searchBar.addEventListener('input', () => {
        const searchTerm = searchBar.value.toLowerCase();
        const filteredVideos = videos.filter(video => video.title.toLowerCase().includes(searchTerm));
        displayVideos(filteredVideos, videoGrid);
    });
}

if (searchBarLogin) {
    searchBarLogin.addEventListener('input', () => {
        const searchTerm = searchBarLogin.value.toLowerCase();
        const filteredVideos = videos.filter(video => video.title.toLowerCase().includes(searchTerm));
        displayVideos(filteredVideos, videoGridLogin);
    });
}

// Event listener for category filter
if (categoryFilter) {
    categoryFilter.addEventListener('change', () => {
        const selectedCategory = categoryFilter.value;
        const filteredVideos = selectedCategory === 'all' ? videos : videos.filter(video => video.category === selectedCategory);
        displayVideos(filteredVideos, videoGrid);
    });
}

if (categoryFilterLogin) {
    categoryFilterLogin.addEventListener('change', () => {
        const selectedCategory = categoryFilterLogin.value;
        const filteredVideos = selectedCategory === 'all' ? videos : videos.filter(video => video.category === selectedCategory);
        displayVideos(filteredVideos, videoGridLogin);
    });
}

// Filter videos based on query parameter
const urlParams = new URLSearchParams(window.location.search);
const categoryParam = urlParams.get('category');
if (categoryParam) {
    if (categoryFilter) categoryFilter.value = categoryParam;
    if (categoryFilterLogin) categoryFilterLogin.value = categoryParam;
    const filteredVideos = videos.filter(video => video.category === categoryParam);
    if (videoGrid) displayVideos(filteredVideos, videoGrid);
    if (videoGridLogin) displayVideos(filteredVideos, videoGridLogin);
}

// Add to learnlist functionality
async function addToLearnlist(title, url) {
    const token = localStorage.getItem('token');
    const apiKey = localStorage.getItem('apiKey'); // Retrieve the API key from local storage
    const description = 'Video added from video resources'; // Adjust the description as needed

    try {
        const response = await fetch('http://localhost:3004/learnlist', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'x-api-key': apiKey // Include the API key in the request header
            },
            body: JSON.stringify({ token, title, description, url })
        });

        const data = await response.json();
        alert(data.message);
        displayLearnlist();
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while adding to learnlist. Please try again.');
    }
}

// Save learnlist functionality
async function saveLearnlist(title, description, url) {
    const token = localStorage.getItem('token');
    const apiKey = localStorage.getItem('apiKey'); // Retrieve the API key from local storage

    try {
        const response = await fetch('http://localhost:3004/save-learnlist', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'x-api-key': apiKey // Include the API key in the request header
            },
            body: JSON.stringify({ token, title, description, url })
        });

        const data = await response.json();
        alert(data.message);
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while saving the learnlist. Please try again.');
    }
}

// Carousel functionality for index.html
const carouselInner = document.getElementById('carousel-inner');
if (carouselInner) {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    let currentIndex = 0;

    function showSlide(index) {
        const slides = document.querySelectorAll('.carousel-item');
        if (index >= slides.length) currentIndex = 0;
        if (index < 0) currentIndex = slides.length - 1;
        carouselInner.style.transform = `translateX(${-currentIndex * 100}%)`;
    }

    prevBtn.addEventListener('click', () => {
        currentIndex--;
        showSlide(currentIndex);
    });

    nextBtn.addEventListener('click', () => {
        currentIndex++;
        showSlide(currentIndex);
    });

    // Initial display
    showSlide(currentIndex);

    // Auto cycle through carousel images
    setInterval(() => {
        currentIndex++;
        showSlide(currentIndex);
    }, 3000); // Change slide every 3 seconds
}

// Sample news data
const news = [
    { title: "Trump thumps O'Sullivan to book place in final", link: "https://www.bbc.co.uk/sport/snooker/articles/ce98gpq0qq5o" },
    { title: "Mark Williams enjoying pool more than snooker", link: "https://metro.co.uk/2024/04/01/mark-williams-enjoying-pool-snooker-eyes-8-ball-events-20568963/" },
    { title: "Six-time world snooker champion Reardon dies aged 91", link: "https://www.bbc.co.uk/sport/snooker/articles/cjewjqnqwv4o" },
    { title: "Pool player produces 'shot of the century'", link: "https://www.dailystar.co.uk/sport/other-sports/pool-player-houdini-trick-shot-32514928" }
];

const newsList = document.getElementById('news-list');

// Function to display news
function displayNews(newsItems) {
    if (newsList) {
        newsList.innerHTML = '';
        newsItems.forEach(newsItem => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `<a href="${newsItem.link}" target="_blank">${newsItem.title}</a>`;
            newsList.appendChild(listItem);
        });
    }
}

// Fetch learnlists from the API
async function fetchLearnlists() {
    try {
        const response = await fetch('http://localhost:4000/api/learnlists');
        const learnlists = await response.json();
        displayLearnlists(learnlists);
    } catch (err) {
        console.error('Error fetching learnlists:', err);
    }
}

// Call the fetch function when the page loads
document.addEventListener('DOMContentLoaded', fetchLearnlists);

// Initial display of news
displayNews(news);