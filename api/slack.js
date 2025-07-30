import querystring from 'querystring';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const body = req.body instanceof Buffer ? req.body.toString('utf8') : req.body;
  const parsed = querystring.parse(body);

  console.log("Raw body:", body);
  console.log("Parsed payload string:", parsed.payload);

  let payload = {};
  if (parsed.payload) {
    try {
      payload = JSON.parse(parsed.payload);
    } catch (e) {
      console.error("JSON parse error:", e);
    }
  }

  console.log("Slack event:", payload);

  res.status(200).send('');
}
