// import { useState } from "react";
import { useState } from "react";
import "./App.css";

// users.set("user1", "password1");
// users.set("user2", "password2");
// users.set("admin", "admin");
const arr = [
  {
    username: "user1",
    password: "password1",
  },
  {
    username: "user2",
    password: "password2",
  },
  {
    username: "admin",
    password: "admin",
  },
];

function App() {
  const [csrfToken, setCsrfToken] = useState("");
  console.log(csrfToken);
  return (
    <>
      {arr.map((user) => (
        <div key={user.username}>
          <button
            onClick={() => {
              fetch("http://localhost:3000/login", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                  ...user,
                }),
              })
                .then((res) => res.json())
                .then((data) => {
                  setCsrfToken(data.csrfToken);
                  alert(JSON.stringify(data));
                  alert(`${user.username} Logged In`);
                })
                .catch((err) => alert(err));
            }}
          >
            {user.username} login
          </button>
        </div>
      ))}
      <button
        onClick={() => {
          fetch("http://localhost:3000/logout", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              csrfToken,
            },
            credentials: "include",
          })
            .then(() => {
              alert("Logged out");
              setCsrfToken("");
            })
            .catch((err) => alert(err));
        }}
      >
        Logout
      </button>
      <button
        onClick={() => {
          console.log("profile", csrfToken);
          fetch("http://localhost:3000/profile", {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              "csrfToken": csrfToken,
            },
          })
            .then((res) => res.json())
            .then((data) => alert(JSON.stringify(data)))
            .catch((err) => alert(err));
        }}
      >
        Profile
      </button>
    </>
  );
}

export default App;
