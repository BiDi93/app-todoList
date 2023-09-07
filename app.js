//jshint esversion:6

import express from "express";
import bodyParser from "body-parser";
import mongoose, { mongo } from "mongoose";
// import { getDate,getDay } from "./date.js";
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

mongoose.connect("mongodb+srv://Admin:Admin1234@clustermin.4unltev.mongodb.net/todoListDB?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true });

const itemSchema = new mongoose.Schema({
  name:String
});

const Item = mongoose.model('Item',itemSchema);



const handphone = new Item({
  name:"huawei"
})
const handphone2 = new Item({
  name:"samsung"
})
const handphone3 = new Item({
  name:"iphone"
})

const defaultItems = [handphone,handphone2,handphone3];


const listSchema = new mongoose.Schema({
  name:String,
  items: [itemSchema]
})

const List = mongoose.model("List",listSchema);

// Item.insertMany(defaultItems).then(function () {
//   console.log("Successfully saved defult items to DB");
// }).catch(function (err) {
//   console.log(err);
// });

app.get("/", async function(req, res) {

  const items = await Item.find({});
  if (items.length > 0) {
    // console.log("Item array is occupied")
  }else {
    Item.insertMany(defaultItems).then(function () {
    console.log("Successfully saved defult items to DB");
  }).catch(function (err) {
    console.log(err);
});
  }
  res.render("list", {listTitle: "Today", newListItems: items});

});

app.get("/:customList", function(req,res){
  const customListNames = req.params.customList;
  


List.findOne({name:customListNames}).then((foundData) =>{
  if (foundData === null){
    const list = new List({
      name:customListNames,
      items: defaultItems
  })
  console.log("data not found , creating a new to do list");
  list.save();
  res.redirect("/" + customListNames);
  }else{
    res.render("list", {listTitle: foundData.name, newListItems: foundData.items});
  }
}).catch((err) =>{
  console.log(err)
})

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listTitle = req.body.list;
  
  const item = new Item({
    name:itemName
  });

  if (listTitle === "Today"){
  
    item.save();
    res.redirect("/");
  }else {
    // const result = List.findOne({name:listTitle});
    // console.log(result);
    List.findOne({name:listTitle}).then(function(foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listTitle);
    })
  }



});

app.post("/delete", function(req,res){
  const checkedItemID = req.body.checkbox;
  const checkedListName = req.body.listName;

  if(checkedListName === "Today"){
     Item.findByIdAndRemove(checkedItemID).then(function () {
      console.log("Success remove item" + checkedItemID)
      res.redirect("/");
    }).catch(function (err){
      console.log(err);
      res.send(err);
    })
  }else {
     List.findOneAndUpdate({name: checkedListName},{$pull: {items:{_id:checkedItemID}}}).then(function () {
      console.log("Success remove: " + checkedListName);
      res.redirect("/" +  checkedListName);
    }).catch((err)=> {
      res.send(err);
      }
    )
  }
}
    );

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
