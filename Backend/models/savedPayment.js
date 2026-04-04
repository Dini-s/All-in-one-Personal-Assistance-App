import asyncHandler from "express-async-handler"
import { prisma } from "../config/prismaConfig.js"

const maskCardNumber = (cardNumber = "") => {
    const digits = String(cardNumber).replace(/\D/g, "");
    if (digits.length < 4) {
        return "****";
    }
    return `**** **** **** ${digits.slice(-4)}`;
}


//add new saved payment method
const savedPaymentMethod = asyncHandler(async (req, res) => {
    const { paymentMethod, cardNumber, cardHolderName } = req.body;

    if (!paymentMethod || !cardNumber || !cardHolderName) {
        return res.status(400).json({ error: "All fields are required" });
    }
    try {
        const save = await prisma.savedPaymentMethod.create({
            data: {
                paymentMethod: paymentMethod,
                cardNumber: maskCardNumber(cardNumber),
                cardHolderName: cardHolderName,
            }


        })
        res.send({
            message: "Saved PaymentMEthod",
            savedPaymentMethod: save
        })
    } catch (error) {
        res.status(500).json({ message: "payment method save failed" });
        throw new Error("Error occured  saving paymentmethod" + error.message);

    }


})

//delete savedOption
const deleteSavedOption = asyncHandler(async (req, res) => {

    const { methodID } = req.body;
    try {
        const deletemethod = await prisma.savedPaymentMethod.delete({
            where: {
                id: methodID
            }
        })
        res.status(200).json({ message: "successfully deleted", deletemethod })
    } catch (error) {
        console.error("Deletion Failed");
        res.status(500).json({ message: "deletion processing occured error", error });
    }
})

//retriev saved payment details
const retrieveSaveDetails = asyncHandler(async (req, res) => {

    const details = await prisma.savedPaymentMethod.findMany();

    res.send(details)
})

export { savedPaymentMethod, deleteSavedOption, retrieveSaveDetails }