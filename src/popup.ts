const autoRefreshEnabledToggle = document.getElementById("autoRefreshEnabledToggle") as HTMLInputElement;
const refreshIntervalInput = document.getElementById("refreshIntervalInput") as HTMLInputElement;

chrome.runtime.sendMessage('get-current-status', (response) => {
  autoRefreshEnabledToggle.checked = response.enabled;
  refreshIntervalInput.value = response.interval
});

autoRefreshEnabledToggle.addEventListener("click", (e) => {
  chrome.runtime.sendMessage((e.target as HTMLInputElement).checked ? 'enable' : 'disable');
});

refreshIntervalInput.addEventListener("input", (e) => {
  chrome.runtime.sendMessage({ type: 'set-refresh-interval', payload: { interval: (e.target as HTMLInputElement).value } })
})