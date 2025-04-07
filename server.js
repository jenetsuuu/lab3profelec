const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

let tables = [
  { id: 1, seats: 4, available: true },
  { id: 2, seats: 2, available: true },
  { id: 3, seats: 6, available: true },
  { id: 4, seats: 8, available: true },
];

let reservations = [];

// GET /tables → Display available tables.
app.get("/tables", (req, res) => {
  res.json(tables.filter((table) => table.available));
});

// POST /reserve → Reserve a table.
app.post("/reserve", (req, res) => {
  const { tableId, customerName, guests } = req.body;

  if (!customerName || !guests) {
    return res.status(400).json({ error: "Name and guest count required" });
  }

  const table = tables.find((t) => t.id === tableId && t.available);
  if (!table || guests > table.seats) {
    return res.status(400).json({ error: "No available tables for " + guests + " guests" });
  }

  table.available = false;
  reservations.push({ id: reservations.length + 1, tableId, customerName, guests });

  res.json({ message: `Table ${tableId} reserved for ${customerName} (${guests} guests)` });
});

// GET /reservations → View all reservations.
app.get("/reservations", (req, res) => {
  res.json(reservations);
});

// PUT /update/:id → Modify a reservation.
app.put("/update/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const { customerName, guests } = req.body;

  const reservation = reservations.find((r) => r.id === id);
  if (!reservation) {
    return res.status(404).json({ error: "Reservation not found" });
  }

  reservation.customerName = customerName || reservation.customerName;
  reservation.guests = guests || reservation.guests;

  res.json({ message: `Reservation ${id} updated` });
});

// DELETE /cancel/:id → Cancel a reservation.
app.delete("/cancel/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = reservations.findIndex((r) => r.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Reservation not found" });
  }

  const table = tables.find((t) => t.id === reservations[index].tableId);
  if (table) table.available = true;

  reservations.splice(index, 1);
  res.json({ message: `Reservation ${id} canceled` });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
