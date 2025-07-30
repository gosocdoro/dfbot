import axios from 'axios';

export default async function handler(req, res) {
  try {
    // 환경변수에서 채널 ID 가져오기
    const channelId = process.env.SLACK_CHANNEL_ID;
    if (!channelId) {
      return res.status(500).json({ error: "SLACK_CHANNEL_ID is missing" });
    }

    // 최신 메시지 검색
    const history = await axios.get('https://slack.com/api/conversations.history', {
      headers: { Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}` },
      params: { channel: channelId, limit: 5 }
    });

    console.log("Channel ID:", channelId);
    console.log("History:", history.data);

    const baseMsg = history.data.messages.find(m => m.text.includes("이번 주 체크리스트"));
    if (!baseMsg) return res.status(404).json({ error: "No checklist message found" });

    const baseTs = baseMsg.ts;

    // 버튼 댓글 추가
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

    res.status(200).json({ ok: resp.data.ok, ts: baseTs });
 } catch (err) {
  console.error("Error detail:", err.response?.data || err.message);
  res.status(500).json({
    error: err.response?.data || err.message,
    stack: err.stack
  });
}
