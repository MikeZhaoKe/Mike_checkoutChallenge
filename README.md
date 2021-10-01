# Adyen [Web Drop-in integration](https://docs.adyen.com/online-payments/drop-in-web) challenge

This repository is to prepare for Adyen checkout challenge. The implementation is based on [Express.js](https://expressjs.com). Using Javascript to integrate online payment with Adyen.  

## Requirements

[Node.js](https://nodejs.org)

## Installation

1. Clone this repo:

```
git clone https://github.com/MikeZhaoKe/Mike_checkoutChallenge.git
```

2. Navigate to the root directory and install dependencies:

```
npm install
```

## Usage

1. Complete the `.env` file with your API key, Client Key and Merchant Account - Remember to add 3000 as an origin localhost port:

```
API_KEY="your_API_key_here"
MERCHANT_ACCOUNT="your_merchant_account_here"
CLIENT_KEY="your_client_key_here"
PORT=3000
```

2. Start the server with nodemon:

```
npm run dev
```

3. Visit [http://localhost:3000/](http://localhost:3000/) (**./views/payment.handlebars**) to select a payment method.

To try out integrations with test card numbers and payment method details, see [Test card numbers](https://docs.adyen.com/development-resources/test-cards/test-card-numbers).