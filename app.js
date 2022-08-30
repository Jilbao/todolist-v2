//Requires
const express = require("express");
const date = require(__dirname + "/date.js")
const mongoose = require("mongoose")

//Setting app and port
const app = express();
const port = 3000;

//EJS
app.set("view engine", "ejs");

//Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Static
app.use(express.static("public"));

//Mongo connection
mongoose.connect("mongodb://localhost:27017/todolistDB");

//Item Schema
const itemSchema = {
  name: {
    type: String,
    required: true
  }
};

//Item Model
const ItemModel = mongoose.model("item", itemSchema);

//Adding Default Items in DB
function createDefault() {
  const eat = new ItemModel({
    name: "Eat!"
  });
  const study = new ItemModel({
    name: "Study!"
  });
  const sleep = new ItemModel({
    name: "Sleep!"
  });
  ItemModel.insertMany([eat, study, sleep], (err)=>{
    if (err) {
      console.log(err);
    } else {
      console.log("Default items created!");
    }
  });
}

//Listen
app.listen(port, () => {
  console.log(`Server is running on Port: ${port}`);
});

//Index
app.get("/", (req, res) => {

  //Items to render
  ItemModel.find((err, items)=>{
    if (err) {
      console.log(err);
    } else {
      //Check if items exist, if not create default
      if (items.length === 0) {
        createDefault();
        res.redirect("/");
      }else {
        let day = date.getDate();
        res.render("list", { listTitle: day, items: items });
      }
    }
   });

});

app.post("/", (req, res)=>{

    const newItem = req.body.newItem;

    ItemModel.insertMany({name: `${newItem}`},err => {
      if (err) {
        console.log(err);
      } else {
        console.log("Item successfully added!");
        res.redirect("/");
      }
    })   
    
});

app.post("/delete", (req, res) => {
  console.log(req.body);
});

app.get("/work", (req, res)=>{
  res.render("list", {listTitle: "Work List", items: workItems})
});

app.get("/about", (req, res) => {
  res.render("about");
});

