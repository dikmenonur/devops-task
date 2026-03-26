const express = require("express");
const { pool } = require("./db");

const router = express.Router();

// GET /api/todos — tümünü listele
router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM todos ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Sunucu hatası" });
  }
});

// POST /api/todos — yeni todo ekle
router.post("/", async (req, res) => {
  const { title } = req.body;
  if (!title || title.trim() === "") {
    return res.status(400).json({ error: "Başlık boş olamaz" });
  }
  try {
    const { rows } = await pool.query(
      "INSERT INTO todos (title) VALUES ($1) RETURNING *",
      [title.trim()]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Sunucu hatası" });
  }
});

// PATCH /api/todos/:id — tamamlandı olarak işaretle
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;
  try {
    const { rows } = await pool.query(
      "UPDATE todos SET completed = $1 WHERE id = $2 RETURNING *",
      [completed, id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Bulunamadı" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Sunucu hatası" });
  }
});

// DELETE /api/todos/:id — sil
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query(
      "DELETE FROM todos WHERE id = $1",
      [id]
    );
    if (rowCount === 0) return res.status(404).json({ error: "Bulunamadı" });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Sunucu hatası" });
  }
});

module.exports = router;
