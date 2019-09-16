//jshint esvrsion:6
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const expressSanitizer = require("express-sanitizer");
const mongoose = require("mongoose");
const express = require("express");
const ejs = require("ejs");
const app = express();

// APP CONFIG
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(expressSanitizer());
mongoose.connect("mongodb://localhost:27017/blogDB", {useFindAndModify: false, useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true });

// MONGOOSE/MODEL CONFIG
const blogSchema = {
  title: String,
  image: String,
  body: String,
  created: {type: Date, default: Date.now}
};
const Blog = mongoose.model("Blog", blogSchema);

// RESTFUL ROUTES

app.get("/", (req, res) => {
  res.redirect("/blogs");
});

// INDEX ROUTE
app.get("/blogs", (req, res) => {
  Blog.find((err, foundBlogs) => {
    if (err) {
      console.log(err);
    } else {
      res.render("index", {blogs: foundBlogs});
    }
  });
});

// NEW ROUTE
app.get("/blogs/new", (req, res) => res.render("new"));

// CEATE ROUTE
app.post("/blogs", (req, res) => {
  req.body.blog.body = req.sanitize(req.body.blog.body);
  const newBlog = new Blog(req.body.blog);
  newBlog.save(err => {
    if (err) {
      res.render("new");
    } else {
      res.redirect("/blogs");
    }
  });
});

// SHOW ROUTE
app.get("/blogs/:id", (req, res) => {
  Blog.findById(req.params.id, (err, foundBlog) => {
    if (err) {
      res.redirect("/blogs");
    } else {
      res.render("show", {blog: foundBlog});
    }
  });
});

// EDIT ROUTE
app.get("/blogs/:id/edit", (req, res) => {
  Blog.findById(req.params.id, (err, foundBlog) => {
    if (err) {
      res.redirect("/blogs");
    } else {
      res.render("edit", {blog: foundBlog});
    }
  });
});

// UPDATE ROUTE
app.put("/blogs/:id", (req, res) => {
  req.body.blog.body = req.sanitize(req.body.blog.body);
  Blog.findByIdAndUpdate(req.params.id, req.body.blog, (err, updatedBlog) => {
    if (err) {
      res.redirect("/blogs");
    } else {
      res.redirect("/blogs/" + req.params.id)
    }
  });
});

// DELETE ROUTE
app.delete("/blogs/:id", (req, res) => {
  Blog.findByIdAndRemove(req.params.id, err => {
    if (err) {
      res.redirect("/blogs");
    } else {
      res.redirect("/blogs");
    }
  });
});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
