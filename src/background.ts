let intervalId: any | undefined = undefined;
let intervalMs = 1000;

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message === 'enable') {
    clearInterval(intervalId);
    intervalId = undefined;
    const tab = await getCurrentTab();
    intervalId = setInterval(() =>
      chrome.scripting.executeScript({
        target: { tabId: tab.id as number },
        func: () => location.reload()
      }),
      intervalMs
    );
  } else if (message === 'disable') {
    clearInterval(intervalId);
    intervalId = undefined;
  } else if (message === 'get-current-status') {
    sendResponse({ enabled: !!intervalId, interval: intervalMs / 1000 });
    return true;
  } else if (message.type === 'set-refresh-interval') {
    intervalMs = message.payload.interval * 1000;
  }
});

async function getCurrentTab() {
  const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true })
  return tabs[0];
}