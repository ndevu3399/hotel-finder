document.addEventListener("DOMContentLoaded", () => {
    let hotels = JSON.parse(localStorage.getItem("hotels")) || [];
  
    const hotelList = document.getElementById("hotel-list");
    const sortSelect = document.getElementById("sort-options");
    const filterCheckbox = document.getElementById("filter-availability");
  
    // Function to render hotels
    function renderHotels() {
      hotelList.innerHTML = ""; // Clear existing hotels
      hotels.forEach((hotel) => {
        const hotelDiv = document.createElement("div");
        hotelDiv.classList.add("hotel");
        hotelDiv.innerHTML = `
          <h2>${hotel.name}</h2>
          <img src="${hotel.image}" alt="${hotel.name}" width="200">
          <p>Price: $${hotel.price}</p>
          <p>${hotel.availability ? "✅ Available" : "❌ Not Available"}</p>
        `;
        hotelList.appendChild(hotelDiv);
      });
    }
  
    // Initial render
    renderHotels();
  
    // Sorting function
    sortSelect.addEventListener("change", () => {
      let sortedHotels = [...hotels];
  
      if (sortSelect.value === "low-to-high") {
        sortedHotels.sort((a, b) => a.price - b.price);
      } else if (sortSelect.value === "high-to-low") {
        sortedHotels.sort((a, b) => b.price - a.price);
      }
  
      hotels = sortedHotels;
      renderHotels();
      localStorage.setItem("hotels", JSON.stringify(hotels));
    });
  
    // Filtering function
    filterCheckbox.addEventListener("change", () => {
      if (filterCheckbox.checked) {
        hotels = JSON.parse(localStorage.getItem("hotels")).filter(hotel => hotel.availability);
      } else {
        hotels = JSON.parse(localStorage.getItem("hotels"));
      }
      renderHotels();
    });
  });
  