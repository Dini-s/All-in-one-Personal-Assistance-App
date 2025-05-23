import mongoose from 'mongoose';

const ServiceProviderSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Combined first and last name
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  serviceType: { type: String, required: true },
  location: { type: String, required: true },
  payRate: { type: [Number], required: true },
  selectedLanguages: { type: [String], required: true },
  about: { type: String, required: true },
  selectedServices: { type: [String], required: true },
  policeClearance: { type: String, required: true },
  photo: { type: String, required: true }, // Ensure the photo field is required
  selectedPetTypes: { type: [String] },
  selectedSyllabi: { type: [String] },
  selectedSubjects: { type: [String] },
  selectedGrades: { type: [String] },
  selectedAgeGroups: { type: [String] },
  userType: { type: String, default: 'sp' },
  nic: { type: String, required: true },
  birthCertificate: { type: String, required: true },
  availability: { type: String, enum: ['yes', 'no'], required: true },
  gender: { type: String, required: true },
  isServiceProvider: { type: Boolean, default: true }
});

const ServiceProvider = mongoose.model('ServiceProvider', ServiceProviderSchema);

export default ServiceProvider;