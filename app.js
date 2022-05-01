//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { redirect } = require("express/lib/response");
const date = require(__dirname + "/date.js");

const app = express();
mongoose.connect("mongodb://localhost:27017/todoListdb");

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const itemsSchema = new mongoose.Schema({
  name: String
});

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

const Item = mongoose.model("Item",itemsSchema);

const List = mongoose.model("list",listSchema);

const item1 = new Item({
  name: "Welcome to my todoList Version 2"
});

const item2 = new Item({
  name: "Hit + button to add a new item"
});

const item3 = new Item({
  name: "<-- Hit this to delete an item"
});

const defaultItem = [item1,item2,item3];



app.get("/", function(req, res) {
    
    Item.find({},(e,foundItem)=>{
        if (!e){
          if (foundItem.length === 0){
            Item.insertMany(defaultItem ,(e)=>{
              if (e){
                console.log(e);
              } else {
                console.log("successfully inserted data into db");
             }
            });
            res.redirect("/");
          } else {
            res.render("list", {listTitle: "today", newListItems: foundItem});
          }
        }
    });
});

app.post("/", function(req, res){
  // console.log(req.body);
  const item = req.body.newItem;
  const list = req.body.list;

  const newItem = new Item({
    name: item
  });

  if(list === "today"){
    newItem.save();
    res.redirect("/");
  } else{
    List.findOne({name:list},(e,foundlist)=>{
      if(!e){
        if(foundlist){
        foundlist.items.push(newItem);
        foundlist.save();
        res.redirect("/"+list)
        }
      }
    })
  }

});


app.post("/delete",(req,res)=>{

  const deleteItem = req.body.checked;
  const listName = req.body.listName;

  // console.log(listName);
  if(listName === "today"){
    Item.deleteOne({_id:deleteItem},(e)=>{
      if(!e){
        console.log("deleted");
        res.redirect("/");
      }
    });
  } else{

    List.findOneAndUpdate(
      {name:listName},
      {$pull:{items: { _id : deleteItem} } },
      (e,foundList)=>{
        if(!e){
          res.redirect("/" + listName);
        }
      });

    // List.findOne({name:req.body.listName},(e,foundList)=>{
    //   if(!e){
        
    //     // console.log(foundList.items);
        
    // //     List.deleteOne({_id:deleteItem},(e)=>{
    // //       console.log("deleted from "+req.body.listName);
    // //       res.redirect("/"+req.body.listName);
    // //     })
    //   }
    // });
  }
});


app.get("/:list",(req,res)=>{
  const listName = req.params.list;
  List.findOne({name: listName},(e,foundList)=>{
    if(!e){
      if(!foundList){
        const list = new List({
          name: listName,
          items: defaultItem
        });
        list.save();
        res.redirect("/"+listName);
        // console.log("notfound");
      } else{
        res.render("list",{listTitle: foundList.name, newListItems: foundList.items});
        // console.log("found");
      }
    } 
  })
})

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
