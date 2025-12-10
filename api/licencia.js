export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).send("GET KO");
  }

  const { email, hwid } = req.body || {};

  if (!email || !hwid) {
    return res.status(200).send("ERROR: Missing parameters");
  }

  // TEMPORAL: Solo tu licencia para pruebas
  if (email !== "albujadiego1996@hotmail.com") {
    return res.status(200).send("ERROR: Email not registered");
  }

  if (hwid !== "541008955_FTMO-Server4") {
    return res.status(200).send("ERROR: HWID mismatch");
  }

  return res.status(200).send("OK");
}
