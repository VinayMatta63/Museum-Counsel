if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const engine = require("ejs-mate");
const path = require("path");
const ExpressError = require("./utils/ExpressError");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/User");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const dbUrl = process.env.DB_URL;
const MongoStore = require("connect-mongo")(session);
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const museumsRoute = require("./routes/museums");
const reviewsRoute = require("./routes/reviews");
const usersRoute = require("./routes/users");
const { profile } = require("console");

mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
  console.log("Database Connected");
});

app.engine("ejs", engine);
app.set("views", path.join(__dirname, "/views"));
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));
app.use(mongoSanitize());
app.use(helmet({ contentSecurityPolicy: false }));

const secret = process.env.SECRET || "thisshouldbeabettersecret";

const store = new MongoStore({
  url: dbUrl,
  secret,
  touchAfter: 24 * 60 * 60,
});
store.on("error", function (e) {
  console.log("Session Store Error!", e);
});

const sessionConfig = {
  name: "session",
  secret,
  resave: false,
  store,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // secure: true,
    expire: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "https://museum-counsel.herokuapp.com/auth/google/callback",
      // callbackURL: "http://localhost:8080/auth/google/callback"
    },
    function (accessToken, refreshToken, profile, cb) {
      User.findOne({ email: profile.emails[0].value }).then((existingUser) => {
        if (existingUser) {
          cb(null, existingUser);
        } else {
          const url = profile.photos[0].value;
          const filename = "picture";
          const image = { url, filename };
          new User({
            email: profile.emails[0].value,
            username: profile.emails[0].value,
            image: image,
          })
            .save()
            .then((user) => {
              cb(null, user);
            });
        }
      });
    }
  )
);

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());
passport.serializeUser((user, done) => {
  done(null, user._id);
});
passport.deserializeUser((id, done) => {
  User.findById(id).then((user) => {
    done(null, user);
  });
});

app.use("/", usersRoute);
app.use("/museums", museumsRoute);
app.use("/museums/:id/reviews", reviewsRoute);

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function (req, res) {
    res.redirect("/");
  }
);

app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) {
    err.message = "Oh No, Something went wrong!";
  }
  res.status(statusCode).render("error.ejs", { err });
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Serving on port ${port}`);
});
