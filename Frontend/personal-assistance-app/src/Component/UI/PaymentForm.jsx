import React, { useState, useEffect } from "react";
import VisaCard from "./VisaCard";
import usePaymentFormValidation from "../Hooks/CustomHook/usePaymentFormValidation";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";

import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8070";

const isCardMethod = (type) => type === "visa" || type === "mastercard";

export default function PaymentForm({
  selectedType,
  saveDetails,
  bookingid,
  amount,
}) {
  const [cardCredentials, setCardCredentials] = useState({
    cardHolderName: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    payhereEmail: "",
    bankName: "",
    branch: "",
    transactionPdf: "",
  });
  const [saveCard, setSaveCard] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });
  const navigate = useNavigate();
  //form validaion custom hook
  const { error, formValidation, clearForm } = usePaymentFormValidation();

  //if savedetails provide pre fill form
  useEffect(() => {
    if (saveDetails) {
      setCardCredentials((prevState) => ({
        ...prevState,
        cardHolderName: saveDetails.cardHolderName || "",
        cardNumber: saveDetails.cardNumber || "",
      }));
      setSaveCard(true);
    }
  }, [saveDetails]);

  //card number format
  const cardNumberFormat = (cardNumber) => {
    const cardNumberStr = cardNumber || "";
    //remove space
    const nonSpaceValue = cardNumberStr.replace(/\D/g, "");
    // add space
    return nonSpaceValue.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  //handling function
  const handleInputChange = (event) => {
    const { value, name } = event.target;
    if (name === "cardNumber") {
      // Remove all non-digit characters
      const numbersOnly = value.replace(/\D/g, "");

      // Update your state with numbers only (before formatting)
      setCardCredentials((prev) => ({
        ...prev,
        [name]: numbersOnly,
      }));

      // Optionally, you can validate here and set error state if needed
    } else {
      // Handle other fields normally
      setCardCredentials((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    clearForm(name);
  };

  const paymenntSubmit = async (event) => {
    event.preventDefault();

    // Check validation
    const validationErrors = formValidation({
      cardCredentials: cardCredentials,
      paymentType: selectedType,
    });

    // If there are validation errors, stop submission
    if (Object.keys(validationErrors).length > 0) {
      console.log("Validation errors:", validationErrors); // Optional: Log errors for debugging
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/home/payment/makePayment`,
        {
          Amount: amount,
          Currency: "LKR",
          PaymentMethod: selectedType,
          order_id: bookingid,
          BookingId: bookingid,
          Item: "Monthly Service Payment",
        },
      );

      if (saveCard && isCardMethod(selectedType)) {
        await axios.post(
          `${API_BASE_URL}/home/payment/savedPayment/Option`,
          {
            paymentMethod: selectedType,
            cardNumber: cardCredentials.cardNumber,
            cardHolderName: cardCredentials.cardHolderName,
          },
        );

        setAlert({ type: "success", message: "Payment successful!" });

        //redirect to dashboard
        setTimeout(() => {
          navigate("/payment");
        }, 2000);
      }
      const data = response.data;
      const checkoutUrl = data?.session?.url || data?.checkout_url;

      if (checkoutUrl) {
        console.log("url accessed");
        window.location.href = checkoutUrl;
      }
    } catch (error) {
      setAlert({
        type: "error",
        message: "Payment failed. Please try again.",
      });
      console.error("Error iniializing payment:", error);
    }

    // If no validation errors, proceed with form submission
    console.log("Form submitted successfully:", cardCredentials);
    // Add your form submission logic here (e.g., API call)
  };

  return (
    <div className=" w-full px-4 pl-2 justify-items-center whitespace-nowrap">
      {alert.message && (
        <Alert severity={alert.type}>
          {alert.type === "success" && (
            <>
              <AlertTitle>Success</AlertTitle>
              This is a success Alert with an encouraging title.
            </>
          )}
          {alert.type === "error" && (
            <>
              <AlertTitle>Error</AlertTitle>
              This is an error Alert with a scary title.
            </>
          )}
        </Alert>
      )}
      <form onSubmit={paymenntSubmit}>
        <h2 className="text-lg font-semibold mb-4 text-violet-950">
          Payment Details
        </h2>
        {isCardMethod(selectedType) ? (
          <>
            <div className="mb-6">
              <VisaCard
                className="min-h-[200px] w-full whitespace-nowrap"
                type={selectedType}
                cardName={cardCredentials.cardHolderName}
                cardNumber={cardCredentials.cardNumber}
                validDate={cardCredentials.expiryDate}
              />
            </div>

            <div className="space-y-3">
              <div>
                <input
                  type="text"
                  name="cardHolderName"
                  value={cardCredentials.cardHolderName || ""}
                  onChange={handleInputChange}
                  placeholder="Cardholder Name"
                  className="w-full py-2 px-4 border rounded"
                />
                {error.cardHolderName && (
                  <p className="text-red-500 text-sm">{error.cardHolderName}</p>
                )}
              </div>

              <div>
                <input
                  type="text"
                  name="cardNumber"
                  value={cardNumberFormat(cardCredentials.cardNumber || "")}
                  onChange={handleInputChange}
                  placeholder="Card Number"
                  className="w-full py-2 px-4 border rounded "
                  maxLength={19}
                />
                {error.cardNumber && (
                  <p className="text-red-500 text-sm">{error.cardNumber}</p>
                )}
              </div>
              <div className="flex gap-x-3">
                <div className="w-1/2">
                  <input
                    type="text"
                    name="expiryDate"
                    value={cardCredentials.expiryDate || ""}
                    onChange={(e) => {
                      let value = e.target.value;
                      // Auto-insert slash after 2 digits
                      if (
                        value.length === 2 &&
                        !cardCredentials.expiryDate.includes("/")
                      ) {
                        value += "/";
                      }
                      // Limit to MM/YY format (7 chars max for MM/YYYY)
                      if (value.length <= 7) {
                        handleInputChange({
                          target: {
                            name: "expiryDate",
                            value: value,
                          },
                        });
                      }
                    }}
                    placeholder="MM/YY"
                    className="w-[150px] py-2 px-4 border rounded "
                  />
                  {error.expiryDate && (
                    <p className="text-red-500 text-sm">{error.expiryDate}</p>
                  )}
                </div>

                <div>
                  <input
                    type="text"
                    name="cvv"
                    value={cardCredentials.cvv || ""}
                    onChange={handleInputChange}
                    placeholder="CVV"
                    className="w-[150px] py-2 px-4 border rounded "
                  />
                  {error.cvv && (
                    <p className="text-red-500 text-sm">{error.cvv}</p>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : selectedType === "payhere" ? (
          <div>
            <input
              type="email"
              name="payhereEmail"
              value={cardCredentials.payhereEmail || ""}
              onChange={handleInputChange}
              placeholder="PayHere Email"
              className="w-full py-2 px-4 border rounded mt-2"
            />
            {error.payhereEmail && (
              <p className="text-red-500 text-sm">{error.payhereEmail}</p>
            )}
          </div>
        ) : selectedType === "onlineTransfer" ? (
          <div className="space-y-3">
            <div>
              <input
                type="text"
                name="bankName"
                value={cardCredentials.bankName || ""}
                onChange={handleInputChange}
                placeholder="Bank Name"
                className="w-full py-2 px-4 border rounded "
              />
              {error.bankName && (
                <p className="text-red-500 text-sm">{error.bankName}</p>
              )}
            </div>

            <div>
              <input
                type="text"
                name="branch"
                value={cardCredentials.branch || ""}
                onChange={handleInputChange}
                placeholder="Branch"
                className="w-full py-2 px-4 border rounded "
              />
              {error.branch && (
                <p className="text-red-500 text-sm">{error.branch}</p>
              )}
            </div>

            <div>
              <input
                type="file"
                name="transactionPdf"
                onChange={() => {}}
                className="w-full py-2 px-4 border rounded "
                accept=".pdf"
              />
              {error.transactionPdf && (
                <p className="text-red-500 text-sm">{error.transactionPdf}</p>
              )}
            </div>
          </div>
        ) : null}

        {isCardMethod(selectedType) && (
          <div className="mt-4">
            <input
              type="checkbox"
              id="saveCard"
              checked={saveCard}
              onChange={(e) => setSaveCard(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="saveCard" className="text-violet-950">
              Save card details for future payments
            </label>
          </div>
        )}

        <button
          type="submit"
          className="mt-4 py-2 px-4 w-full bg-violet-950 text-white py-2 px-4 rounded-lg hover:bg-cyan-300"
        >
          Submit Payment
        </button>
      </form>
    </div>
  );
}
