import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  let payload = {};
  if (req.body?.payload) payload = JSON.parse(req.body.payload);

  // 버튼 클릭일 때만 실행
  if (payload.type === 'block_actions' && payload.actions?.[0]?.action_id === 'get_checklist') {
    const userId = payload.user.id;
    const channelId = payload.channel.id;

    try {
      // 1️⃣ 캔버스 내용 읽기
      const canvasResp = await axios.get('https://slack.com/api/canvas.read', {
        headers: { Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}` },
        params: { external_id: process.env.CANVAS_URL }
      });

      const text = canvasResp.data.text || '';
      const items = text.split('\n').filter(line => line.trim() !== '');

      // 2️⃣ 체크리스트 옵션으로 변환
      const options = items.map((line, idx) => ({
        text: { type: "plain_text", text: line },
        value: `task_${idx}`
      }));

      // 3️⃣ ephemeral 메시지 전송
      const resp = await axios.post('https://slack.com/api/chat.postEphemeral', {
        channel: channelId,
        user: userId,
        text: '✅ 이번 주 던할일',
        blocks: [
          { type: "section", text: { type: "mrkdwn", text: "*이번 주 체크리스트*" } },
          { type: "actions", elements: [{ type: "checkboxes", options }] }
        ]
      }, {
        headers: { Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}` }
      });

      console.log("Ephemeral response:", resp.data);
    } catch (err) {
      console.error("Canvas error:", err.response?.data || err.message);
    }
  }

  res.status(200).send('');
}
