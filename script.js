function createAccount() {
  const username = document.getElementById("username").value;
  const balance = document.getElementById("balance").value;

  if (!username || !balance) {
    document.getElementById("output").innerHTML =
      "Please fill all fields.";
    return;
  }

  document.getElementById("output").innerHTML =
    `Welcome <b>${username}</b><br>Your balance: $${balance}`;
}