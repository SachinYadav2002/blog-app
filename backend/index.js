const express = require("express");
const connect = require("./connect/connectdb");
const PostModel = require("./model/post");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const path = require("path");
const user = require("./model/user");
const { title } = require("process");
const app = express();

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.static("public"));
connect();

const verifyUser = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json("the token is missing");
  } else {
    jwt.verify(token, "sachin", (err, decoded) => {
      if (err) {
        return res.json("this token missing");
      } else {
        req.email = decoded.email;
        req.username = decoded.username;
        next();
      }
    });
  }
};

app.get("/", verifyUser, (req, res) => {
  return res.json({ email: req.email, username: req.username });
});
app.post("/regester", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exist = await user.findOne({ email });
    if (exist) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hash = await bcrypt.hash(password, 10);
    const newUser = new user({ name, email, password: hash });

    await newUser.save();
    res.json({ message: "success", user: newUser });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "server error" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const users = await user.findOne({ email });

    if (!users) {
      return res.json({ message: "User not found" });
    }

    const match = await bcrypt.compare(password, users.password);

    if (!match) {
      return res.json({ message: "Password is incorrect" });
    }

    const token = jwt.sign(
      { email: users.email, username: users.name },
      "sachin",
      { expiresIn: "1d" }
    );

    res.cookie("token", token, { httpOnly: true });

    return res.json({ message: "success", token });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
});

app.get("/logout", (req, res) => {
  res.clearCookie("tokan");
  return res.json("Success");
});
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "Public/Image");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});
const uploade = multer({
  storage: storage,
});

app.post("/create", verifyUser, uploade.single("file"), (req, res) => {
  PostModel.create({
    title: req.body.title,
    description: req.body.description,
    file: req.file.filename,
    email: req.body.email,
  })
    .then((result) => res.json({ message: "success" }))
    .catch((err) => res.json(err));
});

app.get("/getposts", (req, res) => {
  PostModel.find()
    .then((post) => res.json(post))
    .catch((err) => console.log(err));
});

//post
app.get("/getByid/:id", (req, res) => {
  const id = req.params.id;
  PostModel.findById({ _id: id })
    .then((post) => res.json(post))
    .catch((err) => console.log(err));
});

app.put("/edit/:id", (req, res) => {
  const id = req.params.id;
  PostModel.findByIdAndUpdate(
    { _id: id },
    {
      title: req.body.title,
      description: req.body.description,
    }
  )
    .then((result) => res.json({ message: "success" }))
    .catch((err) => console.log(err));
});
app.delete("/delete/:id", (req, res) => {
  PostModel.findByIdAndDelete({ _id: req.params.id })
    .then((result) => res.json({ message: "success" }))
    .catch((err) => console.log(err));
});
app.listen(5000, () => {
  console.log("server started");
});
