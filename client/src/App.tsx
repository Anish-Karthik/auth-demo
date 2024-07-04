// import { useState } from "react";
import { useEffect, useState } from "react";
import "./App.css";
import axios from "axios";

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
  {
    username: "anishkarthika21cs@psnacet.edu.in",
    password: "password",
  },
  {
    username: "athomaspaulroy@psnacet.edu.in",
    password: "password",
  },
  {
    username: "benedictraja@psnacet.edu.in",
    password: "password",
  },
  {
    username: "csehod@psnacet.edu.in",
    password: "password",
  }
];

function App() {
  const [csrfToken, setCsrfToken] = useState("");
  useEffect(() => {
    fetch("http://localhost:3000/api/", {
      method: "GET",
      credentials: "include",
    })
      .then(() => console.log("Cookie set"))
      .catch((err) => console.log(err.message));
  }, []);
  console.log(csrfToken);
  return (
    <>
      {arr.map((user) => (
        <div key={user.username}>
          <button
            onClick={() => {
              // fetch("http://localhost:3000/login", {
              //   method: "POST",
              //   headers: {
              //     "Content-Type": "application/json",
              //   },
              //   credentials: "include",
              //   body: JSON.stringify({
              //     ...user,
              //   }),
              // })
              axios
                .post(
                  "http://localhost:3000/api/auth/signup",
                  {
                    ...user,
                  },
                  {
                    withCredentials: true,
                  }
                )
                // .then((res) => {
                //   console.log(res.headers);
                //   return res.json();
                // })
                .then((data) => {
                  setCsrfToken(data.csrfToken);
                  console.log(data);
                  alert(JSON.stringify(data));
                  // alert(`${user.username} Logged In`);
                })
                .catch((err) => {
                  console.log(err);
                  alert(err);
                });
            }}
          >
            {user.username} login
          </button>
        </div>
      ))}
      <button
        onClick={() => {
          fetch("http://localhost:3000/api/auth/logout", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              // csrfToken,
            },
            credentials: "include",
          })
            .then((response) => response.json())
            .then((data) => {
              alert(data.message);
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
          fetch("http://localhost:3000/api/auth/profile", {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              csrfToken: csrfToken,
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
