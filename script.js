fetch("http://localhost:5000/admin-register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, email, password })
  })
    .then(response => {
      console.log(response); // Log response to check what you get from the server
      return response.json();
    })
    .then(data => console.log(data)) // Log the actual response data
    .catch(error => console.error("Error:", error)); // Catch and log any errors
  