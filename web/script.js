const EXPENSE_KEY = "expenses";
const INCOME_KEY = "incomes";
const EXPENSE_CATEGORIES = ["飲食", "交通", "娛樂", "學習", "其他"];
const INCOME_CATEGORIES = ["薪資", "獎金", "投資", "兼職", "其他"];

let expenses = (JSON.parse(localStorage.getItem(EXPENSE_KEY)) || []).map(withId);
let incomes = (JSON.parse(localStorage.getItem(INCOME_KEY)) || []).map(withId);
let expenseChart;
let incomeChart;

function withId(item) { return { ...item, id: item.id || crypto.randomUUID() }; }
function saveAll() {
  localStorage.setItem(EXPENSE_KEY, JSON.stringify(expenses));
  localStorage.setItem(INCOME_KEY, JSON.stringify(incomes));
}
function formatCurrency(value) { return value.toLocaleString("zh-TW"); }
function formatYearMonth(dateString) {
  const d = new Date(dateString);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function isCurrentMonth(dateString) {
  const now = new Date();
  const d = new Date(dateString);
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

function getMonthlyData(list) { return list.filter((item) => isCurrentMonth(item.date)); }

function animateNumber(id, target) {
  const el = document.getElementById(id);
  const start = Number(el.textContent.replace(/,/g, "")) || 0;
  const startTime = performance.now();
  const duration = 500;
  function tick(ts) {
    const p = Math.min((ts - startTime) / duration, 1);
    el.textContent = formatCurrency(Math.round(start + (target - start) * p));
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function calculateTotals(list, categories) {
  const result = Object.fromEntries(categories.map((c) => [c, 0]));
  getMonthlyData(list).forEach((item) => { result[item.category] += Number(item.amount); });
  return result;
}

function renderGroupedList(list, elementId, type) {
  const tbody = document.getElementById(elementId);
  tbody.innerHTML = "";
  if (list.length === 0) { tbody.innerHTML = `<tr><td colspan="5">尚無資料。</td></tr>`; return; }

  const sorted = list.slice().sort((a, b) => new Date(b.date) - new Date(a.date));
  let group = "";
  sorted.forEach((item) => {
    const ym = formatYearMonth(item.date);
    if (ym !== group) {
      group = ym;
      const tr = document.createElement("tr");
      tr.className = "group-row";
      tr.innerHTML = `<td colspan="5">📅 ${ym}</td>`;
      tbody.appendChild(tr);
    }
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${item.category}</td><td>$ ${formatCurrency(Number(item.amount))}</td><td>${item.date}</td><td>${item.note || "-"}</td><td><button class="delete-btn" data-type="${type}" data-id="${item.id}">刪除</button></td>`;
    tbody.appendChild(tr);
  });
}

function renderPieChart(canvasId, chartRef, categories, totals, noDataLabel) {
  const data = categories.map((c) => totals[c]);
  const hasData = data.some((v) => v > 0);
  if (chartRef) chartRef.destroy();
  return new Chart(document.getElementById(canvasId), {
    type: "pie",
    data: {
      labels: hasData ? categories : [noDataLabel],
      datasets: [{ data: hasData ? data : [1], backgroundColor: hasData ? ["#60a5fa", "#34d399", "#f472b6", "#fbbf24", "#a78bfa"] : ["#cbd5e1"] }]
    },
    options: { plugins: { legend: { position: "bottom" } } }
  });
}

function updateSummary() {
  const expenseTotal = getMonthlyData(expenses).reduce((s, i) => s + Number(i.amount), 0);
  const incomeTotal = getMonthlyData(incomes).reduce((s, i) => s + Number(i.amount), 0);
  const balance = incomeTotal - expenseTotal;
  animateNumber("totalExpense", expenseTotal);
  animateNumber("totalIncome", incomeTotal);
  animateNumber("monthlyBalance", balance);
}

function refreshUI() {
  renderGroupedList(expenses, "expenseList", "expense");
  renderGroupedList(incomes, "incomeList", "income");
  expenseChart = renderPieChart("expenseChart", expenseChart, EXPENSE_CATEGORIES, calculateTotals(expenses, EXPENSE_CATEGORIES), "當月無支出");
  incomeChart = renderPieChart("incomeChart", incomeChart, INCOME_CATEGORIES, calculateTotals(incomes, INCOME_CATEGORIES), "當月無收入");
  updateSummary();
}

function bindEvents() {
  document.getElementById("expenseForm").addEventListener("submit", (e) => {
    e.preventDefault();
    expenses.push(withId({ amount: Number(amount.value), category: category.value, date: date.value, note: note.value.trim() }));
    saveAll(); refreshUI(); e.target.reset();
  });
  document.getElementById("incomeForm").addEventListener("submit", (e) => {
    e.preventDefault();
    incomes.push(withId({ amount: Number(incomeAmount.value), category: incomeCategory.value, date: incomeDate.value, note: incomeNote.value.trim() }));
    saveAll(); refreshUI(); e.target.reset();
  });
  document.addEventListener("click", (e) => {
    if (!e.target.classList.contains("delete-btn")) return;
    const { id, type } = e.target.dataset;
    if (type === "expense") expenses = expenses.filter((i) => i.id !== id);
    if (type === "income") incomes = incomes.filter((i) => i.id !== id);
    saveAll(); refreshUI();
  });

  $("#toggleExpenseForm").on("click", () => $("#expenseForm").slideToggle(180));
  $("#toggleIncomeForm").on("click", () => $("#incomeForm").slideToggle(180));
}

saveAll();
bindEvents();
refreshUI();
