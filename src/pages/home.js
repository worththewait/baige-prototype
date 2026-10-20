(() => {
  "use strict";
  const form = document.querySelector("#conversationForm");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const field = document.querySelector("#homePrompt");
    const feedback = document.querySelector("#conversationFeedback");
    if (!field.value.trim()) {
      feedback.textContent = "请先输入问题或任务描述。";
      field.focus();
    } else feedback.textContent = "对话能力正在集成，暂未发送内容。";
  });
  window.BaigePage.onActivate(({ child }) => {
    const conversation = document.querySelector("#conversationView");
    const pending = document.querySelector("#qaPending");
    if (!pending) return;
    conversation.hidden = child === "智能问数";
    pending.hidden = !conversation.hidden;
  });
})();
