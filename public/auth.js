let isSignup = true;

document.getElementById("toggle-link").addEventListener("click", () => {
  isSignup = !isSignup;
  document.getElementById("form-title").innerText = isSignup ? "Sign Up" : "Login";
  document.getElementById("submit-btn").innerText = isSignup ? "Sign Up" : "Login";
  document.getElementById("toggle-link").innerText = isSignup
    ? "Already have an account? Login"
    : "Don't have an account? Sign Up";
});

document.getElementById("auth-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const endpoint = isSignup ? "/api/auth/signup" : "/api/auth/login";

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    console.log("Response data:", data); // Useful for debugging

    if (res.ok) {
      alert(data.message);

      // ✅ Store userId and username in localStorage
      if (data.userId) {
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("username", username); // use the input value directly
      }
      

      window.location.href = "dashboard.html";
    } else {
      alert(data.message || "Something went wrong.");
    }
  } catch (err) {
    console.error(err);
    alert("Error connecting to server.");
  }
});
