import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  let payload = {};
  if (req.body?.payload) payload = JSON.parse(req.body.payload);

  if (payload.type === 'block_actions' && payload.actions?.[0]?.action_id === 'get_checklist') {
    const userId = payload.user.id;
    const channelId = payload.channel.id;

    try {
      const history = await axios.get('https://slack.com/api/conversations.history', {
        headers: { Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}` },
        params: { channel: channelId, limit: 100 }
      });

      // ✅ pinned_to가 있는 메시지 필터링
      const pinnedMessages = history.data.messages.filter(m => m.pinned_to);

      // ✅ 특정 키워드 필터링 (예: [CHECKLIST])
      const checklistMsg = pinnedMessages.find(m => m.text.startsWith('[CHECKLIST]')) 
        || pinnedMessages[0];

      const text = checklistMsg
        ? checklistMsg.text.replace(/^\[CHECKLIST\]\s*/,'')
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
