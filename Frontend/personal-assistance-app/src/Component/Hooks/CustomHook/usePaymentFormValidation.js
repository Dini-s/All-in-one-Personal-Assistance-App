import React, { useState } from 'react'

const usePaymentFormValidation = () => {

    //catch error
    const [error, setError] = useState({});

    const formValidation = ({ cardCredentials, paymentType }) => {
        //object for temporary store errors
        const tempError = {};

        if (paymentType === 'visa' || paymentType === 'mastercard') {
            if (!cardCredentials.cardHolderName || cardCredentials.cardHolderName === "") {
                tempError.cardHolderName = "card Holder name required";

                if (!/^[A-Za-z\s-]+$/.test(cardCredentials.cardHolderName)) {
                    tempError.cardHolderName = "Invalid Character in Name"
                }
            }

            //card number validation
            if (!cardCredentials.cardNumber) {
                tempError.cardNumber = "card Number required";
                if (String(cardCredentials.cardNumber).replace(/\s/g, "").length !== 16) {
                    tempError.cardNumber = "Invalid Card Number";
                }
            }

            //cvv validation

            if (!cardCredentials.cvv) {
                tempError.cvv = "CVV required";

                if (!/^\d{3}$/.test(cardCredentials.cvv)) {
                    tempError.cvv = "CVV must be 3 digits";
                }
            }
            //expiry date

            if (!cardCredentials.expiryDate) {
                tempError.expiryDate = "Expiry date required";
            } else {
                // Check format MM/YY or MM/YYYY
                if (!/^\d{2}\/\d{2,4}$/.test(cardCredentials.expiryDate)) {
                    tempError.expiryDate = "Invalid format (use MM/YY or MM/YYYY)";
                } else {
                    const [month, year] = cardCredentials.expiryDate.split('/');
                    const monthNum = parseInt(month, 10);
                    const yearNum = parseInt(year, 10);
                    const currentDate = new Date();
                    const currentYear = currentDate.getFullYear();
                    const currentMonth = currentDate.getMonth() + 1; // Months are 0-indexed

                    // Convert 2-digit year to 4-digit (assuming 2000-2099)
                    const fullYear = year.length === 2 ? 2000 + yearNum : yearNum;
                    // Validate month
                    if (monthNum < 1 || monthNum > 12) {
                        tempError.expiryDate = "Invalid month (must be 01-12)";
                    }
                    // Validate year (not in the past)
                    else if (fullYear < currentYear ||
                        (fullYear === currentYear && monthNum < currentMonth)) {
                        tempError.expiryDate = "Card has expired";
                    }
                    // Validate year not too far in the future (optional)
                    else if (fullYear > currentYear + 20) {
                        tempError.expiryDate = "Invalid expiry year";
                    }



                }
            }
        }
        else if (paymentType === 'payhere') {
            const mailregex = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
            if (!cardCredentials.payhereEmail) {
                tempError.payhereEmail = "payeHere email is reqired";
            }
            else if (!mailregex.test(cardCredentials.payhereEmail)) {
                tempError.payhereEmail = "Email type mismatch";
            }
        }
        else if (paymentType === 'onlineTransfer') {
            if (!cardCredentials.bankName) {
                tempError.bankName = "Bank name is required";
            }

            if (!cardCredentials.branch) {
                tempError.branch = "Branch is required";
            }

            if (!cardCredentials.transactionPdf) {
                tempError.transactionPdf = "Transaction PDF is required";
            } else {
                // Check file type
                if (cardCredentials.transactionPdf.type !== "application/pdf") {
                    tempError.transactionPdf = "File must be a PDF";
                }

                // Check file size (e.g., 5MB limit)
                const maxSize = 5 * 1024 * 1024; // 5MB in bytes
                if (cardCredentials.transactionPdf.size > maxSize) {
                    tempError.transactionPdf = "File size must be less than 5MB";
                }
            }
        }
        setError(tempError);
        return (tempError);

    }

    const clearForm = (field) => {
        setError((prevErrors) => {
            const updatedErrors = { ...prevErrors };
            delete updatedErrors[field]; // Remove the error for the specific field
            return updatedErrors;
        });
    };
    return { error, formValidation, clearForm }
}

export default usePaymentFormValidation;

