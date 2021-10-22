require("dotenv").config();

import express, { Request, Response } from "express";
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
  { id: 1, name: "weekly subscription", price: 9900, quantity: 1 },
  { id: 2, name: "monthly subscription", price: 39900, quantity: 1 },
  { id: 3, name: "annual subscription", price: 399900, quantity: 1 },
];

function createStripeSession(req: Request) {
  return {
    payment_method_types: ["card"],
    mode: "payment",
    line_items: req.body.items.map((item: ISubscriptionDetails) => {
      const { id } = item;
      const { name, price } = subscriptionDetails.find(
        (subscription) => subscription.id === id
      )!;

      return {
        quantity: 1,
        price_data: {
          currency: "inr",
          product_data: { name },
          unit_amount: price,
        },
      };
    }),
    success_url: `${process.env.CLIENT_URL}`,
    cancel_url: `${process.env.CLIENT_URL}`,
  };
}

// post
app.post("/create-checkout-session", async (req: Request, res: Response) => {
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
const PORT = process.env.PORT || 3000;

app.listen(3000, () => console.log(`Server is listening on port ${PORT}`));
