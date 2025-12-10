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

  // 🔎 1. Buscar licencia por email
  const { data, error } = await supabase
    .from("Licencias indicador CFDs")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (error || !data) {
    return res.status(200).send("ERROR: Email not registered");
  }

  const licencia = data;

  // ⚠️ 2. Revisar estado
  if (licencia.estado !== "activo") {
    return res.status(200).send("ERROR: License disabled");
  }

  // ⚠️ 3. Revisar expiración
  const today = new Date();
  const expDate = new Date(licencia.expiracion);

  if (today > expDate) {
    return res.status(200).send("ERROR: License expired");
  }

  // ⚠️ 4. Si no tiene HWID, se asigna automáticamente
  if (!licencia.hwid || licencia.hwid === "") {
    await supabase
      .from("Licencias indicador CFDs")
      .update({ hwid })
      .eq("email", email);

    return res.status(200).send("OK");
  }

  // ⚠️ 5. Si el HWID no coincide, error
  if (licencia.hwid !== hwid) {
    return res.status(200).send("ERROR: HWID mismatch");
  }

  // ✅ Si todo está bien
  return res.status(200).send("OK");
}
