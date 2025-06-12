function logout() {
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    window.location.href = "auth.html";
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("User not logged in");
      window.location.href = "auth.html";
      return;
    }
  
    const username = localStorage.getItem("username");
    if (username) {
      document.getElementById("username-display").textContent = username;
    }
  
    const form = document.getElementById("expense-form");
    const list = document.getElementById("expense-list");
    const summary = document.getElementById("summary");
    const logoutBtn = document.getElementById("logout-btn");
  
    let isEditing = false;
    let editId = null;
  
    // 👇 Handle custom category field visibility
    window.checkCustomCategory = function (selectElement) {
      const customInput = document.getElementById("custom-category");
      if (selectElement.value === "Other") {
        customInput.style.display = "block";
      } else {
        customInput.style.display = "none";
        customInput.value = "";
      }
    };
  
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
  
      const name = document.getElementById("name").value.trim();
      const amount = parseFloat(document.getElementById("amount").value);
      const date = document.getElementById("date").value;
      let category = document.getElementById("category").value;
      const customCategory = document.getElementById("custom-category").value.trim();
  
      if (category === "Other" && customCategory) {
        category = customCategory;
      }
  
      if (!name || isNaN(amount) || !date || !category) {
        alert("Please fill all fields correctly.");
        return;
      }
  
      const expenseData = { name, amount, date, category };
  
      try {
        const url = isEditing ? `/api/expenses/${editId}` : "/api/expenses/add";
        const method = isEditing ? "PUT" : "POST";
        const body = isEditing
          ? JSON.stringify(expenseData)
          : JSON.stringify({ ...expenseData, userId });
  
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body,
        });
  
        const data = await res.json();
        if (res.ok) {
          alert(isEditing ? "Expense updated!" : "Expense added!");
          resetForm();
          loadExpenses();
        } else {
          alert(data.message || "Failed to save expense");
        }
      } catch (err) {
        console.error(err);
        alert("Server error.");
      }
    });
  
    logoutBtn?.addEventListener("click", logout);
  
    window.deleteExpense = async (id) => {
      if (!confirm("Are you sure you want to delete this expense?")) return;
      await fetch(`/api/expenses/${id}`, { method: "DELETE" });
      loadExpenses();
    };
  
    window.startEdit = (id, name, amount, category, date) => {
      document.getElementById("name").value = name;
      document.getElementById("amount").value = amount;
      document.getElementById("category").value = category;
      document.getElementById("date").value = date;
  
      isEditing = true;
      editId = id;
    };
  
    function resetForm() {
      form.reset();
      isEditing = false;
      editId = null;
      document.getElementById("custom-category").style.display = "none";
    }
  
    async function loadExpenses() {
      const res = await fetch(`/api/expenses/${userId}`);
      const expenses = await res.json();
  
      list.innerHTML = "";
      let total = 0;
      const categoryTotals = {};
      const monthlyTotals = {
        Jan: 0, Feb: 0, Mar: 0, Apr: 0, May: 0, Jun: 0,
        Jul: 0, Aug: 0, Sep: 0, Oct: 0, Nov: 0, Dec: 0
      };
  
      expenses.forEach((exp) => {
        const amt = parseFloat(exp.amount) || 0;
        total += amt;
        categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + amt;
  
        const dateObj = new Date(exp.date);
        const month = dateObj.toLocaleString("default", { month: "short" });
        monthlyTotals[month] += amt;
  
        const item = document.createElement("li");
        item.innerHTML = `
          ${exp.name} - ₹${amt.toFixed(2)} - ${exp.category} on ${exp.date.split('T')[0]}
          <button onclick="deleteExpense(${exp.id})">🗑</button>
          <button onclick="startEdit(${exp.id}, '${exp.name.replace(/'/g, "\\'")}', ${amt}, '${exp.category}', '${exp.date.split('T')[0]}')">✏️</button>
        `;
        list.appendChild(item);
      });
  
      summary.textContent = `Total Spent: ₹${total.toFixed(2)}`;
      drawPieChart(categoryTotals);
      drawMonthlyLineChart(monthlyTotals);
    }
  
    function drawPieChart(data) {
      const ctx = document.getElementById("category-chart").getContext("2d");
      if (window.categoryChart) window.categoryChart.destroy();
  
      window.categoryChart = new Chart(ctx, {
        type: "pie",
        data: {
          labels: Object.keys(data),
          datasets: [{
            data: Object.values(data),
            backgroundColor: [
              "#ff6384", "#36a2eb", "#ffcd56", "#4bc0c0", "#9966ff", "#ff9f40"
            ]
          }]
        },
        options: {
          responsive: false,
          plugins: {
            legend: { position: "bottom" }
          }
        }
      });
    }
  
    function drawMonthlyLineChart(data) {
      const ctx = document.getElementById("monthly-line-chart").getContext("2d");
      if (window.monthlyLineChart) window.monthlyLineChart.destroy();
  
      const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
      window.monthlyLineChart = new Chart(ctx, {
        type: "line",
        data: {
          labels: monthOrder,
          datasets: [{
            label: "Monthly Expense Trend",
            data: monthOrder.map(month => data[month]),
            fill: false,
            borderColor: "#ff6384",
            tension: 0.3,
            pointBackgroundColor: "#ff6384",
            pointRadius: 4
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Amount (₹)'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Month'
              }
            }
          },
          responsive: false,
          plugins: {
            legend: {
              display: true,
              position: "top"
            }
          }
        }
      });
    }
  
    loadExpenses();
  });
  