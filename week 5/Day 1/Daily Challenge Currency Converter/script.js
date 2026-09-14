const API_KEY = "45b00ef768b8a6119a6a18d6";
const API_BASE = `https://v6.exchangerate-api.com/v6/${API_KEY}`;
const FALLBACK_CURRENCIES = [
  ["USD", "US Dollar"],
  ["EUR", "Euro"],
  ["GBP", "British Pound"],
  ["JPY", "Japanese Yen"],
  ["CAD", "Canadian Dollar"],
  ["AUD", "Australian Dollar"],
  ["CHF", "Swiss Franc"],
  ["INR", "Indian Rupee"],
  ["ZAR", "South African Rand"],
  ["ILS", "Israeli New Shekel"]
];

const form = document.querySelector("#converter-form");
const amountInput = document.querySelector("#amount");
const fromSelect = document.querySelector("#from-currency");
const toSelect = document.querySelector("#to-currency");
const switchButton = document.querySelector("#switch-button");
const convertButton = document.querySelector("#convert-button");
const result = document.querySelector("#result");
const status = document.querySelector("#status");

function setStatus(message, isError = false) {
  status.textContent = message;
  status.className = isError ? "status error" : "status";
}

function addCurrencyOptions(currencies) {
  const options = currencies.map(([code, name]) =>
    `<option value="${code}">${code} — ${name}</option>`
  ).join("");
  fromSelect.innerHTML = options;
  toSelect.innerHTML = options;
  fromSelect.value = "EUR";
  toSelect.value = "GBP";
  fromSelect.disabled = false;
  toSelect.disabled = false;
  switchButton.disabled = false;
  convertButton.disabled = false;
  convertButton.textContent = "Convert";
}

function addFallbackCurrencies() {
  addCurrencyOptions(FALLBACK_CURRENCIES);
  convertButton.disabled = true;
  convertButton.textContent = "Add API key to convert";
  setStatus("Common currencies shown. Add your API key for live currency data.", true);
}

async function fetchSupportedCurrencies() {
  if (API_KEY === "YOUR_EXCHANGERATE_API_KEY") {
    throw new Error("Add your ExchangeRate-API key in script.js first.");
  }
  const response = await fetch(`${API_BASE}/codes`);
  const data = await response.json();
  if (!response.ok || data.result !== "success") throw new Error(data["error-type"] || "Could not load currencies.");
  addCurrencyOptions(data.supported_codes);
}

async function convertCurrency(event) {
  event.preventDefault();
  const amount = Number(amountInput.value);
  if (!Number.isFinite(amount) || amount < 0) {
    setStatus("Please enter a valid positive amount.", true);
    return;
  }

  convertButton.disabled = true;
  convertButton.textContent = "Converting...";
  setStatus("Fetching the latest exchange rate...");
  try {
    const from = fromSelect.value;
    const to = toSelect.value;
    const response = await fetch(`${API_BASE}/pair/${from}/${to}/${amount}`);
    const data = await response.json();
    if (!response.ok || data.result !== "success") throw new Error(data["error-type"] || "Conversion failed.");
    result.innerHTML = `<strong>${amount.toLocaleString()} ${from}</strong><span>＝</span><strong>${data.conversion_result.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${to}</strong><small>1 ${from} = ${data.conversion_rate} ${to}</small>`;
    setStatus(`Rate updated: ${new Date().toLocaleTimeString()}`);
  } catch (error) {
    setStatus(error.message, true);
    result.innerHTML = "<p>Unable to complete the conversion.</p>";
  } finally {
    convertButton.disabled = false;
    convertButton.textContent = "Convert";
  }
}

switchButton.addEventListener("click", () => {
  [fromSelect.value, toSelect.value] = [toSelect.value, fromSelect.value];
  if (fromSelect.value && toSelect.value) form.requestSubmit();
});
form.addEventListener("submit", convertCurrency);

fetchSupportedCurrencies().catch(error => {
  addFallbackCurrencies();
  setStatus(error.message, true);
  switchButton.disabled = true;
  convertButton.textContent = "Add API key to begin";
});
