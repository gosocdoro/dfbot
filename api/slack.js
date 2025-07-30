import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  let payload = {};
  if (req.body?.payload) payload = JSON.parse(req.body.payload);

  // ✅ 버튼 클릭(action_id === 'get_checklist')일 때만 실행
  if (
    payload.type === 'block_actions' &&
    payload.actions?.[0]?.action_id === 'get_checklist'
  ) {
    const userId = payload.user.id;
    const channelId = payload.channel.id;

    try {
      const pins = await axios.get('https://slack.com/api/pins.list', {
        headers: { Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}` },
        params: { channel: channelId }
      });

      const pinnedMessages = pins.data.items
        .filter(item => item.type === 'message' && item.message.text);

      const checklistMsg = pinnedMessages.find(i => i.message.text.startsWith('[CHECKLIST]'))
        || pinnedMessages[0];

      const text = checklistMsg
        ? checklistMsg.message.text.replace(/^\[CHECKLIST\]\s*/, '')
        : '현재 체크리스트 메시지가 없습니다.';

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
      console.error("Pins error:", err.response?.data || err.message);
    }
  }

  // ✅ 체크박스 이벤트는 무시 → 기존 ephemeral 유지
  res.status(200).send('');
}
