import SectionTitle from "../../../components/SectionTitle/SectionTitle";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "./CheckoutForm";
import useCart from "../../../hooks/useCart";

const Payment = () => {
  const stripePromise = loadStripe(import.meta.env.VITE_PAYMENT_GATEWAY_PK);
  const [cart] = useCart();
  const total = cart.reduce((sum, item) => sum + item.price, 0);
  const price = parseFloat(total.toFixed(2));
  return (
    <div className="m-8">
      <SectionTitle
        subHeading="Please procced to"
        heading="Payment"
      ></SectionTitle>
      <h1>teka o teka re tui uira uira ay</h1>
      <Elements stripe={stripePromise}>
        <CheckoutForm cart={cart} price={price}></CheckoutForm>
      </Elements>
    </div>
  );
};

export default Payment;
