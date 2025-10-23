import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const app = express();
app.use(cors());
app.use(bodyParser.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// --- GET semua item atau filter ?status= ---
app.get("/items", async (req, res) => {
  const status = req.query.status;
  let query = supabase.from("items").select("*");

  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
});

// --- POST tambah item baru ---
app.post("/items", async (req, res) => {
  const { nama, tanggalMasuk, status = "Sedang Dicuci", tanggalSelesai = "-" } = req.body;
  if (!nama || !tanggalMasuk)
    return res.status(400).json({ message: "nama dan tanggalMasuk wajib diisi." });

  const { data, error } = await supabase.from("items").insert([
    { nama, status, tanggalMasuk, tanggalSelesai },
  ]);

  if (error) return res.status(500).json({ message: error.message });
  res.status(201).json({ message: "Data sepatu berhasil ditambahkan.", item: data[0] });
});

// --- PUT update status ---
app.put("/items/:id", async (req, res) => {
  const { id } = req.params;
  const { status, tanggalSelesai } = req.body;

  const { data, error } = await supabase
    .from("items")
    .update({ status, tanggalSelesai })
    .eq("id", id)
    .select();

  if (error) return res.status(500).json({ message: error.message });
  res.json({ message: "Status sepatu berhasil diperbarui.", item: data[0] });
});

// --- DELETE item ---
app.delete("/items/:id", async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from("items").delete().eq("id", id);
  if (error) return res.status(500).json({ message: error.message });
  res.json({ message: "Data sepatu berhasil dihapus." });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server jalan di http://localhost:${PORT}`));
