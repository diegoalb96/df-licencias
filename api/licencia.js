import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(200).send("GET KO");
    }

    const { email, hwid } = req.body || {};

    if (!email || !hwid) {
      return res.status(200).send("ERROR: Missing parameters");
    }

    // 🔥 TABLA NUEVA
    const { data, error } = await supabase
      .from("licencias_indicador_cfds")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !data) {
      return res.status(200).send("ERROR: Email not registered");
    }

    // Primer registro → guardar HWID
    if (!data.hwid || data.hwid === "") {
      await supabase
        .from("licencias_indicador_cfds")
        .update({ hwid })
        .eq("email", email);

      return res.status(200).send("OK");
    }

    // HWID diferente → licencia inválida
    if (data.hwid !== hwid) {
      return res.status(200).send("ERROR: HWID mismatch");
    }

    // Estado inactivo
    if (data.estado !== "activo") {
      return res.status(200).send("ERROR: License inactive");
    }

    // Validar expiración
    const today = new Date().toISOString().split("T")[0];
    if (data.expiracion && data.expiracion < today) {
      return res.status(200).send("ERROR: License expired");
    }

    return res.status(200).send("OK");

  } catch (err) {
    console.error("❌ SERVER ERROR:", err);
    return res.status(500).send("SERVER_ERROR");
  }
}
