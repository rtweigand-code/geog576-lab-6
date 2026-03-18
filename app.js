window.onload = function () {
  const serverURL = "http://18.206.84.91:8000";
  const tableBody = document.getElementById("table_body");

  const map = L.map("map").setView([43.0731, -89.4012], 7);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);

  let flightMarkers = [];

  function clearMarkers() {
    flightMarkers.forEach(marker => map.removeLayer(marker));
    flightMarkers = [];
  }

  async function getFlights() {
    const airportCode = document.getElementById("airportCode").value || "MSN";

    try {
      const response = await fetch(`${serverURL}/flights/${airportCode}`);
      const data = await response.json();

      tableBody.innerHTML = "";
      clearMarkers();

      if (!data.response || data.response.length === 0) {
        const row = document.createElement("tr");
        row.innerHTML = `<td colspan="5">No flight data found</td>`;
        tableBody.appendChild(row);
        return;
      }

      data.response.forEach(flight => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${flight.alt || ""}</td>
          <td>${flight.reg_number || ""}</td>
          <td>${flight.dir || ""}</td>
          <td>${flight.lat || ""}</td>
          <td>${flight.lng || ""}</td>
        `;
        tableBody.appendChild(row);

        if (flight.lat && flight.lng) {
          const marker = L.marker([flight.lat, flight.lng]).addTo(map);
          marker.bindPopup(`
            <b>${flight.reg_number || "Unknown Flight"}</b><br>
            Altitude: ${flight.alt || "N/A"}<br>
            Direction: ${flight.dir || "N/A"}<br>
            Lat: ${flight.lat}<br>
            Lng: ${flight.lng}
          `);
          flightMarkers.push(marker);
        }
      });

      const firstFlightWithCoords = data.response.find(f => f.lat && f.lng);
      if (firstFlightWithCoords) {
        map.setView([firstFlightWithCoords.lat, firstFlightWithCoords.lng], 6);
      }

    } catch (error) {
      console.error("Error loading flights:", error);
    }
  }

  window.getFlights = getFlights;

  getFlights();
};