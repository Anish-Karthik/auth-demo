import express from "express";
import { generateId, verifyRequestOrigin } from "lucia";

import { lucia } from "./lib/auth.js";

import type { User, Session } from "lucia";
import { Argon2id } from "oslo/password";
import { db, type DatabaseUser } from "./lib/db.js";

const app = express();

app.use(express.urlencoded());

app.use(express.json());

// alternate to cors
// app.use((req, res, next) => {
//   console.log(req.method, req.url);
//   if (req.method === "GET") {
//     return next();
//   }
//   const originHeader = req.headers.origin ?? null;
//   const hostHeader = req.headers.host ?? null;
//   console.log(originHeader, hostHeader);
//   console.log(req.body.username, req.body.password);
//   if (
//     !originHeader ||
//     !hostHeader ||
//     !verifyRequestOrigin(originHeader, [hostHeader, "http://localhost:5173", "http://localhost:3001"])
//   ) {
//     return res.status(403).end();
//   }
//   return next();
// });

app.get("/" , (req, res) => {
  console.log("HI")
  res.json("Hello World");
})
/**
 * Reads the session cookie from the request headers and assigns it to the sessionId variable.
 * If the cookie is not present, an empty string is assigned.
 *
 * @param {string} cookie - The value of the cookie from the request headers.
 * @returns {string} The session ID extracted from the cookie.
 */
app.use(async (req, res, next) => {
  const sessionId = lucia.readSessionCookie(req.headers.cookie ?? "");
  // If the session ID is not present, the user is not logged in.
  if (!sessionId) {
    res.locals.user = null;
    res.locals.session = null;
    return next();
  }
  // If the session ID is present, the user is logged in.
  const { session, user } = await lucia.validateSession(sessionId);
  // If the session is fresh, a new session cookie is created and sent to the client.
  if (session && session.fresh) {
    res.appendHeader(
      "Set-Cookie",
      lucia.createSessionCookie(session.id).serialize()
    );
  }
  // If the session is not fresh, the session cookie is updated with the new expiry time.
  if (!session) {
    res.appendHeader(
      "Set-Cookie",
      lucia.createBlankSessionCookie().serialize()
    );
  }

  res.locals.session = session;
  res.locals.user = user;
  return next();
});


app.post("/signup", async (req, res) => {
  console.log(req.body);
  try {
    const { username, password } = req.body;
    console.log(username, password);
    if (!username || !password) {
      res.status(400).send("Invalid request");
      return;
    }
    const hashedPassword = await new Argon2id().hash(password);
    const userId = generateId(15);
    try {
      db.prepare(
        "INSERT INTO user (id, username, password) VALUES(?, ?, ?)"
      ).run(userId, username, hashedPassword);
      const session = await lucia.createSession(userId, {});
      res.appendHeader(
        "Set-Cookie",
        lucia.createSessionCookie(session.id).serialize()
      );
    } catch (error) {
      res.status(400).send("Username already exists");
    }
  } catch (error: any) {
    console.log(error.message);
    res.status(500).send("Internal server error");
  }
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log(username, password);
    if (!username || !password) {
      res.status(400).send("Invalid request");
      return;
    }
    const user = db
      .prepare("SELECT * FROM user WHERE username = ?")
      .get(username) as DatabaseUser;
    if (!user) {
      res.status(401).send("Invalid username or password");
      return;
    }
    const isValidPassword = await new Argon2id().verify(
      user.password,
      password
    );
    if (isValidPassword) {
      const session = await lucia.createSession(user.id, {});
      res.appendHeader(
        "Set-Cookie",
        lucia.createSessionCookie(session.id).serialize()
      );
      // TODO: send CSRF token
      // res.json({ csrfToken: session.csrfToken });
    } else {
      res.status(401).send("Invalid username or password");
    }
  } catch (error: any) {
    console.log(error.message);
    res.status(500).send("Internal server error");
  }
});

app.post("/logout", async (req, res) => {
  try {
    if (!res.locals.session) {
      res.status(401).send("Unauthenticated");
      return;
    }
    await lucia.invalidateSession(res.locals.session.id);
    res.appendHeader(
      "Set-Cookie",
      lucia.createBlankSessionCookie().serialize()
    );
    res.send("Logged out");
  } catch (error: any) {
    console.log(error.message);
    res.status(500).send("Internal server error");
  }
});

app.get("/profile", async (req, res) => {
  try {
    if (!res.locals.session) {
      res.status(401).send("Unauthenticated");
      return;
    }
    res.json(res.locals.user);
  } catch (error: any) {
    console.log(error.message);
    res.status(500).send("Internal server error");
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});

declare global {
  namespace Express {
    interface Locals {
      user: User | null;
      session: Session | null;
    }
  }
}
