const STORAGE_KEY = "expenses";
const CATEGORY_LIST = ["飲食", "交通", "娛樂", "學習", "其他"];

let expenses = (JSON.parse(localStorage.getItem(STORAGE_KEY)) || []).map((item) => ({
  ...item,
  id: item.id || crypto.randomUUID()
}));
let chart;

function saveExpenses() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

function formatCurrency(value) {
  return value.toLocaleString("zh-TW");
}

function formatYearMonth(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}/${month}`;
}

function getCurrentMonthExpenses() {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  return expenses.filter((item) => {
    const date = new Date(item.date);
    return date.getMonth() === month && date.getFullYear() === year;
  });
}

function animateTotal(target) {
  const element = document.getElementById("totalAmount");
  const start = Number(element.textContent.replace(/,/g, "")) || 0;
  const duration = 500;
  const startTime = performance.now();

  function update(timestamp) {
    const progress = Math.min((timestamp - startTime) / duration, 1);
    const value = Math.round(start + (target - start) * progress);
    element.textContent = formatCurrency(value);
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

function calculateCategoryTotals() {
  const result = Object.fromEntries(CATEGORY_LIST.map((c) => [c, 0]));
  getCurrentMonthExpenses().forEach((item) => {
    result[item.category] += Number(item.amount);
  });
  return result;
}

function renderList() {
  const tbody = document.getElementById("expenseList");
  tbody.innerHTML = "";

  if (expenses.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5">尚無資料，請先新增支出。</td></tr>`;
    return;
  }

  const sortedExpenses = expenses
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  let currentGroup = "";
  sortedExpenses.forEach((item) => {
    const group = formatYearMonth(item.date);
    if (group !== currentGroup) {
      currentGroup = group;
      const groupRow = document.createElement("tr");
      groupRow.className = "group-row";
      groupRow.innerHTML = `<td colspan="5">📅 ${group}</td>`;
      tbody.appendChild(groupRow);
    }

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.category}</td>
      <td>$ ${formatCurrency(Number(item.amount))}</td>
      <td>${item.date}</td>
      <td>${item.note || "-"}</td>
      <td><button class="delete-btn" data-id="${item.id}">刪除</button></td>
    `;
    tbody.appendChild(row);
  });
}

function renderChart() {
  const totals = calculateCategoryTotals();
  const data = CATEGORY_LIST.map((category) => totals[category]);
  const hasData = data.some((value) => value > 0);

  const labels = hasData ? CATEGORY_LIST : ["當月無資料"];
  const dataset = hasData ? data : [1];
  const backgroundColor = hasData
    ? ["#60a5fa", "#34d399", "#f472b6", "#fbbf24", "#a78bfa"]
    : ["#cbd5e1"];

  if (chart) chart.destroy();

  chart = new Chart(document.getElementById("expenseChart"), {
    type: "pie",
    data: {
      labels,
      datasets: [{
        data: dataset,
        backgroundColor
      }]
    },
    options: {
      plugins: {
        legend: { position: "bottom" }
      }
    }
  });
}

function updateSummary() {
  const total = getCurrentMonthExpenses().reduce((sum, item) => sum + Number(item.amount), 0);
  animateTotal(total);
}

function refreshUI() {
  renderList();
  renderChart();
  updateSummary();
}

function bindEvents() {
  document.getElementById("expenseForm").addEventListener("submit", (event) => {
    event.preventDefault();

    const amount = Number(document.getElementById("amount").value);
    const category = document.getElementById("category").value;
    const date = document.getElementById("date").value;
    const note = document.getElementById("note").value.trim();

    expenses.push({ id: crypto.randomUUID(), amount, category, date, note });
    saveExpenses();
    refreshUI();
    event.target.reset();
  });

  document.getElementById("expenseList").addEventListener("click", (event) => {
    if (event.target.classList.contains("delete-btn")) {
      const { id } = event.target.dataset;
      expenses = expenses.filter((item) => item.id !== id);
      saveExpenses();
      refreshUI();
    }
  });

  $("#toggleForm").on("click", () => {
    $("#expenseForm").slideToggle(180);
  });
}

saveExpenses();
bindEvents();
refreshUI();
