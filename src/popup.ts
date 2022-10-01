import {
  GetCurrentStatusResponse,
  Message,
  MessageType,
  SetRefreshIntervalMessagePayload,
} from "./background";

const autoRefreshEnabledToggle = document.getElementById(
  "autoRefreshEnabledToggle"
) as HTMLInputElement;
const refreshIntervalInput = document.getElementById(
  "refreshIntervalInput"
) as HTMLInputElement;

chrome.runtime.sendMessage<Message>(
  { type: MessageType.GET_CURRENT_STATUS },
  (response: GetCurrentStatusResponse) => {
    autoRefreshEnabledToggle.checked = response.enabled;
    refreshIntervalInput.value = response.interval.toString();
  }
);

autoRefreshEnabledToggle.addEventListener("click", (e) => {
  chrome.runtime.sendMessage<Message>({
    type: (e.target as HTMLInputElement).checked
      ? MessageType.ENABLE
      : MessageType.DISABLE,
  });
});

refreshIntervalInput.addEventListener("input", (e) => {
  chrome.runtime.sendMessage<Message<SetRefreshIntervalMessagePayload>>({
    type: MessageType.SET_REFRESH_INTERVAL,
    payload: { interval: Number((e.target as HTMLInputElement).value) },
  });
});
