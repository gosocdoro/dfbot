export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  let payload = {};
  if (req.body?.payload) payload = JSON.parse(req.body.payload);

  // 첫 액션 (버튼 클릭)일 때만 ephemeral 메시지 전송
  if (payload.type === 'block_actions' && payload.actions?.[0]?.action_id === 'get_checklist') {
    const userId = payload.user.id;
    const channelId = payload.channel.id;

    const resp = await fetch('https://slack.com/api/chat.postEphemeral', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SLACK_BOT_TOKEN}`
      },
      body: JSON.stringify({
        channel: channelId,
        user: userId,
        text: '✅ 이번 주 체크리스트',
        blocks: [
          {
            type: "section",
            text: { type: "mrkdwn", text: "*이번 주 체크리스트*" }
          },
          {
            type: "actions",
            elements: [
              {
                type: "checkboxes",
                action_id: "checklist_action",
                options: [
                  { text: { type: "plain_text", text: "회의 준비" }, value: "task_1" },
                  { text: { type: "plain_text", text: "보고서 작성" }, value: "task_2" }
                ]
              }
            ]
          }
        ]
      })
    });

    console.log("Ephemeral response:", await resp.json());
  }

  // ✅ 이벤트는 항상 200 OK로 응답, 추가 메시지 전송 없음
  res.status(200).send('');
}
