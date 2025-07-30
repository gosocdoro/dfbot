import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const channelId = process.env.SLACK_CHANNEL_ID; // 체크리스트 채널

    // 버튼 메시지 발송
    const response = await axios.post('https://slack.com/api/chat.postMessage', {
      channel: channelId,
      text: "이번 주 체크리스트를 작성하고 확인하세요!",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "*이번 주 체크리스트*"
          }
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                text: "내 체크리스트 받기"
              },
              action_id: "get_checklist"
            }
          ]
        }
      ]
    }, {
      headers: {
        Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`
      }
    });

    console.log("Message sent:", response.data);
    res.status(200).send('OK');
  } catch (err) {
    console.error("Slack postMessage error:", err.response?.data || err.message);
    res.status(500).send('Error');
  }
}
