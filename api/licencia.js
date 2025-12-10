import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).send("GET KO");
  }

  const { email, hwid } = req.body || {};

  if (!email || !hwid) {
    return res.status(200).send("ERROR: Missing parameters");
  }

  // 1️⃣ Buscar la licencia por email
  const { data: rows, error } = await supabase
    .from("Licencias indicador CFDs")
    .select("*")
    .eq("email", email)
    .limit(1);

  if (error) {
    return res.status(200).send("ERROR: Database error");
  }

  if (!rows || rows.length === 0) {
    return res.status(200).send("ERROR: Email not registered");
  }

  const lic = rows[0];

  // 2️⃣ Verificar estado
  if (lic.estado !== "activo") {
    return res.status(200).send("ERROR: License disabled");
  }

  // 3️⃣ Verificar expiración
  const today = new Date();
  const exp = new Date(lic.expiracion);

  if (today > exp) {
    return res.status(200).send("ERROR: License expired");
  }

  // 4️⃣ Si no tiene HWID guardado → registrar el HWID de esta cuenta MT5
  if (!lic.hwid || lic.hwid.trim() === "") {
    await supabase
      .from("Licencias indicador CFDs")
      .update({ hwid: hwid })
      .eq("id", lic.id);

    return res.status(200).send("OK");
  }

  // 5️⃣ Si ya tiene HWID, validar que coincida
  if (lic.hwid !== hwid) {
    return res.status(200).send("ERROR: HWID mismatch");
  }

  // 6️⃣ Todo OK → licencia válida
  return res.status(200).send("OK");
}
