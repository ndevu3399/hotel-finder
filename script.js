const API_URL = "http://localhost:3001/hotels";

document.addEventListener("DOMContentLoaded", async () => {
    showLoading(true);
    await fetchHotels();
    setupEventListeners();
    applyStoredPreferences();
    loadBookings();
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
            <div class="hotel-info">
                <h3>${hotel.name}</h3>
                <p>Price: <strong>$${hotel.price}</strong> per night</p>
                <p>Availability: 
                    <span class="${hotel.availability ? 'available' : 'unavailable'}">
                        ${hotel.availability ? "Available" : "Not Available"}
                    </span>
                </p>

                <!-- Booking Form -->
                <div class="booking-container">
                    <h4>Book this hotel</h4>
                    <form class="booking-form" data-hotel-id="${hotel.id}">
                        <label for="name">Name:</label>
                        <input type="text" name="name" required>

                        <label for="email">Email:</label>
                        <input type="email" name="email" required>

                        <label for="check-in">Check-in Date:</label>
                        <input type="date" name="checkIn" required>

                        <label for="check-out">Check-out Date:</label>
                        <input type="date" name="checkOut" required>

                        <button type="submit">Book Now</button>
                    </form>
                    <p class="booking-message"></p>
                </div>

                <button class="delete-btn" data-id="${hotel.id}">Delete</button>
            </div>
        `;
        hotelList.appendChild(hotelCard);
    });

    setupDeleteButtons();
    setupBookingForms();
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


function setupBookingForms() {
    document.querySelectorAll(".booking-form").forEach(form => {
        form.addEventListener("submit", (event) => {
            event.preventDefault();
            const hotelId = form.getAttribute("data-hotel-id");
            const formData = new FormData(form);
            const checkInDate = new Date(formData.get("checkIn"));
            const checkOutDate = new Date(formData.get("checkOut"));

            
            if (checkOutDate <= checkInDate) {
                showToast("Check-out date must be after check-in date!", "error");
                return;
            }

            const booking = {
                id: Date.now(),
                hotelId: hotelId,
                name: formData.get("name"),
                email: formData.get("email"),
                checkIn: formData.get("checkIn"),
                checkOut: formData.get("checkOut")
            };

            saveBooking(booking);
            form.reset();
            showToast("Booking confirmed!", "success");

            loadBookings();
        });
    });
}


function saveBooking(booking) {
    let bookings = JSON.parse(localStorage.getItem("bookings")) || [];
    bookings.push(booking);
    localStorage.setItem("bookings", JSON.stringify(bookings));
}


function loadBookings() {
    const bookingContainer = document.getElementById("active-bookings");
    bookingContainer.innerHTML = "<h2>Active Bookings</h2>";

    let bookings = JSON.parse(localStorage.getItem("bookings")) || [];
    if (bookings.length === 0) {
        bookingContainer.innerHTML += "<p>No active bookings.</p>";
        return;
    }

    bookings.forEach(booking => {
        const bookingItem = document.createElement("div");
        bookingItem.classList.add("booking-item");
        bookingItem.innerHTML = `
            <p><strong>${booking.name}</strong> booked from <strong>${booking.checkIn}</strong> to <strong>${booking.checkOut}</strong></p>
            <button class="delete-booking-btn" data-id="${booking.id}">❌ Cancel</button>
        `;
        bookingContainer.appendChild(bookingItem);
    });

    setupDeleteBookingButtons();
}

function setupDeleteBookingButtons() {
    document.querySelectorAll(".delete-booking-btn").forEach(button => {
        button.addEventListener("click", (event) => {
            const bookingId = event.target.getAttribute("data-id");
            let bookings = JSON.parse(localStorage.getItem("bookings")) || [];
            bookings = bookings.filter(booking => booking.id !== parseInt(bookingId));
            localStorage.setItem("bookings", JSON.stringify(bookings));

            showToast("Booking canceled!", "error");
            loadBookings();
        });
    });
}
