document.addEventListener("DOMContentLoaded", () => {
    const hotelList = document.getElementById("hotel-list");
    const sortSelect = document.getElementById("sort");
    const filterCheckbox = document.getElementById("filter");

    const API_URL = "http://localhost:3001/hotels";

    
    function fetchHotels() {
        fetch(API_URL)
            .then(response => response.json())
            .then(data => {
                localStorage.setItem("hotels", JSON.stringify(data)); // Store in localStorage
                displayHotels(data);
            })
            .catch(error => console.error("Error fetching hotels:", error));
    }

    
    function displayHotels(hotels) {
        hotelList.innerHTML = "";
        hotels.forEach(hotel => {
            const hotelItem = document.createElement("div");
            hotelItem.classList.add("hotel");
            hotelItem.innerHTML = `
                <img src="${hotel.image}" alt="${hotel.name}">
                <h2>${hotel.name}</h2>
                <p>Price: $${hotel.price}</p>
                <p>Availability: ${hotel.available ? "Available" : "Sold Out"}</p>
                <button class="delete-btn" data-id="${hotel.id}">Delete</button>
            `;
            hotelList.appendChild(hotelItem);
        });
    }

    
    function sortHotels(order) {
        let hotels = JSON.parse(localStorage.getItem("hotels")) || [];
        hotels.sort((a, b) => (order === "low-to-high" ? a.price - b.price : b.price - a.price));
        localStorage.setItem("sortedHotels", JSON.stringify(hotels)); // Save sort preference
        displayHotels(hotels);
    }

    
    function filterHotels() {
        let hotels = JSON.parse(localStorage.getItem("hotels")) || [];
        if (filterCheckbox.checked) {
            hotels = hotels.filter(hotel => hotel.available);
        }
        displayHotels(hotels);
    }

    
    function deleteHotel(id) {
        fetch(`${API_URL}/${id}`, { method: "DELETE" })
            .then(() => {
                let hotels = JSON.parse(localStorage.getItem("hotels")) || [];
                hotels = hotels.filter(hotel => hotel.id !== id);
                localStorage.setItem("hotels", JSON.stringify(hotels));
                displayHotels(hotels);
            })
            .catch(error => console.error("Error deleting hotel:", error));
    }

    
    sortSelect.addEventListener("change", () => sortHotels(sortSelect.value));
    filterCheckbox.addEventListener("change", filterHotels);
    hotelList.addEventListener("click", (event) => {
        if (event.target.classList.contains("delete-btn")) {
            const hotelId = parseInt(event.target.dataset.id);
            deleteHotel(hotelId);
        }
    });

    
    fetchHotels();
});
