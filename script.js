let categoryBudgets = {};
let categorySpent = {};
let expenses = [];

const budgetForm = document.getElementById("budget-form");
const expenseForm = document.getElementById("expense-form");
const expenseList = document.getElementById("expense-list");
const budgetSummary = document.getElementById("budget-summary");
const chartCanvas = document.getElementById("expense-chart");
let expenseChart;

const userId = localStorage.getItem("userId");

// Redirect to login if not logged in
if (!userId) {
  alert("Please log in first.");
  window.location.href = "login.html";
}

// Load user's expenses from DB
window.onload = async () => {
  const res = await fetch(`/api/expenses/${userId}`);
  const data = await res.json();
  expenses = data;
  categorySpent = {};
  expenses.forEach(exp => {
    if (!categorySpent[exp.category]) categorySpent[exp.category] = 0;
    categorySpent[exp.category] += exp.amount;
  });
  refreshUI();
};

budgetForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const formData = new FormData(budgetForm);
  categoryBudgets = {};
  categorySpent = {};
  for (let [category, value] of formData.entries()) {
    categoryBudgets[category] = parseFloat(value);
    categorySpent[category] = 0;
  }
  refreshUI();
});

expenseForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("expense-name").value;
  const amount = parseFloat(document.getElementById("expense-amount").value);
  const category = document.getElementById("expense-category").value;
  const date = document.getElementById("expense-date").value;

  if (!categoryBudgets[category]) {
    alert(`Please set a budget for ${category} first.`);
    return;
  }

  if ((categorySpent[category] || 0) + amount > categoryBudgets[category]) {
    alert(`Budget exceeded for ${category}.`);
    return;
  }

  const res = await fetch("/api/expenses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, name, amount, category, date }),
  });

  const newExpense = await res.json();
  expenses.push(newExpense);
  categorySpent[category] += amount;
  expenseForm.reset();
  refreshUI();
});

function refreshUI() {
  renderExpenses();
  updateBudgetSummary();
  updateChart();
}

function renderExpenses() {
  expenseList.innerHTML = "";
  expenses.forEach((exp) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${exp.name}</td>
      <td>₹${exp.amount.toFixed(2)}</td>
      <td>${exp.category}</td>
      <td>${exp.date}</td>
      <td><button onclick="deleteExpense(${exp.id})">Delete</button></td>
    `;
    expenseList.appendChild(row);
  });
}

async function deleteExpense(id) {
  await fetch(`/api/expenses/${id}`, { method: "DELETE" });
  const index = expenses.findIndex((e) => e.id === id);
  if (index !== -1) {
    const expense = expenses[index];
    categorySpent[expense.category] -= expense.amount;
    expenses.splice(index, 1);
    refreshUI();
  }
}

function updateBudgetSummary() {
  budgetSummary.innerHTML = "";
  for (let category in categoryBudgets) {
    const spent = categorySpent[category] || 0;
    const budget = categoryBudgets[category];
    const remaining = budget - spent;

    const div = document.createElement("div");
    div.className = "summary-box";
    div.innerHTML = `<strong>${category}</strong><br/>
      Budget: ₹${budget}<br/>
      Spent: ₹${spent.toFixed(2)}<br/>
      Remaining: ₹${remaining.toFixed(2)}`;
    budgetSummary.appendChild(div);
  }
}

function updateChart() {
  const labels = Object.keys(categorySpent);
  const data = Object.values(categorySpent);

  if (expenseChart) expenseChart.destroy();

  expenseChart = new Chart(chartCanvas, {
    type: 'pie',
    data: {
      labels,
      datasets: [{
        label: 'Spending by Category',
        data,
        backgroundColor: [
          '#007bff', '#28a745', '#ffc107', '#dc3545', '#17a2b8', '#6f42c1'
        ]
      }]
    },
    options: { responsive: true }
  });
}
