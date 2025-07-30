import axios from 'axios';

export default async function handler(req, res) {
  try {
    const channelId = process.C08F6G8EBK7; // 테스트 채널 ID

    // 1. 최신 "이번 주 체크리스트" 메시지 검색
    const history = await axios.get('https://slack.com/api/conversations.history', {
      headers: { Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}` },
      params: { channel: channelId, limit: 5 }
    });

    const baseMsg = history.data.messages.find(m => m.text.includes("이번 주 체크리스트"));
    if (!baseMsg) return res.status(404).send("No checklist message found");

    const baseTs = baseMsg.ts;

    // 2. 버튼 댓글 추가
    const resp = await axios.post('https://slack.com/api/chat.postMessage', {
      channel: channelId,
      thread_ts: baseTs,
      text: "체크리스트를 받으려면 버튼을 클릭하세요",
      blocks: [
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: { type: "plain_text", text: "내 체크리스트 받기" },
              action_id: "get_checklist"
            }
          ]
        }
      ]
    }, {
      headers: { Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}` }
    });

    res.status(200).send(`Button added: ${resp.data.ok}`);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).send("Error");
  }
}
