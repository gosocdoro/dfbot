const pinData = pins.data;

console.log("Pins API raw:", pinData);

if (!pinData.ok) {
  console.error("Pins API failed:", pinData.error);
  res.status(200).send('');
  return;
}

const pinnedMessages = (pinData.items || [])
  .filter(item => item.type === 'message' && item.message.text);

let checklistMsg = pinnedMessages.find(i => i.message.text.startsWith('[CHECKLIST]'));

if (!checklistMsg && pinnedMessages.length > 0) {
  checklistMsg = pinnedMessages[0];
}

const text = checklistMsg
  ? checklistMsg.message.text.replace(/^\[CHECKLIST\]\s*/, '')
  : '현재 핀된 체크리스트 메시지가 없습니다.';
