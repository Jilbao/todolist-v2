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
const eat = new ItemModel({
  name: "Eat!"
});
const study = new ItemModel({
  name: "Study!"
});
const sleep = new ItemModel({
  name: "Sleep!"
});

const defaultItems = [eat,study,sleep]

function createDefault() { 
  ItemModel.insertMany(defaultItems, (err)=>{
    if (err) {
      console.log(err);
    } else {
      console.log("Default items created!");
    }
  });
}

//Custom List Schema
const listSchema = {
  name: {
    type: String,
    required: true
  },
  items: [itemSchema]
};
const ListModel = mongoose.model("list", listSchema);



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

//Custom
app.get("/:customListName", (req, res) => {
  const customListName = req.params.customListName;

  ListModel.findOne({name: customListName},(err, foundList) => {
    if (err) {
      console.log(err);
    } else {
        if (!foundList){
          //Create a new list 
            const list = new ListModel({
            name: customListName,
            items: defaultItems
          });
          list.save();
          res.redirect(`/${customListName}`);
        } else {
          //Show existing list
          res.render("list", {listTitle: foundList.name, items: foundList.items});
        };
    };
    
    
  
  });
  
  
});

app.post("/", (req, res)=>{

    const newItem = req.body.newItem;

    ItemModel.insertMany({name: `${newItem}`},err => {
      if (err) {
        console.log(err);
        res.status(404).redirect("/error");
      } else {
        console.log("Item successfully added!");
        res.redirect("/");
      }
    })   
    
});

app.post("/delete", (req, res) => {
  
  const deleteItem = req.body.checkbox;
  
  ItemModel.findByIdAndDelete(deleteItem,err =>{
    if (err) {
      console.log(err);
    } else {
      setTimeout(() => {
        console.log("Item successfully deleted.");
        res.redirect("/");
      }, 1);      
    }
  })
});



app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/error", (req, res)=>{
  res.render("error");
});

//Listen
app.listen(port, () => {
  console.log(`Server is running on Port: ${port}`);
});