"use strict";

const express = require("express");
const app = express();
const port = 3001;

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded());

global.orders = [];

let states = [];
states.push("ordered");
states.push("cooked");
states.push("served");
states.push("paid");

app.post("/PlaceOrder", (req, res) => {
  let order = {};
  order.state = "ordered";
  order.tableNumber = req.body["tableNumber"];
  delete req.body.tableNumber;
  order.items = req.body;
  order.number = global.orders.length + 1; //Note, the order number is 1 more than the orders index in the array (becuase we don't want an order #0)
  global.orders.push(order);
  res.send("Order Accepted #" + order.number);
});

app.get("/view", (req, res) => {
  outputOrders(req, res);
});

app.get("/setState", (req, res) => {
  setOrderState(req, res);
  outputOrders(req, res);
});

// app.get('/', (req, res) => {
//     res.send('Hello World!')
//   })

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

const path = require("path");
app.use(express.static(path.join(__dirname, "public")));

function outputOrders(req, res) {
  let filter = req.query["filter"];

  let ordersHTML = [];
  ordersHTML.push(
    "<html><head><link type='text/css' rel='stylesheet' href='/css/style.css'></head><body>"
  );
  ordersHTML.push('<table id="ordersTable">');

  for (const order of global.orders) {
    if (filter == null || order.state == filter) {
      ordersHTML.push(orderHTML(order));
    }
  }
  ordersHTML.push("</table>");
  ordersHTML.push("</body></html>");
  res.send(ordersHTML.join(""));

  function newFunction() {
    return '<table id="ordersTable">';
  }
}

function orderHTML(order) {
  let elements = [];
  elements.push("<tr>");
  elements.push(`<td>Order# ${order.number}</td>`);
  elements.push(`<td>Table# ${order.tableNumber}</td>`);
  elements.push("<td>");
  for (const key in order.items) {
    const quantity = order.items[key];
    if (quantity > 0) {
      elements.push(quantity + " * " + key + "<br>");
    }
  }
  elements.push("</td>");
  if (order.state === "ordered") {
    elements.push(
      "<td style='background-color:red'; >" + order.state + "</td>"
    );
  } else if (order.state === "cooked") {
    elements.push(
      "<td style='background-color:orange'; >" + order.state + "</td>"
    );
  } else if (order.state === "served") {
    elements.push(
      "<td style='background-color:yellow'; >" + order.state + "</td>"
    );
  } else if (order.state === "paid") {
    elements.push(
      "<td style='background-color:green'; >" + order.state + "</td>"
    );
  }
  elements.push("<td>" + stateButtons(order) + "</td>");
  elements.push("</tr>");
  // console.log(order);
  return elements.join("");
}

function stateButtons(order) {
  let buttons = [];
  for (const state of states) {
    buttons.push(
      "<a href=/setState?orderNumber=" +
        order.number +
        "&state=" +
        state +
        "><button>Mark as " +
        state +
        " </button></a>"
    );
  }
  return buttons.join(" ");
}

function setOrderState(req, res) {
  //transition state - based on a ?state=ordernum NameValue pair
  let order = global.orders[parseInt(req.query["orderNumber"]) - 1];
  order.state = req.query["state"];
}
