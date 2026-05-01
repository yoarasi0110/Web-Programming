var EXPENSE_KEY = "expenses";
var INCOME_KEY = "incomes";
var EXPENSE_CATEGORIES = ["飲食", "交通", "娛樂", "學習", "其他"];
var INCOME_CATEGORIES = ["薪資", "獎金", "投資", "兼職", "其他"];

function generateId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }
  return "id-" + Date.now() + "-" + Math.random().toString(16).slice(2);
}

function withId(item) {
  var result = {};
  var key;
  for (key in item) {
    if (Object.prototype.hasOwnProperty.call(item, key)) result[key] = item[key];
  }
  result.id = item.id || generateId();
  return result;
}

var expenses = (JSON.parse(localStorage.getItem(EXPENSE_KEY)) || []).map(withId);
var incomes = (JSON.parse(localStorage.getItem(INCOME_KEY)) || []).map(withId);
var expenseChart;
var incomeChart;

function saveAll() {
  localStorage.setItem(EXPENSE_KEY, JSON.stringify(expenses));
  localStorage.setItem(INCOME_KEY, JSON.stringify(incomes));
}

function formatCurrency(value) {
  return value.toLocaleString("zh-TW");
}

function pad2(n) {
  return n < 10 ? "0" + n : String(n);
}

function formatYearMonth(dateString) {
  var d = new Date(dateString);
  return d.getFullYear() + "/" + pad2(d.getMonth() + 1);
}

function isCurrentMonth(dateString) {
  var now = new Date();
  var d = new Date(dateString);
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

function getMonthlyData(list) {
  return list.filter(function (item) { return isCurrentMonth(item.date); });
}

function animateNumber(id, target) {
  var el = document.getElementById(id);
  var start = Number(el.textContent.replace(/,/g, "")) || 0;
  var startTime = performance.now();
  var duration = 500;

  function tick(ts) {
    var p = Math.min((ts - startTime) / duration, 1);
    el.textContent = formatCurrency(Math.round(start + (target - start) * p));
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function buildCategoryMap(categories) {
  var map = {};
  var i;
  for (i = 0; i < categories.length; i += 1) map[categories[i]] = 0;
  return map;
}

function calculateTotals(list, categories) {
  var result = buildCategoryMap(categories);
  getMonthlyData(list).forEach(function (item) {
    result[item.category] += Number(item.amount);
  });
  return result;
}

function renderGroupedList(list, elementId, type) {
  var tbody = document.getElementById(elementId);
  tbody.innerHTML = "";

  if (list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5">尚無資料。</td></tr>';
    return;
  }

  var sorted = list.slice().sort(function (a, b) {
    return new Date(b.date) - new Date(a.date);
  });

  var group = "";
  sorted.forEach(function (item) {
    var ym = formatYearMonth(item.date);
    var tr;

    if (ym !== group) {
      group = ym;
      tr = document.createElement("tr");
      tr.className = "group-row";
      tr.innerHTML = '<td colspan="5">📅 ' + ym + '</td>';
      tbody.appendChild(tr);
    }

    tr = document.createElement("tr");
    tr.innerHTML = '<td>' + item.category + '</td>' +
      '<td>$ ' + formatCurrency(Number(item.amount)) + '</td>' +
      '<td>' + item.date + '</td>' +
      '<td>' + (item.note || "-") + '</td>' +
      '<td><button class="delete-btn" data-type="' + type + '" data-id="' + item.id + '">刪除</button></td>';
    tbody.appendChild(tr);
  });
}

function renderPieChart(canvasId, chartRef, categories, totals, noDataLabel) {
  var canvas = document.getElementById(canvasId);
  if (!window.Chart) {
    var parent = canvas.parentElement;
    var old = parent.querySelector(".chart-warning");
    if (!old) {
      var msg = document.createElement("p");
      msg.className = "chart-warning";
      msg.textContent = "圖表套件載入失敗（可能是網路或 CDN 被阻擋），但資料仍可正常記錄。";
      parent.appendChild(msg);
    }
    return null;
  }

  var data = categories.map(function (c) { return totals[c]; });
  var hasData = data.some(function (v) { return v > 0; });
  if (chartRef) chartRef.destroy();

  return new Chart(canvas, {
    type: "pie",
    data: {
      labels: hasData ? categories : [noDataLabel],
      datasets: [{
        data: hasData ? data : [1],
        backgroundColor: hasData ? ["#60a5fa", "#34d399", "#f472b6", "#fbbf24", "#a78bfa"] : ["#cbd5e1"]
      }]
    },
    options: { plugins: { legend: { position: "bottom" } } }
  });
}

function updateSummary() {
  var expenseTotal = getMonthlyData(expenses).reduce(function (s, i) { return s + Number(i.amount); }, 0);
  var incomeTotal = getMonthlyData(incomes).reduce(function (s, i) { return s + Number(i.amount); }, 0);
  animateNumber("totalExpense", expenseTotal);
  animateNumber("totalIncome", incomeTotal);
  animateNumber("monthlyBalance", incomeTotal - expenseTotal);
}

function refreshUI() {
  renderGroupedList(expenses, "expenseList", "expense");
  renderGroupedList(incomes, "incomeList", "income");
  expenseChart = renderPieChart("expenseChart", expenseChart, EXPENSE_CATEGORIES, calculateTotals(expenses, EXPENSE_CATEGORIES), "當月無支出");
  incomeChart = renderPieChart("incomeChart", incomeChart, INCOME_CATEGORIES, calculateTotals(incomes, INCOME_CATEGORIES), "當月無收入");
  updateSummary();
}

function bindEvents() {
  var expenseForm = document.getElementById("expenseForm");
  var incomeForm = document.getElementById("incomeForm");

  expenseForm.addEventListener("submit", function (e) {
    e.preventDefault();
    expenses.push(withId({
      amount: Number(document.getElementById("amount").value),
      category: document.getElementById("category").value,
      date: document.getElementById("date").value,
      note: document.getElementById("note").value.trim()
    }));
    saveAll();
    refreshUI();
    expenseForm.reset();
  });

  incomeForm.addEventListener("submit", function (e) {
    e.preventDefault();
    incomes.push(withId({
      amount: Number(document.getElementById("incomeAmount").value),
      category: document.getElementById("incomeCategory").value,
      date: document.getElementById("incomeDate").value,
      note: document.getElementById("incomeNote").value.trim()
    }));
    saveAll();
    refreshUI();
    incomeForm.reset();
  });

  document.addEventListener("click", function (e) {
    if (!e.target.classList.contains("delete-btn")) return;
    var id = e.target.dataset.id;
    var type = e.target.dataset.type;
    if (type === "expense") expenses = expenses.filter(function (i) { return i.id !== id; });
    if (type === "income") incomes = incomes.filter(function (i) { return i.id !== id; });
    saveAll();
    refreshUI();
  });

  function toggle(buttonId, formId) {
    var btn = document.getElementById(buttonId);
    var form = document.getElementById(formId);
    btn.addEventListener("click", function () {
      var hidden = form.style.display === "none";
      form.style.display = hidden ? "grid" : "none";
    });
  }

  toggle("toggleExpenseForm", "expenseForm");
  toggle("toggleIncomeForm", "incomeForm");
}

saveAll();
bindEvents();
refreshUI();
