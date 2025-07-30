import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  let payload = {};
  if (req.body?.payload) payload = JSON.parse(req.body.payload);

  console.log("Slack event:", payload);

  const userId = payload.user.id;
  const channelId = payload.channel.id;

  try {
    const resp = await axios.post('https://slack.com/api/chat.postEphemeral', {
      channel: channelId,
      user: userId,
      text: '✅ 이번 주 체크리스트',
      blocks: [
        {
          type: "section",
          text: { type: "mrkdwn", text: "*이번 주 체크리스트*" }
        },
        {
          type: "actions",
          elements: [
            {
              type: "checkboxes",
              options: [
                { text: { type: "plain_text", "text": "회의 준비" }, value: "task_1" },
                { text: { type: "plain_text", "text": "보고서 작성" }, value: "task_2" }
              ]
            }
          ]
        }
      ]
    }, {
      headers: { Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}` }
    });

    console.log("Ephemeral response:", resp.data);
  } catch (err) {
    console.error("Ephemeral error:", err.response?.data || err.message);
  }

  res.status(200).send('');
}
