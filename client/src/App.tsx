// import { useState } from "react";
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
  // const [profile, setProfile] = useState({} as any);
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
                .then(() => {
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
            },
            credentials: "include",
          })
            .then(() => {
              alert("Logged out");
            })
            .catch((err) => alert(err));
        }}
      >
        Logout
      </button>
      <button
        onClick={() => {
          fetch("http://localhost:3000/profile", {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
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
