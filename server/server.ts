require("dotenv").config();

import express from "express";
const app = express();

import cors from "cors";
app.use(cors({ origin: "http://localhost:8080" }));

app.use(express.json());
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// type
interface ISubscriptionDetails {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

// price details
const subscriptionDetails: ISubscriptionDetails[] = [
  { id: 1, name: "weekly subscription", price: 10, quantity: 1 },
  { id: 2, name: "monthly subscription", price: 40, quantity: 1 },
  { id: 3, name: "annual subscription", price: 400, quantity: 1 },
];

// stipe.checkout.sessions.create()
function createStripeSession(req: any) {
  return {
    payment_method_types: ["card"],
    mode: "payment",
    line_items: req.body.items.map((item: ISubscriptionDetails) => {
      const { id, price, name, quantity } = item;

      return {
        quantity: quantity,
        price_data: {
          currency: "usd",
          product_data: {
            name,
          },
          unit_amount: price,
        },
      };
    }),
    success_url: `${process.env.CLIENT_URL}/success.html`,
    cancel_url: `${process.env.CLIENT_URL}/failure.html`,
  };
}

// post
app.post("/create-checkout-session", async (req: any, res: any) => {
  try {
    const session = await stripe.checkout.sessions.create(
      createStripeSession(req)
    );
    res.json({ url: session.url });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// listen in port
const PORT = 3000;
app.listen(3000, () =>
  console.log(`Server is listening on port http://localhost:${PORT}`)
);
