import { Lucia } from "lucia";
import { BetterSqlite3Adapter } from "@lucia-auth/adapter-sqlite";
import { db } from "./db";

const adapter = new BetterSqlite3Adapter(db, {
  user: "user",
  session: "session",
}); // your adapter

export const lucia = new Lucia(adapter, {
	sessionCookie: {
		attributes: {
      sameSite: "lax",
			// set to `true` when using HTTPS
			secure: process.env.NODE_ENV === "production"
		}
	}
});

// IMPORTANT!
declare module "lucia" {
	interface Register {
		Lucia: typeof lucia;
	}
}