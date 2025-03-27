document.addEventListener("DOMContentLoaded", () => {
    const hotelsContainer = document.getElementById("hotels-list");
    const citySelect = document.getElementById("city-select");
    const availabilityFilter = document.getElementById("availability-filter");
    const searchInput = document.getElementById("search-hotel");
    const sortSelect = document.getElementById("sort-price");
    const imageUrl = hotel.image ? hotel.image : "images/default-hotel.jpg";


    if (!hotelsContainer || !citySelect || !availabilityFilter || !searchInput || !sortSelect) {
        console.error("One or more required elements are missing.");
        return;
    }

    let allHotels = [];

    async function fetchHotels() {
        try {
            hotelsContainer.innerHTML = "<p>Loading hotels...</p>"; 
            const response = await fetch("http://localhost:3000/hotels");
            if (!response.ok) throw new Error("Failed to fetch hotels");

            const data = await response.json();
            allHotels = data;
            populateCityOptions(data);
            filterHotels();
        } catch (error) {
            console.error("Error fetching hotels:", error);
            hotelsContainer.innerHTML = "<p class='error'>Failed to load hotels. Please try again later.</p>";
        }
    }

    function populateCityOptions(hotels) {
        const cities = new Set(hotels.map(hotel => hotel.location));
        citySelect.innerHTML = '<option value="all">All Cities</option>';

        cities.forEach(city => {
            const option = document.createElement("option");
            option.value = city;
            option.textContent = city;
            citySelect.appendChild(option);
        });

        if (cities.size > 0) {
            citySelect.value = [...cities][0];
        }
    }

    function displayHotels(hotels) {
        hotelsContainer.innerHTML = "";

        if (!hotels || hotels.length === 0) {
            hotelsContainer.innerHTML = "<p>No hotels found.</p>";
            return;
        }

        hotels.forEach(hotel => {
            const hotelCard = document.createElement("div");
            hotelCard.classList.add("hotel-card");

            const isFullyBooked = hotel.rooms_available === 0;
            const roomsText = isFullyBooked 
                ? '<span class="fully-booked">Fully Booked</span>' 
                : `${hotel.rooms_available}`;
            const disabledAttr = isFullyBooked ? "disabled" : "";

            const imageUrl = hotel.image ? hotel.image : "assets/images/default-hotel.jpg";

            hotelCard.innerHTML = `
                <img src="${imageUrl}" alt="${hotel.name}" class="hotel-image">
                <h3>${hotel.name}</h3>
                <p>City: ${hotel.location}</p>  <!-- Fixed: Using 'location' -->
                <p>Rooms Available: ${roomsText}</p>
                <p>Price: $${hotel.price}/night</p> <!-- Fixed: Using 'price' instead of 'price_per_night' -->
                <button class="book-btn" data-id="${hotel.id}" ${disabledAttr}>Book Now</button>
            `;

            hotelsContainer.appendChild(hotelCard);
        });

        document.querySelectorAll(".book-btn").forEach(button => {
            button.addEventListener("click", bookHotel);
        });
    }

    async function bookHotel(event) {
        const hotelId = event.target.dataset.id;
        const hotel = allHotels.find(h => h.id == hotelId);

        if (!hotel || hotel.rooms_available === 0) {
            alert("This hotel is fully booked!");
            return;
        }

        hotel.rooms_available -= 1;

        try {
            const response = await fetch(`http://localhost:3000/hotels/${hotelId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rooms_available: hotel.rooms_available })
            });
            if (!response.ok) throw new Error("Failed to update hotel");

            const updatedHotel = await response.json();
            allHotels = allHotels.map(h => h.id == hotelId ? updatedHotel : h);
            filterHotels();
        } catch (error) {
            console.error("Error updating hotel:", error);
        }
    }

    function filterHotels() {
        let filteredHotels = allHotels;

        if (citySelect.value !== "all") {
            filteredHotels = filteredHotels.filter(hotel => hotel.location === citySelect.value); // Fixed: Using 'location'
        }

        if (availabilityFilter.checked) {
            filteredHotels = filteredHotels.filter(hotel => hotel.rooms_available > 0);
        }

        const searchQuery = searchInput.value.toLowerCase();
        if (searchQuery) {
            filteredHotels = filteredHotels.filter(hotel => hotel.name.toLowerCase().includes(searchQuery));
        }

        if (sortSelect.value === "low-high") {
            filteredHotels.sort((a, b) => a.price - b.price); 
        } else if (sortSelect.value === "high-low") {
            filteredHotels.sort((a, b) => b.price - a.price); 
        }

        displayHotels(filteredHotels);
    }

    citySelect.addEventListener("change", filterHotels);
    availabilityFilter.addEventListener("change", filterHotels);
    searchInput.addEventListener("input", filterHotels);
    sortSelect.addEventListener("change", filterHotels);

    fetchHotels();
});
