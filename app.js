//Requires
const express = require("express");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

//Setting app and port
const app = express();
let port = process.env.PORT;

//EJS
app.set("view engine", "ejs");

//Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Static
app.use(express.static("public"));

//Mongo connection
mongoose.connect(process.env.db_url);

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
  const customListName = _.capitalize(req.params.customListName);

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
    //Get form data
    const newItem = req.body.newItem;
    const listName = req.body.list;
    //Check if list is main or custom
    if (listName === date.getDate()) {
        
        //If main list, add item to main list
        ItemModel.insertMany({name: `${newItem}`},err => {
        if (err) {
          console.log(err);
          res.status(404).redirect("/error");
        } else {
          res.redirect("/");
        };
      }); 
    }else {

      //if custom list, find custom list and add item to that list
      ListModel.findOne({name: listName}, (err, foundList)=>{
        if (err) {
          console.log(err);
          res.status(404).redirect("/error");
        } else {
          foundList.items.push({name: `${newItem}`});
          foundList.save();
          res.redirect("/" + listName);
        };
        
      });

    };    
    
});

app.post("/delete", (req, res) => {
  
  //Get item id and list name from checkbox
  const deleteItem = req.body.checkbox;
  const deleteItemId = deleteItem.slice(0,24);
  const deleteListName = deleteItem.slice(25);

  //Check main list or custom list
  if (deleteListName === date.getDate()) {
    //delete item from main list
    ItemModel.findByIdAndDelete(deleteItemId,err =>{
      if (err) {
        console.log(err);
      } else {
        setTimeout(() => {
          res.redirect("/");
        }, 1);      
      }
    });    
  } else {
    //delete item from custom list
    ListModel.findOneAndUpdate({name: deleteListName}, {$pull: {items: {_id: deleteItemId}}}, (err, results) => {
      if (err) {
        console.log(err);
      } else {
        res.redirect("/"+ deleteListName);
      }
    });
  }
});



app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/error", (req, res)=>{
  res.render("error");
});

//Listen
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, () => {
  console.log(`Server is running on Port: ${port}`);
});