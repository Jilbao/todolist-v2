//Requires
const express = require("express");

//Setting app and port
const app = express();
const port = 3000;

//EJS
app.set("view engine", "ejs");

//Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

var items = [];

//Listen
app.listen(port, () => {
  console.log(`Server is running on Port: ${port}`);
});

//Index
app.get("/", (req, res) => {
  var today = new Date();
  
  var options = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  };
  
  var day = today.toLocaleDateString("en-US", options);

  res.render("list", { day: day, items: items });
});

app.post("/", (req, res)=>{
    newItem = req.body.newItem;
    items.push(newItem);
    res.redirect("/")
});

