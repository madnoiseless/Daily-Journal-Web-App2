const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");

const homeStartingContent =
  "Nulla pellentesque dignissim enim sit amet. At auctor urna nunc id cursus metus. At quis risus sed vulputate odio ut. Etiam tempor orci eu lobortis. Netus et malesuada fames ac turpis egestas. Suscipit tellus mauris a diam maecenas sed. Duis convallis convallis tellus id interdum velit laoreet. In ante metus dictum at tempor. Feugiat nibh sed pulvinar proin gravida hendrerit lectus a. Nec sagittis aliquam malesuada bibendum arcu vitae elementum. Proin libero nunc consequat interdum varius sit amet. Nunc lobortis mattis aliquam faucibus purus in massa tempor nec. Quam lacus suspendisse faucibus interdum posuere lorem. Porttitor lacus luctus accumsan tortor posuere. Vitae purus faucibus ornare suspendisse sed. Lacinia at quis risus sed vulputate odio. Non curabitur gravida arcu ac tortor dignissim convallis aenean.";
const aboutContent =
  "Ligula ullamcorper malesuada proin libero nunc consequat interdum. Elit duis tristique sollicitudin nibh sit. Sem integer vitae justo eget magna. Purus gravida quis blandit turpis. Sagittis id consectetur purus ut faucibus pulvinar elementum integer enim. Eget mi proin sed libero enim sed faucibus turpis. Ut morbi tincidunt augue interdum. Massa vitae tortor condimentum lacinia quis vel eros donec. Pellentesque elit ullamcorper dignissim cras tincidunt lobortis. Mauris a diam maecenas sed enim ut sem. Purus sit amet volutpat consequat mauris nunc congue nisi vitae. Malesuada fames ac turpis egestas integer eget aliquet nibh. Lorem ipsum dolor sit amet consectetur. Ut porttitor leo a diam sollicitudin tempor id eu. Risus in hendrerit gravida rutrum quisque. Risus quis varius quam quisque id. Non nisi est sit amet facilisis magna etiam. Vitae purus faucibus ornare suspendisse sed nisi.";
const contactContent =
  "Auctor neque vitae tempus quam pellentesque nec nam. Id donec ultrices tincidunt arcu. Nunc sed blandit libero volutpat sed cras. Malesuada bibendum arcu vitae elementum curabitur vitae nunc sed velit. Ut tortor pretium viverra suspendisse. Tempor commodo ullamcorper a lacus vestibulum sed arcu non odio. A pellentesque sit amet porttitor eget dolor morbi non arcu. Proin nibh nisl condimentum id venenatis a condimentum vitae. Aliquam etiam erat velit scelerisque in dictum non consectetur a. Et molestie ac feugiat sed lectus vestibulum mattis ullamcorper. Aliquam purus sit amet luctus venenatis lectus magna fringilla. Duis convallis convallis tellus id. Magna fringilla urna porttitor rhoncus dolor purus. Tristique senectus et netus et malesuada fames. Aenean pharetra magna ac placerat vestibulum. Nibh tortor id aliquet lectus proin.";

const app = express();
const port = 3000;
mongoose.connect("mongodb://localhost:27017/BlogDB");

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const postSchema = {
  title: String,
  content: String,
};

const Post = mongoose.model("Post", postSchema);

app.get("/", async (req, res) => {
  const posts = await Post.find({});
  res.render("home", {
    startingContent: homeStartingContent,
    posts: posts,
  });
});

app.get("/about", (req, res) => {
  res.render("about", { aboutContent: aboutContent });
});

app.get("/contact", (req, res) => {
  res.render("contact", { contactContent: contactContent });
});

// Compose new posts
app.get("/compose", function (req, res) {
  // Check limit first. We don't want too much content in this demo project
  checkPostLimit(res, (/*count*/) => {
    res.render("compose", {
      pageTitle: "Compose",
      formAction: "/compose",
      titleInputValue: "",
      contentInputValue: "",
      buttonValue: "",
    });
  });
});

// Check limit. We don't want too much content in this demo project
async function checkPostLimit(res, callback) {
  const limit = 10;

  try {
    const count = await Post.countDocuments({});

    if (count < limit) {
      // If we can have more posts
      callback(count);
    } else {
      // If we reached the limit
      res.render("limit");
    }
  } catch (err) {
    res.render("error", { err: err });
    console.error(err);
  }
}

// Save new post to database
app.post("/compose", async function (req, res) {
  try {
    await checkPostLimit(res, (/*count*/) => {
      // Create new post
      let post = new Post({
        title: req.body.postTitle.substring(0, 50),
        content: req.body.postContent.substring(0, 500),
      });
      post.save();
    });
    res.redirect("/maintenance");
  } catch (err) {
    console.error(err);
    res.render("error", { err: err });
  }
});

app.get("/posts/:postId", async (req, res) => {
  const requestedPostId = req.params.postId;

  try {
    const post = await Post.findOne({ _id: requestedPostId });

    if (!post) {
      return res.status(404).send("Post not found");
    }

    res.render("post", {
      title: post.title,
      content: post.content,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong");
  }
});

app.get("/maintenance", async function (req, res) {
  let postPreviews = [];

  try {
    // Find all posts
    const posts = await Post.find({});

    if (posts) {
      // Truncate long posts
      posts.forEach((post) => {
        const truncateOptions = {
          length: 100,
          omission: " ...",
        };
        postPreviews.push({
          _id: post._id,
          title: post.title,
          content: _.truncate(post.content, truncateOptions),
        });
      });

      res.render("maintenance", {
        homeStartingContent: homeStartingContent,
        posts: postPreviews,
      });
    } else {
      res.render("error", { err: "No posts found." });
      console.error("No posts found.");
    }
  } catch (err) {
    console.error(err);
    res.render("error", { err: err });
  }
});

// Edit existing post - Open the editor
app.post("/edit", async function (req, res) {
  // The _id of the post is the button's value
  let requestedPost = req.body.button;

  try {
    // Find one post
    const post = await Post.findOne({ _id: requestedPost });

    if (post) {
      // If we found the post
      res.render("compose", {
        pageTitle: "Edit",
        formAction: "/editSave",
        titleInputValue: post.title,
        contentInputValue: post.content,
        buttonValue: post._id,
      });
    } else {
      // If we didn't find the post
      res.render("404");
    }
  } catch (err) {
    console.error(err);
    res.render("error", { err: err });
  }
});

// Edit existing post - Save the post
app.post("/editSave", async function (req, res) {
  // The _id of the post is the button's value
  let requestedPost = req.body.button;

  try {
    // Find one post
    const post = await Post.findOne({ _id: requestedPost });

    if (post) {
      // If we found the post
      post.title = req.body.postTitle.substring(0, 50);
      post.content = req.body.postContent.substring(0, 500);
      await post.save();
      res.redirect("/maintenance");
    } else {
      // If we didn't find the post
      res.render("404");
    }
  } catch (err) {
    console.error(err);
    res.render("error", { err: err });
  }
});

app.post("/delete", function (req, res) {
  // The _id of the post is the button's value
  let requestedPost = req.body.button;

  Post.deleteOne({ _id: requestedPost })
    .then((result) => {
      if (result.n === 0) {
        res.render("error", { err: new Error("Post not found") });
        console.error("Post not found");
      } else {
        res.redirect("/maintenance");
      }
    })
    .catch((err) => {
      res.render("error", { err: err });
      console.error(err);
    });
});

app.listen(port, () => {
  console.log(`Server started on port ${port}.`);
});
