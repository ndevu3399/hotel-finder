const API_URL = "http://localhost:3001/hotels"; 

document.addEventListener("DOMContentLoaded", async () => {
    showLoading(true);
    await fetchHotels();
    setupEventListeners();
    applyStoredPreferences();
    showLoading(false);
});

async function fetchHotels() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Failed to fetch hotels.");
        
        const hotels = await response.json();
        localStorage.setItem("hotels", JSON.stringify(hotels));
        displayHotels(hotels);
    } catch (error) {
        console.error("Error fetching hotels:", error);
        showToast("Error fetching hotels. Please try again!", "error");
        document.getElementById("hotel-list").innerHTML = "<p class='error'>⚠️ Failed to load hotels.</p>";
    }
}

function displayHotels(hotels) {
    const hotelList = document.getElementById("hotel-list");
    hotelList.innerHTML = hotels.length ? "" : "<p>No hotels available.</p>";

    hotels.forEach(hotel => {
        const hotelCard = document.createElement("div");
        hotelCard.classList.add("hotel-card");
        hotelCard.innerHTML = `
            <img src="./images/${hotel.image}" alt="${hotel.name}">
            <div class="hotel-info">
                <h3>${hotel.name}</h3>
                <p>Price: <strong>$${hotel.price}</strong> per night</p>
                <p>Availability: 
                    <span class="${hotel.availability ? 'available' : 'unavailable'}">
                        ${hotel.availability ? "Available" : "Not Available"}
                    </span>
                </p>
                <button class="delete-btn" data-id="${hotel.id}">Delete</button>
            </div>
        `;
        hotelList.appendChild(hotelCard);
    });

    setupDeleteButtons();
}

function sortHotels(order) {
    let hotels = JSON.parse(localStorage.getItem("hotels")) || [];
    
    if (order !== "default") {
        hotels.sort((a, b) => order === "low-to-high" ? a.price - b.price : b.price - a.price);
    }

    localStorage.setItem("sortOrder", order);
    return hotels;
}

function filterHotels(availability, hotels) {
    if (availability === "available") {
        hotels = hotels.filter(hotel => hotel.availability);
    }

    localStorage.setItem("availabilityFilter", availability);
    return hotels;
}

function applyFilters() {
    const sortOrder = document.getElementById("sort").value;
    const availabilityFilter = document.getElementById("availability").value;

    let hotels = JSON.parse(localStorage.getItem("hotels")) || [];
    hotels = sortHotels(sortOrder);
    hotels = filterHotels(availabilityFilter, hotels);

    displayHotels(hotels);
}

function setupEventListeners() {
    document.getElementById("filter-btn").addEventListener("click", applyFilters);
    document.getElementById("sort").addEventListener("change", applyFilters);
}

function applyStoredPreferences() {
    const sortOrder = localStorage.getItem("sortOrder") || "default";
    const availabilityFilter = localStorage.getItem("availabilityFilter") || "all";

    document.getElementById("sort").value = sortOrder;
    document.getElementById("availability").value = availabilityFilter;

    applyFilters();
}

function setupDeleteButtons() {
    document.querySelectorAll(".delete-btn").forEach(button => {
        button.addEventListener("click", async (event) => {
            const hotelId = event.target.getAttribute("data-id");
            if (confirm("Are you sure you want to delete this hotel?")) {
                await deleteHotel(hotelId);
            }
        });
    });
}

async function deleteHotel(hotelId) {
    try {
        const response = await fetch(`${API_URL}/${hotelId}`, { method: "DELETE" });
        if (!response.ok) throw new Error("Failed to delete hotel.");
        
        let hotels = JSON.parse(localStorage.getItem("hotels")) || [];
        hotels = hotels.filter(hotel => hotel.id !== parseInt(hotelId));
        localStorage.setItem("hotels", JSON.stringify(hotels));

        displayHotels(hotels);
        showToast("Hotel deleted successfully!", "success");
    } catch (error) {
        console.error("Error deleting hotel:", error);
        showToast("Error deleting hotel. Try again!", "error");
    }
}

function showLoading(isLoading) {
    const loadingElement = document.getElementById("loading");
    if (loadingElement) {
        loadingElement.style.display = isLoading ? "block" : "none";
    }
}

function showToast(message, type) {
    const toast = document.createElement("div");
    toast.classList.add("toast", type);
    toast.textContent = message;

    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}
