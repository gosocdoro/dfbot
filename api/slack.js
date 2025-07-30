import axios from 'axios';

export default async function handler(req, res) {
  console.log("Slack Interactivity Triggered:", req.method);

  if (req.method !== 'POST') {
    return res.status(200).send('OK'); // Slack 재시도 방지
  }

  let payload = {};
  if (req.body?.payload) payload = JSON.parse(req.body.payload);

  console.log("Payload:", payload);

  if (
    payload.type === 'block_actions' &&
    payload.actions?.[0]?.action_id === 'get_checklist'
  ) {
    const userId = payload.user.id;
    const channelId = payload.channel.id;
    const messageTs = payload.message.thread_ts || payload.message.ts;

    try {
      // 스레드 댓글 읽기
      const replies = await axios.get('https://slack.com/api/conversations.replies', {
        headers: { Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}` },
        params: { channel: channelId, ts: messageTs }
      });

      const items = replies.data.messages
        .slice(1)
        .map(m => m.text.trim())
        .filter(Boolean);

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
      console.error("Replies error:", err.response?.data || err.message);
    }
  }

  res.status(200).send('OK');
}
