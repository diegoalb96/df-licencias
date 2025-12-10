return res.status(200).send("ERROR: Missing parameters");
  }

  // 1️⃣ Buscar la licencia por email
  const { data: rows, error } = await supabase
  // 🔎 1. Buscar licencia por email
  const { data, error } = await supabase
    .from("Licencias indicador CFDs")
    .select("*")
    .eq("email", email)
    .limit(1);
    .maybeSingle();

  if (error) {
    return res.status(200).send("ERROR: Database error");
  }

  if (!rows || rows.length === 0) {
  if (error || !data) {
    return res.status(200).send("ERROR: Email not registered");
  }

  const lic = rows[0];
  const licencia = data;

  // 2️⃣ Verificar estado
  if (lic.estado !== "activo") {
  // ⚠️ 2. Revisar estado
  if (licencia.estado !== "activo") {
    return res.status(200).send("ERROR: License disabled");
  }

  // 3️⃣ Verificar expiración
  // ⚠️ 3. Revisar expiración
  const today = new Date();
  const exp = new Date(lic.expiracion);
  const expDate = new Date(licencia.expiracion);

  if (today > exp) {
  if (today > expDate) {
    return res.status(200).send("ERROR: License expired");
  }

  // 4️⃣ Si no tiene HWID guardado → registrar el HWID de esta cuenta MT5
  if (!lic.hwid || lic.hwid.trim() === "") {
  // ⚠️ 4. Si no tiene HWID, se asigna automáticamente
  if (!licencia.hwid || licencia.hwid === "") {
    await supabase
      .from("Licencias indicador CFDs")
      .update({ hwid: hwid })
      .eq("id", lic.id);
      .update({ hwid })
      .eq("email", email);

    return res.status(200).send("OK");
  }

  // 5️⃣ Si ya tiene HWID, validar que coincida
  if (lic.hwid !== hwid) {
  // ⚠️ 5. Si el HWID no coincide, error
  if (licencia.hwid !== hwid) {
    return res.status(200).send("ERROR: HWID mismatch");
  }

  // 6️⃣ Todo OK → licencia válida
  // ✅ Si todo está bien
  return res.status(200).send("OK");
}
