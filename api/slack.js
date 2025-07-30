import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  let payload = {};
  if (req.body?.payload) payload = JSON.parse(req.body.payload);

  if (
    payload.type === 'block_actions' &&
    payload.actions?.[0]?.action_id === 'get_checklist'
  ) {
    const userId = payload.user.id;
    const channelId = payload.channel.id;

    try {
      // 1️⃣ 핀 메시지 목록 가져오기
      const pins = await axios.get('https://slack.com/api/pins.list', {
        headers: { Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}` },
        params: { channel: channelId }
      });

      const pinData = pins.data;
      if (!pinData.ok || !pinData.items || pinData.items.length === 0) {
        console.log("No pinned messages");
        res.status(200).send('');
        return;
      }

      const pinned = pinData.items.find(i => i.type === 'message');
      const targetTs = pinned?.message.ts;

      // 2️⃣ conversations.history에서 최신 텍스트 조회
      const history = await axios.get('https://slack.com/api/conversations.history', {
        headers: { Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}` },
        params: { channel: channelId, limit: 50 }
      });

      const latestMsg = history.data.messages.find(m => m.ts === targetTs);
      const text = latestMsg ? latestMsg.text : '현재 핀된 체크리스트 메시지가 없습니다.';

      const items = text.split('\n').filter(line => line.trim() !== '');
      const options = items.map((line, idx) => ({
        text: { type: "plain_text", text: line },
        value: `task_${idx}`
      }));

      await axios.post('https://slack.com/api/chat.postEphemeral', {
        channel: channelId,
        user: userId,
        text: '✅ 이번 주 체크리스트',
        blocks: [
          { type: "section", text: { type: "mrkdwn", text: "*이번 주 체크리스트*" } },
          { type: "actions", elements: [{ type: "checkboxes", action_id: "checklist_action", options }] }
        ]
      }, {
        headers: { Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}` }
      });

    } catch (err) {
      console.error("Pins+History error:", err.response?.data || err.message);
    }
  }

  res.status(200).send('');
}
