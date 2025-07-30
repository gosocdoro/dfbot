import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  let payload = {};
  if (req.body?.payload) payload = JSON.parse(req.body.payload);

  if (payload.type === 'block_actions' && payload.actions?.[0]?.action_id === 'get_checklist') {
    const channelId = payload.channel.id;

    try {
      const history = await axios.get('https://slack.com/api/conversations.history', {
        headers: { Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}` },
        params: { channel: channelId, limit: 50 }
      });

      console.log("History API raw:", history.data);

    } catch (err) {
      console.error("History error:", err.response?.data || err.message);
    }
  }

  res.status(200).send('');
}
