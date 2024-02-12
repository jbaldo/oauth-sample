const Asana = require("asana");
const passport = require("passport");
const AsanaStrategy = require("passport-asana").Strategy;
const express = require("express");
const session = require("express-session");

const app = express();
const port = 3000;

const client = Asana.ApiClient.instance;
const token = client.authentications["token"];


passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (obj, done) {
  done(null, obj);
});

passport.use(
  new AsanaStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "https://t8dmgz-3000.csb.app/auth/asana/callback", // must be registered as Redirect URI in Asana
    },
    function (accessToken, refreshToken, profile, done) {
      token.accessToken = accessToken;
      console.log("got token");
      return done(null, profile);
    },
  ),
);

app.use(session({ secret: "meow mix" }));

// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/me", (req, res) => {
  let usersApiInstance = new Asana.UsersApi(); // instance to access users
  usersApiInstance.getUser("me").then(
    function (me) {
      res.send(me);
    },
    (error) => {
      console.error(error.response.body);
      res.send(error.response.body);
    },
  );
});

// let tasksApiInstance = new Asana.TasksApi();
app.get("/auth/asana", passport.authenticate("Asana"), function (req, res) {
  // The request will be redirected to asana.com for authentication, so this
  // function will not be called.
});

app.get(
  "/auth/asana/callback",
  passport.authenticate("Asana", { failureRedirect: "/login" }),
  function (req, res) {
    console.log("called back successfully");
    // Successful authentication, redirect home.
    res.redirect("/me");
  },
);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
