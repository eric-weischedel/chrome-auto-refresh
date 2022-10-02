export enum MessageType {
  ENABLE,
  DISABLE,
  GET_CURRENT_STATUS,
  SET_REFRESH_INTERVAL,
}

export interface Message<P = unknown> {
  type: MessageType;
  tabId: number;
  payload?: P;
}

export interface SetRefreshIntervalMessagePayload {
  interval: number;
}

export interface GetCurrentStatusResponse {
  enabled: boolean;
  interval: number;
}

interface TabState {
  [tabId: number]: {
    intervalId?: any;
    intervalMs?: number;
  };
}

const tabState: TabState = {};

chrome.runtime.onMessage.addListener(
  async (message: Message, sender, sendResponse) => {
    switch (message.type) {
      case MessageType.ENABLE:
        // Clear interval if it exists
        if (tabState[message.tabId]?.intervalId !== undefined) {
          clearInterval(tabState[message.tabId].intervalId);
          tabState[message.tabId].intervalId = undefined;
        }

        // Set interval
        tabState[message.tabId] = {
          intervalId: setInterval(
            () =>
              chrome.scripting.executeScript({
                target: { tabId: message.tabId },
                func: () => location.reload(),
              }),
            tabState[message.tabId]?.intervalMs ?? 1000
          ),
          intervalMs: tabState[message.tabId]?.intervalMs ?? 1000,
        };
        break;

      case MessageType.DISABLE:
        // Clear interval if it exists
        if (tabState[message.tabId]?.intervalId !== undefined) {
          clearInterval(tabState[message.tabId].intervalId);
          tabState[message.tabId].intervalId = undefined;
        }
        break;

      case MessageType.GET_CURRENT_STATUS:
        sendResponse({
          enabled: tabState[message.tabId]?.intervalId !== undefined,
          interval: (tabState[message.tabId]?.intervalMs ?? 1000) / 1000,
        } as GetCurrentStatusResponse);
        return true;

      case MessageType.SET_REFRESH_INTERVAL:
        const payload = (message as Message<SetRefreshIntervalMessagePayload>)
          .payload;
        if (payload) {
          if (tabState[message.tabId]?.intervalId !== undefined) {
            clearInterval(tabState[message.tabId].intervalId);
          }
          tabState[message.tabId] = { intervalMs: payload.interval * 1000 };
        }
        break;
    }
  }
);
