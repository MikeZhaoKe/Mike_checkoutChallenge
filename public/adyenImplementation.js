const clientKey = document.getElementById("clientKey").innerHTML;
const paymentMethodsResponse = JSON.parse(
  document.getElementById("paymentMethodsResponse").innerHTML
);

const configuration = {
  paymentMethodsResponse,// The `/paymentMethods` response from the server.
  clientKey,
  locale: "en_US",
  environment: "test",
  paymentMethodsConfiguration: {
    card: {
      hasHolderName: true,
    },
  },
  onSubmit: (state, dropin) => {
    handleSubmission(state, dropin, "/examplePayment");
  },
};
  
//Use the configuration object to create and mount the instance of Drop-in
const checkout = new AdyenCheckout(configuration);
const dropin = checkout
  .create("dropin")
  .mount(document.getElementById("dropin"));
  
// Event handlers called when the shopper selects the pay button,
// or when additional information is required to complete the payment
async function handleSubmission(state, dropin, url) {
  try {
    const response = await callServer(url, state.data);
    return handleServerResponse(response, dropin);
  } catch (error) {
    console.error(error);
  }
}
  
async function callServer(url, data) {
  try {
    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.json();
  } catch (error) {
    console.error(error);
  }
}
  
// Handles responses sent from your server to the client
function handleServerResponse(res, component) {
  if (res.action) {
    component.handleAction(res.action);
  } else {
    switch (res.resultCode) {
      case "Authorised":
        window.location.href = "/success";
        break;
      case "Pending":
        window.location.href = "/pending";
        break;
      case "Refused":
        window.location.href = "/failed";
        break;
      default:
        window.location.href = "/error";
        break;
    }
  }
}
