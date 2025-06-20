
    const container = document.querySelector(".container");
    const registerBtn = document.querySelector(".register-btn");
    const loginBtn = document.querySelector(".login-btn");

    registerBtn.addEventListener("click", () => {
        container.classList.add("active");
    });
    loginBtn.addEventListener("click", () => {
        container.classList.remove("active");
    });

    // login form 
    document.getElementById("login-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const username = document.getElementById("username").value; 
        const password = document.getElementById("password").value; 

        try {
            
            const response = await fetch("http://localhost:4000/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json" 
                },
                body: JSON.stringify({ username, password }) 
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem("token", data.token); 
                alert("Login successful!"); 
                window.location.href = "index.html"; 
            } else {
                alert("Login failed. Please check your username and password."); 
            }
        } catch (error) {
            console.error("Error during login:", error);
            alert("An error occurred. Please try again later.");
        }
    });

    // registration form 
    document.getElementById("register-form").addEventListener("submit", async (e) => {
        e.preventDefault(); 
        const username = document.getElementById("reg-username").value; 
        const email = document.getElementById("reg-email").value; 
        const password = document.getElementById("reg-password").value;

        try {
            
            const response = await fetch("http://localhost:4000/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json" 
                },
                body: JSON.stringify({ username, email, password }) 
            });

            if (response.ok) {
                alert("Registration successful! You can now log in."); 
                container.classList.remove("active"); 
            } else {
                alert("Registration failed. Please try again.");
            }
        } catch (error) {
            console.error("Error during registration:", error);
            alert("An error occurred. Please try again later.");
        }
    });

