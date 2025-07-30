import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  let payload = {};
  if (req.body?.payload) payload = JSON.parse(req.body.payload);

  if (payload.type === 'block_actions' && payload.actions?.[0]?.action_id === 'get_checklist') {
    const userId = payload.user.id;
    const channelId = payload.channel.id;

    try {
      // 1️⃣ 채널 메시지 목록 불러오기
      const history = await axios.get('https://slack.com/api/conversations.history', {
        headers: { Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}` },
        params: { channel: channelId, limit: 50 }
      });

      // 2️⃣ 가장 최근 핀 메시지 찾기
      const pinnedMsg = history.data.messages.find(m => m.pinned_to);

      const text = pinnedMsg ? pinnedMsg.text : '현재 고정된 체크리스트 메시지가 없습니다.';
      const items = text.split('\n').filter(line => line.trim() !== '');

      // 3️⃣ 체크박스 옵션 생성
      const options = items.map((line, idx) => ({
        text: { type: "plain_text", text: line },
        value: `task_${idx}`
      }));

      // 4️⃣ ephemeral 메시지 전송
      await axios.post('https://slack.com/api/chat.postEphemeral', {
        channel: channelId,
        user: userId,
        text: '✅ 이번 주 체크리스트',
        blocks: [
          { type: "section", text: { type: "mrkdwn", text: "*이번 주 체크리스트*" } },
          { type: "actions", elements: [{ type: "checkboxes", options }] }
        ]
      }, {
        headers: { Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}` }
      });

    } catch (err) {
      console.error("History error:", err.response?.data || err.message);
    }
  }

  res.status(200).send('');
}
