import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useEffect } from "react";
import { useState } from "react";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import useAuth from "../../../hooks/useAuth";
import "../Payment/CheckOutForm.css";

const CheckoutForm = ({ cart, price }) => {
  const stripe = useStripe();
  const element = useElements();
  const { user } = useAuth();
  const [axiosSecure] = useAxiosSecure();
  const [cardError, setCardError] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [proccessing, setProccessing] = useState(false);
  const [transactionId, setTransactionId] = useState("");

  useEffect(() => {
    if (price > 0) {
      axiosSecure.post("/create-payment-intent", { price }).then((res) => {
        console.log(res.data.clientSecret);
        setClientSecret(res.data.clientSecret);
      });
    }
  }, [axiosSecure, price]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !element) {
      return;
    }
    const card = element.getElement(CardElement);
    if (card === null) {
      return;
    }
    // console.log(card);
    const { error } = await stripe.createPaymentMethod({
      type: "card",
      card,
    });
    if (error) {
      // console.log("error", error);
      setCardError(error.message);
    } else {
      // console.log("payment", paymentMethod);
      setCardError("");
    }

    setProccessing(true);

    const { paymentIntent, error: confirmError } =
      await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: card,
          billing_details: {
            email: user?.email || "anonymous",
            name: user?.displayName || "anonymous",
          },
        },
      });
    if (confirmError) {
      console.log(confirm);
    }
    console.log(paymentIntent);
    setProccessing(false);
    if (paymentIntent.status === "succeeded") {
      setTransactionId(paymentIntent.id);
      //todo next step
      const payment = {
        email: user?.email,
        transactionId: paymentIntent.id,
        price,
        date: new Date(),
        status: "service pending",
        quantity: cart.length,
        cartItems: cart.map((item) => item._id),
        menuItems: cart.map((item) => item.menuItemId),
        itemName: cart.map((item) => item.name),
      };
      axiosSecure.post("/payments", payment).then((res) => {
        console.log(res.data);

        if (res.data?.insertedId) {
          //display confirmed
        }
      });
    }
  };
  return (
    <form onSubmit={handleSubmit}>
      <CardElement
        options={{
          style: {
            base: {
              fontSize: "16px",
              color: "#424770",
              "::placeholder": {
                color: "#aab7c4",
              },
            },
            invalid: {
              color: "#9e2146",
            },
          },
        }}
      />
      <button
        className="btn btn-sm btn-primary"
        type="submit"
        disabled={!stripe || !clientSecret || proccessing}
      >
        Pay
      </button>
      {cardError && <p>{cardError}</p>}
      {transactionId && (
        <p>Transaction completed with transactionId: {transactionId}</p>
      )}
    </form>
  );
};

export default CheckoutForm;
