import axios from 'axios';

export default async function handler(req, res) {
  console.log("ENV DEBUG:", {
  SLACK_CHANNEL_ID: process.env.SLACK_CHANNEL_ID,
  SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN ? 'EXISTS' : 'MISSING'});

  try {
    const channelId = process.C08F9TN83H9;
    const token = process.env.SLACK_BOT_TOKEN;

    if (!channelId || !token) {
      return res.status(500).json({
        error: "Missing environment variables",
        channelId,
        tokenExists: !!token
      });
    }

    console.log("Using Channel ID:", channelId);

    // 1. 채널의 최근 메시지 가져오기
    const history = await axios.get('https://slack.com/api/conversations.history', {
      headers: { Authorization: `Bearer ${token}` },
      params: { channel: channelId, limit: 5 }
    });

    console.log("History API response:", history.data);

    if (!history.data.ok) {
      return res.status(500).json({
        error: "Slack history API failed",
        response: history.data
      });
    }

    const baseMsg = history.data.messages.find(m => m.text?.includes("이번 주 던할일"));
    if (!baseMsg) {
      return res.status(404).json({
        error: "No checklist message found",
        messages: history.data.messages
      });
    }

    const baseTs = baseMsg.ts;
    console.log("Found base message TS:", baseTs);

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
              text: { type: "plain_text", text: "던할일 체크리스트" },
              action_id: "get_checklist"
            }
          ]
        }
      ]
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log("PostMessage API response:", resp.data);

    if (!resp.data.ok) {
      return res.status(500).json({
        error: "Slack postMessage API failed",
        response: resp.data
      });
    }

    res.status(200).json({
      ok: true,
      baseMessage: baseMsg.text,
      baseTs,
      slackResponse: resp.data
    });

  } catch (err) {
    console.error("Caught Error:", err.response?.data || err.message);
    res.status(500).json({
      error: err.response?.data || err.message,
      stack: err.stack
    });
  }
}
