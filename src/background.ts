export enum MessageType {
  ENABLE,
  DISABLE,
  GET_CURRENT_STATUS,
  SET_REFRESH_INTERVAL,
}

export interface Message<P = unknown> {
  type: MessageType;
  payload?: P;
}

export interface SetRefreshIntervalMessagePayload {
  interval: number;
}

export interface GetCurrentStatusResponse {
  enabled: boolean;
  interval: number;
}

let intervalId: any | undefined = undefined;
let intervalMs = 2000;

chrome.runtime.onMessage.addListener(
  async (message: Message, sender, sendResponse) => {
    switch (message.type) {
      case MessageType.ENABLE:
        clearInterval(intervalId);
        intervalId = undefined;
        const tab = await getCurrentTab();
        intervalId = setInterval(
          () =>
            chrome.scripting.executeScript({
              target: { tabId: tab.id as number },
              func: () => location.reload(),
            }),
          intervalMs
        );
        break;

      case MessageType.DISABLE:
        clearInterval(intervalId);
        intervalId = undefined;
        break;

      case MessageType.GET_CURRENT_STATUS:
        sendResponse({
          enabled: !!intervalId,
          interval: intervalMs / 1000,
        } as GetCurrentStatusResponse);
        return true;

      case MessageType.SET_REFRESH_INTERVAL:
        const payload = (message as Message<SetRefreshIntervalMessagePayload>)
          .payload;
        if (payload) {
          intervalMs = payload.interval * 1000;
        }
        break;
    }
  }
);

async function getCurrentTab() {
  const tabs = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });
  return tabs[0];
}
