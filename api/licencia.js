import { createClient } from "@supabase/supabase-js";

// 🔥 Usa variables de entorno de Vercel
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
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

  // Buscar licencia en Supabase
  const { data, error } = await supabase
    .from("Licencias indicador CFDs")
    .select("*")
    .eq("email", email)
    .single();

  if (error || !data) {
    return res.status(200).send("ERROR: Email not registered");
  }

  // Si no tiene HWID aún → guardar automáticamente el primero
  if (!data.hwid || data.hwid === "") {
    await supabase
      .from("Licencias indicador CFDs")
      .update({ hwid })
      .eq("email", email);

    return res.status(200).send("OK");
  }

  // HWID no coincide
  if (data.hwid !== hwid) {
    return res.status(200).send("ERROR: HWID mismatch");
  }

  // Estado bloqueado
  if (data.estado !== "activo") {
    return res.status(200).send("ERROR: License inactive");
  }

  // Expiración
  const today = new Date().toISOString().split("T")[0];
  if (data.expiracion && data.expiracion < today) {
    return res.status(200).send("ERROR: License expired");
  }

  // TODO correcto
  return res.status(200).send("OK");
}
