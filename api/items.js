import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
  const { method, query, body } = req;

  try {
    // --- GET semua item atau filter ?status= ---
    if (method === "GET") {
      const { status } = query;
      let q = supabase.from("items").select("*");

      if (status) q = q.eq("status", status);

      const { data, error } = await q;
      if (error) throw error;

      return res.status(200).json(data);
    }

    // --- POST tambah item baru ---
    if (method === "POST") {
      const { nama, tanggalMasuk, status = "Sedang Dicuci", tanggalSelesai = "-" } = body;

      if (!nama || !tanggalMasuk)
        return res.status(400).json({ message: "nama dan tanggalMasuk wajib diisi." });

      const { data, error } = await supabase
        .from("items")
        .insert([{ nama, status, tanggalMasuk, tanggalSelesai }])
        .select();

      if (error) throw error;

      return res.status(201).json({ message: "Data sepatu berhasil ditambahkan.", item: data[0] });
    }

    // --- PUT update status ---
    if (method === "PUT") {
      const { id } = query;
      const { status, tanggalSelesai } = body;

      const { data, error } = await supabase
        .from("items")
        .update({ status, tanggalSelesai })
        .eq("id", id)
        .select();

      if (error) throw error;

      return res
        .status(200)
        .json({ message: "Status sepatu berhasil diperbarui.", item: data[0] });
    }

    // --- DELETE item ---
    if (method === "DELETE") {
      const { id } = query;

      const { error } = await supabase.from("items").delete().eq("id", id);
      if (error) throw error;

      return res.status(200).json({ message: "Data sepatu berhasil dihapus." });
    }

    // --- Kalau method lain ---
    res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
    return res.status(405).end(`Method ${method} Not Allowed`);
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ message: err.message });
  }
}
