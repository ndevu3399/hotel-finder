const API_URL = "http://localhost:3001/hotels"; 

document.addEventListener("DOMContentLoaded", () => {
    fetchHotels();
    setupEventListeners();
});

// Fetch hotels from API
function fetchHotels() {
    fetch(API_URL)
        .then(response => response.json())
        .then(hotels => {
            localStorage.setItem("hotels", JSON.stringify(hotels)); 
            displayHotels(hotels);
        })
        .catch(error => console.error("Error fetching hotels:", error));
}


function displayHotels(hotels) {
    const hotelList = document.getElementById("hotel-list");
    hotelList.innerHTML = ""; 

    hotels.forEach(hotel => {
        const hotelCard = document.createElement("div");
        hotelCard.classList.add("hotel-card");
        hotelCard.innerHTML = `
            <img src="${hotel.image}" alt="${hotel.name}">
            <h3>${hotel.name}</h3>
            <p>Price: $${hotel.price} per night</p>
            <p>Availability: <span class="${hotel.available ? 'available' : 'not-available'}">
                ${hotel.available ? "Available" : "Not Available"}
            </span></p>
            <button class="delete-btn" data-id="${hotel.id}">Delete</button>
        `;
        hotelList.appendChild(hotelCard);
    });

    setupDeleteButtons();
}


function sortHotels(order) {
    let hotels = JSON.parse(localStorage.getItem("hotels")) || [];
    
    if (order === "low-to-high") {
        hotels.sort((a, b) => a.price - b.price);
    } else if (order === "high-to-low") {
        hotels.sort((a, b) => b.price - a.price);
    }

    localStorage.setItem("sortOrder", order); 
    displayHotels(hotels);
}


function filterHotels(availability) {
    let hotels = JSON.parse(localStorage.getItem("hotels")) || [];

    if (availability === "available") {
        hotels = hotels.filter(hotel => hotel.available);
    } else if (availability === "all") {
        hotels = JSON.parse(localStorage.getItem("hotels")); // Restore full list
    }

    localStorage.setItem("availabilityFilter", availability); // Store filter preference
    displayHotels(hotels);
}


function setupEventListeners() {
    const sortSelect = document.getElementById("sort");
    const filterSelect = document.getElementById("availability");

    sortSelect.addEventListener("change", () => sortHotels(sortSelect.value));
    filterSelect.addEventListener("change", () => filterHotels(filterSelect.value));

    applyStoredPreferences(); 
}


function applyStoredPreferences() {
    const sortOrder = localStorage.getItem("sortOrder");
    const availabilityFilter = localStorage.getItem("availabilityFilter");

    if (sortOrder) {
        document.getElementById("sort").value = sortOrder;
        sortHotels(sortOrder);
    }
    if (availabilityFilter) {
        document.getElementById("availability").value = availabilityFilter;
        filterHotels(availabilityFilter);
    }
}


function setupDeleteButtons() {
    document.querySelectorAll(".delete-btn").forEach(button => {
        button.addEventListener("click", (event) => {
            const hotelId = event.target.getAttribute("data-id");
            deleteHotel(hotelId);
        });
    });
}

// Delete a hotel
function deleteHotel(hotelId) {
    fetch(`${API_URL}/${hotelId}`, {
        method: "DELETE"
    })
    .then(response => {
        if (response.ok) {
            let hotels = JSON.parse(localStorage.getItem("hotels")) || [];
            hotels = hotels.filter(hotel => hotel.id !== parseInt(hotelId));
            localStorage.setItem("hotels", JSON.stringify(hotels)); // Update localStorage
            displayHotels(hotels); // Re-render hotels
        } else {
            console.error("Failed to delete hotel.");
        }
    })
    .catch(error => console.error("Error deleting hotel:", error));
}
