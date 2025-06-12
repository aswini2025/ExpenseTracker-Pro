document.getElementById("expense-form").addEventListener("submit", async (e) => {
    e.preventDefault();
  
    const name = document.getElementById("name").value;
    const amount = parseFloat(document.getElementById("amount").value);
    const category = document.getElementById("category").value;
    const date = document.getElementById("date").value;
    const userId = localStorage.getItem("userId");
  
    if (!userId) {
      alert("User not logged in.");
      window.location.href = "auth.html";
      return;
    }
  
    try {
      const res = await fetch("/api/expenses/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, name, amount, category, date }),
      });
  
      const data = await res.json();
  
      if (res.ok) {
        alert("Expense added successfully!");
        document.getElementById("expense-form").reset();
      } else {
        alert(data.message || "Something went wrong.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to connect to server.");
    }
  });
  