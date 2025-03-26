// Backend/config/seed.js
import mongoose from "mongoose";
import ServiceProvider from "../models/ServiceProvider.js";
import Customer from "../models/Customer.js"; // Import the Customer model
import dotenv from "dotenv";

dotenv.config();

const serviceProviders = [
  {
    name: "Samantha Edirisinghe",
    email: "samantha@example.com",
    password: "password123",
    serviceType: "Pet Care",
    location: "Ganemulla Road, Ragama",
    payRate: [855, 1000],
    selectedLanguages: ["SINHALA", "ENGLISH"],
    about: "I'd describe my personality as kind, bubbly, and easy going. I like working with pets because I can't wait to care for them.",
    selectedServices: ["WALKING", "DAY CARE", "GROOMING"],
    policeClearance: "blob:http://localhost:3000/a6ba0872-01a7-44ad-9c46-5d78bb234924",
    photo: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAAQAAAQABAAD/2wCEAAkGBxQEAEAPA8...",
    selectedPetTypes: ["DOGS", "CATS"],
  },
  {
    name: "Nirmala Kumara",
    email: "nirmala@example.com",
    password: "password123",
    serviceType: "Child Care",
    location: "Poramba, Ambalangoda",
    payRate: [950, 1200],
    selectedLanguages: ["SINHALA", "TAMIL"],
    about: "I've always had a passion for working with children, which led me to pursue a career as a childcare provider.",
    selectedServices: ["DAY CARE", "NANNIES"],
    policeClearance: "blob:http://localhost:3000/a6ba0872-01a7-44ad-9c46-5d78bb234924",
    photo: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAAQAAAQABAAD/2wCEAAkGBxQEAEAPA8...",
    selectedAgeGroups: ["NEWBORN", "TODDLER"],
  },
  {
    name: "Ranjith Manjula",
    email: "ranjith@example.com",
    password: "password123",
    serviceType: "Tutoring",
    location: "Galle Road, Colombo-9",
    payRate: [1500, 1800],
    selectedLanguages: ["ENGLISH", "TAMIL"],
    about: "I'd describe my personality as kind, bubbly, and easy going. I like working with kids because I can't wait to teach them.",
    selectedServices: ["MATHEMATICS", "SCIENCE"],
    policeClearance: "blob:http://localhost:3000/a6ba0872-01a7-44ad-9c46-5d78bb234924",
    photo: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAAQAAAQABAAD/2wCEAAkGBxQEAEAPA8...",
    selectedSyllabi: ["LOCAL", "CAMBRIDGE"],
    selectedSubjects: ["MATHEMATICS", "SCIENCE"],
    selectedGrades: ["1", "2", "3"],
  },
];

const customers = [
  {
    _id: "static-user-123", // Match the static user ID
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+94 123 456 789",
  },
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB Connected Successfully");

    // Clear existing data
    await ServiceProvider.deleteMany({});
    await Customer.deleteMany({});
    console.log("Cleared existing service providers and customers");

    // Seed service providers
    await ServiceProvider.insertMany(serviceProviders);
    console.log("Service providers seeded successfully");

    // Seed customers
    await Customer.insertMany(customers);
    console.log("Customers seeded successfully");

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Error seeding database:", error);
    await mongoose.disconnect();
  }
}

seedDatabase();