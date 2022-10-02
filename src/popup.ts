import {
  GetCurrentStatusResponse,
  Message,
  MessageType,
  SetRefreshIntervalMessagePayload,
} from "./background";

async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });
  return tab;
}

async function main() {
  const tab = await getCurrentTab();
  const tabId = tab.id;
  if (!tabId) {
    return;
  }

  const autoRefreshEnabledToggle = document.getElementById(
    "autoRefreshEnabledToggle"
  ) as HTMLInputElement;
  const refreshIntervalInput = document.getElementById(
    "refreshIntervalInput"
  ) as HTMLInputElement;

  chrome.runtime.sendMessage<Message>(
    { type: MessageType.GET_CURRENT_STATUS, tabId },
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
      tabId,
    });
  });

  refreshIntervalInput.addEventListener("input", (e) => {
    chrome.runtime.sendMessage<Message<SetRefreshIntervalMessagePayload>>({
      type: MessageType.SET_REFRESH_INTERVAL,
      tabId,
      payload: { interval: Number((e.target as HTMLInputElement).value) },
    });
    autoRefreshEnabledToggle.checked = false;
  });
}

main();
