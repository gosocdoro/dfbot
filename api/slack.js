import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  let payload = {};
  if (req.body?.payload) payload = JSON.parse(req.body.payload);

  if (payload.type === 'block_actions' && payload.actions?.[0]?.action_id === 'get_checklist') {
    try {
      const canvasResp = await axios.get('https://slack.com/api/canvas.read', {
        headers: { Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}` },
        params: { external_id: process.env.CANVAS_URL }
      });

      console.log("Canvas API raw:", canvasResp.data);

    } catch (err) {
      console.error("Canvas API error:", err.response?.data || err.message);
    }
  }

  res.status(200).send('');
}
