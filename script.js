// 旅遊預算小工具 —— 純 JavaScript，無外部相依

// 各項支出欄位的定義（id 對應 HTML，label 為顯示名稱）
const EXPENSE_FIELDS = [
  { id: "flight", label: "機票" },
  { id: "accommodation", label: "住宿" },
  { id: "transport", label: "當地交通" },
  { id: "food", label: "餐飲" },
  { id: "tickets", label: "景點門票" },
  { id: "shopping", label: "購物" },
  { id: "other", label: "其他" },
];

// 取得 DOM 元素
const form = document.getElementById("budget-form");
const clearBtn = document.getElementById("clear-btn");
const errorMsg = document.getElementById("error-msg");
const results = document.getElementById("results");
const totalValue = document.getElementById("total-value");
const dailyValue = document.getElementById("daily-value");
const maxValue = document.getElementById("max-value");
const breakdown = document.getElementById("breakdown");

// 將數字格式化為帶千分位的金額字串，例如 $12,345
function formatMoney(amount) {
  const rounded = Math.round(amount * 100) / 100;
  return "$" + rounded.toLocaleString("zh-TW", { maximumFractionDigits: 2 });
}

// 讀取欄位數值，非數字或負數一律視為 0
function readNumber(id) {
  const value = parseFloat(document.getElementById(id).value);
  if (!isFinite(value) || value < 0) {
    return 0;
  }
  return value;
}

// 顯示錯誤訊息
function showError(message) {
  errorMsg.textContent = message;
  errorMsg.hidden = false;
}

// 清除錯誤訊息
function clearError() {
  errorMsg.textContent = "";
  errorMsg.hidden = true;
}

// 計算並顯示結果
function calculate() {
  clearError();

  // 驗證旅行天數
  const days = parseInt(document.getElementById("days").value, 10);
  if (!isFinite(days) || days < 1) {
    results.hidden = true;
    showError("請輸入有效的旅行天數（至少 1 天）。");
    return;
  }

  // 蒐集各項支出
  const expenses = EXPENSE_FIELDS.map((field) => ({
    label: field.label,
    amount: readNumber(field.id),
  }));

  // 計算總額
  const total = expenses.reduce((sum, item) => sum + item.amount, 0);

  if (total <= 0) {
    results.hidden = true;
    showError("請至少輸入一項預算金額。");
    return;
  }

  // 每日平均花費
  const dailyAvg = total / days;

  // 找出最大支出項目
  let maxItem = expenses[0];
  for (const item of expenses) {
    if (item.amount > maxItem.amount) {
      maxItem = item;
    }
  }

  // 更新摘要
  totalValue.textContent = formatMoney(total);
  dailyValue.textContent = formatMoney(dailyAvg);
  maxValue.textContent = maxItem.amount > 0
    ? maxItem.label + "（" + formatMoney(maxItem.amount) + "）"
    : "—";

  // 更新明細清單
  breakdown.innerHTML = "";
  expenses.forEach((item) => {
    const li = document.createElement("li");
    if (item.amount > 0 && item.label === maxItem.label) {
      li.classList.add("is-max");
    }

    const name = document.createElement("span");
    name.className = "item-name";
    name.textContent = item.label;

    const amount = document.createElement("span");
    amount.className = "item-amount";
    amount.textContent = formatMoney(item.amount);

    li.appendChild(name);
    li.appendChild(amount);
    breakdown.appendChild(li);
  });

  // 顯示結果並捲動到結果區
  results.hidden = false;
  results.scrollIntoView({ behavior: "smooth", block: "start" });
}

// 清除所有輸入與結果
function clearAll() {
  form.reset();
  clearError();
  results.hidden = true;
  breakdown.innerHTML = "";
  document.getElementById("days").focus();
}

// 綁定事件
form.addEventListener("submit", function (event) {
  event.preventDefault();
  calculate();
});

clearBtn.addEventListener("click", clearAll);
