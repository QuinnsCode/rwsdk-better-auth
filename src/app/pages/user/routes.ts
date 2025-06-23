import { route } from "rwsdk/router";
import  { Login } from "./Login";
import { sessions } from "@/session/store";
import Signup from "./Signup";

  // route("/login", [Login]),
  //  this was a problem with bundling
  //  when we have single item in array => drop the brackets 
export const userRoutes = [
  route("/login", Login),
  route("/logout", async function ({ request }) {
    const headers = new Headers();
    await sessions.remove(request, headers);
    headers.set("Location", "/");

    return new Response(null, {
      status: 302,
      headers,
    });
  }),
  route("/signup", Signup),
];
