import querystring from 'querystring';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  // Slack은 x-www-form-urlencoded 형식 → 수동 파싱
  const body = req.body instanceof Buffer
    ? req.body.toString('utf8')
    : req.body;

  const parsed = querystring.parse(body);
  const payload = parsed.payload ? JSON.parse(parsed.payload) : {};

  console.log('Slack event:', payload);

  // 테스트용 200 응답
  res.status(200).send('');
}
