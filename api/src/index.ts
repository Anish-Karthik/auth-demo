import express from "express";
import crypto from "crypto";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const port = 3000;

const users = new Map<string, string>();
users.set("user1", "password1");
users.set("user2", "password2");
users.set("admin", "admin");

const SESSION = new Map<
  string,
  {
    username: string;
    password: string;
    csrfToken: string;
  }
>();



app.post("/login", (req, res) => {
  console.log(req.body);
  const { username, password } = req.body;
  if (users.get(username) === password) {
    const sessionId = crypto.randomBytes(16).toString("hex");
    const csrfToken = crypto.randomBytes(16).toString("hex");
    SESSION.set(sessionId, { username, password, csrfToken });
    res.cookie("sessionId", sessionId, {
      httpOnly: true,
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24,
      secure: true,
    });
    res.json({ csrfToken });
  } else {
    res.status(401).send("Invalid username or password");
  }
});

app.post("/logout", (req, res) => {
  try {
    const sessionId = req.cookies.sessionId;
    const csrfToken = req.headers.csrftoken;
    console.log("logout", csrfToken);
    console.log(sessionId);
    if (!sessionId) {
      res.status(401).send("Unauthenticated");
      return;
    }
    if (!csrfToken) {
      res.status(401).send("CSRF token missing");
      return;
    }
    const session = SESSION.get(sessionId);
    if (!session) {
      res.status(401).send("Unauthenticated");
      return;
    }
    if (session.csrfToken !== csrfToken) {
      res.status(403).send("Invalid CSRF token");
      return;
    }

    SESSION.delete(sessionId);
    res.clearCookie("sessionId");
    res.send("Logged out");
  } catch (error: any) {
    console.log(error.message);
    res.status(500).send("Internal server error");
  }
});

app.get("/profile", (req, res) => {
  const sessionId = req.cookies.sessionId;
  const csrfToken = req.headers.csrftoken;
  console.log(csrfToken);
  console.log(req.headers);
  if (!sessionId) {
    res.status(401).send("Unauthenticated");
    return;
  }
  if (!csrfToken) {
    res.status(401).send("CSRF token missing");
    return;
  }
  const session = SESSION.get(sessionId);
  if (!session) {
    res.status(401).send("Unauthenticated");
    return;
  }
  if (session.csrfToken !== csrfToken) {
    res.status(403).send("Invalid CSRF token");
    return;
  }

  if (sessionId) {
    const username = SESSION.get(sessionId);
    if (username) {
      res.json({ username });
      return;
    }
  }
  res.status(401).send("Unauthenticated");
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
