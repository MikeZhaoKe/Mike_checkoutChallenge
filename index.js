const express = require("express");
const path = require("path");
const hbs = require("express-handlebars");
const dotenv = require("dotenv");
const logger = require("morgan");
const { uuid } = require("uuidv4");
const { Client, Config, CheckoutAPI } = require("@adyen/api-library");
// init app
const app = express();

// Set up request logging
app.use(logger("dev"));
// Parse JSON bodies
app.use(express.json());
// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));
// Serve client from build folder
app.use(express.static(path.join(__dirname, "/public")));

// Enables environment variables by parsing the .env file and assigning it to process.env
dotenv.config({
  path: "./.env",
});

app.engine(
  "handlebars",
  hbs({
    defaultLayout: "main",
    layoutsDir: __dirname + "/views/layouts",
  })
);

app.set("view engine", "handlebars");

//Based on example of payment methods for a payment of 10 EUR:
const config = new Config();
// Set Authentication  with environment variables:
config.apiKey = process.env.API_KEY;
const client = new Client({ config });
client.setEnvironment("TEST");
const checkout = new CheckoutAPI(client);

// Get payment methods
app.get("/", async (req, res) => {
  try {
    const response = await checkout.paymentMethods({
      channel: "Web",
      merchantAccount: process.env.MERCHANT_ACCOUNT,
    });
    //res.json(response);
    res.render("payment", {
      clientKey: process.env.CLIENT_KEY,
      response: JSON.stringify(response),
    });
  } catch (err) {
    console.error(`Error: ${err.message}, error code: ${err.errorCode}`);
    res.status(err.statusCode).json(err.message);
  }
});

// Submitting a payment
app.post("/examplePayment", async (req, res) => {
  try {
    const shopperOrder = uuid();
    // Ideally the data passed here should be computed based on business logic
    const response = await checkout.payments({
      amount: { currency: "EUR", value: 1000 }, // value is 10€ in minor units
      reference: shopperOrder,
      merchantAccount: process.env.MERCHANT_ACCOUNT,
      channel: "Web",
      additionalData: {
        // required for 3ds2 native flow
        allow3DS2: true,
      },
      origin: "http://localhost:3000", 
      returnUrl: `http://localhost:3000/checkout?shopperOrder=${shopperOrder}`,
      browserInfo: req.body.browserInfo,
      paymentMethod: req.body.paymentMethod,
    });

    res.json(response);
  } catch (err) {
    console.error(`Error: ${err.message}, error code: ${err.errorCode}`);
    res.status(err.statusCode).json(err.message);
  }
});

app.all("/checkout", async (req, res) => {
  // Create the payload for submitting payment details
  const redirect = req.method === "GET" ? req.query : req.body;
  const details = {};
  if (redirect.redirectResult) {
    details.redirectResult = redirect.redirectResult;
  } else if (redirect.payload) {
    details.payload = redirect.payload;
  }

  try {
    const response = await checkout.paymentsDetails({ details });
    // Conditionally handle different result codes for the shopper
    switch (response.resultCode) {
      case "Authorised":
        res.redirect("/success");
        break;
      case "Pending":
      case "Received":
        res.redirect("pending");
        break;
      case "Refused":
        res.redirect("failed");
        break;
      default:
        res.redirect("/error");
        break;
    }
  } catch (err) {
    console.error(`Error: ${err.message}, error code: ${err.errorCode}`);
    res.redirect("/error");
  }
});


// Authorised result page
app.get("/success", (req, res) => res.render("success"));
// Pending result page
app.get("/pending", (req, res) => res.render("pending"));
// Error result page
app.get("/error", (req, res) => res.render("error"));
// Refused result page
app.get("/failed", (req, res) => res.render("failed"));


// Start server
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
