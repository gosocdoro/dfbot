export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  let payload = {};

  // Vercel 환경에서는 req.body가 이미 파싱된 객체일 수 있음
  if (req.body?.payload) {
    try {
      payload = JSON.parse(req.body.payload);
    } catch (e) {
      console.error("JSON parse error:", e);
    }
  } else if (typeof req.body === 'string') {
    // 혹시 문자열로 들어오는 경우 대비
    const parsed = querystring.parse(req.body);
    if (parsed.payload) {
      payload = JSON.parse(parsed.payload);
    }
  }

  console.log("Slack event:", payload);

  res.status(200).send('');
}
