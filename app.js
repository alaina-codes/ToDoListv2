//jshint esversion:6

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static('public'));

mongoose.connect('mongodb://localhost:27017/todolistDB', {
    useNewUrlParser: true
});

// Default List Database Setup
const itemsSchema = {
    name: String
};
const Item = mongoose.model('item', itemsSchema);

const item1 = new Item({
    name: "Welcome to your to do list!"
});
const item2 = new Item({
    name: "Hit the + button to add a new to do list item."
});
const item3 = new Item({
    name: "Hit the checkbox to delete an item!"
});

const defaultItems = [item1, item2, item3];

// Custom List Database Setup
const listSchema = {
    name: String,
    items: [itemsSchema]
}

const List = mongoose.model('List', listSchema);

app.get('/', function (req, res) {
    Item.find({}, function (err, foundItems) {
        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, function (err) {
                if (err) {
                    console.log(err);
                };
            });
            res.redirect('/');
        } else {
            res.render('list', {
                listTitle: "Today",
                newListItems: foundItems
            });
        }
    });
});

app.get('/:customListName', function (req, res) {
    const customListName = req.params.customListName;
    List.findOne({
        name: customListName
    }, function (err, foundList) {
        if (!err) {
            if (!foundList) {
                // Create a new list
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save();
                res.redirect('/' + customListName);
            } else {
                // Shows Existing list
                res.render('list', {
                    listTitle: foundList.name,
                    newListItems: foundList.items
                })
            }
        }
    })
});

app.post('/', function (req, res) {
    const itemName = req.body.newItem;
    const listName = req.body.list;
    const item = new Item({
        name: itemName
    });

    if (listName === 'Today') {
        item.save();
        res.redirect('/');
    } else {
        List.findOne({name: listName}, function (err, foundList) {
            foundList.items.push(item);
            foundList.save();
            res.redirect('/' + listName);
        })
    }
});

app.post('/delete', function (req, res) {
    const checkedItemID = req.body.checkbox;
    Item.findByIdAndRemove(checkedItemID, function (err) {
        if (!err) {
            res.redirect('/');
        } else {
            console.log(err);
        }
    });
})

app.get('/work', function (req, res) {
    res.render('list', {
        listTitle: 'Work List',
        newListItems: workItems
    });
});

app.get('/about', function (req, res) {
    res.render('about');
});

app.listen(3000, function () {
    console.log('Server started on port 3000');
});