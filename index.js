document.addEventListener("DOMContentLoaded", () => {
    const hotelsContainer = document.getElementById("hotels-list");
    const citySelect = document.getElementById("city-select");
    const availabilityFilter = document.getElementById("availability-filter");

    if (!hotelsContainer || !citySelect || !availabilityFilter) {
        console.error("One or more required elements are missing.");
        return;
    }

    let allHotels = [];

    function fetchHotels() {
        fetch("http://localhost:3000/hotels")
            .then(response => response.json())
            .then(data => {
                allHotels = data;
                displayHotels(data);
                populateCityOptions(data);
            })
            .catch(error => console.error("Error fetching hotels:", error));
    }

    function populateCityOptions(hotels) {
        const cities = new Set(hotels.map(hotel => hotel.city));

        citySelect.innerHTML = '<option value="all">All Cities</option>';

        cities.forEach(city => {
            const option = document.createElement("option");
            option.value = city;
            option.textContent = city;
            citySelect.appendChild(option);
        });
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
            const roomsText = isFullyBooked ? '<span class="fully-booked">Fully Booked</span>' : `${hotel.rooms_available}`;
            const disabledAttr = isFullyBooked ? "disabled" : "";

            hotelCard.innerHTML = `
                <h3>${hotel.name}</h3>
                <p>City: ${hotel.city}</p>
                <p>Rooms Available: ${roomsText}</p>
                <p>Price: $${hotel.price_per_night}/night</p>
                <button class="book-btn" data-id="${hotel.id}" ${disabledAttr}>Book Now</button>
            `;

            hotelsContainer.appendChild(hotelCard);
        });

        document.querySelectorAll(".book-btn").forEach(button => {
            button.addEventListener("click", bookHotel);
        });
    }

    function bookHotel(event) {
        const hotelId = event.target.dataset.id;
        const hotel = allHotels.find(h => h.id == hotelId);

        if (!hotel || hotel.rooms_available === 0) {
            alert("This hotel is fully booked!");
            return;
        }

        hotel.rooms_available -= 1;

        fetch(`http://localhost:3000/hotels/${hotelId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ rooms_available: hotel.rooms_available })
        })
        .then(response => response.json())
        .then(updatedHotel => {
            allHotels = allHotels.map(h => h.id == hotelId ? updatedHotel : h);
            displayHotels(allHotels);
        })
        .catch(error => console.error("Error updating hotel:", error));
    }

    function filterHotels() {
        let filteredHotels = allHotels;

        if (citySelect.value !== "all") {
            filteredHotels = filteredHotels.filter(hotel => hotel.city === citySelect.value);
        }

        if (availabilityFilter.checked) {
            filteredHotels = filteredHotels.filter(hotel => hotel.rooms_available > 0);
        }

        displayHotels(filteredHotels);
    }

    citySelect.addEventListener("change", filterHotels);
    availabilityFilter.addEventListener("change", filterHotels);

    fetchHotels();
});
