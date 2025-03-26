import mongoose from 'mongoose';

const serviceProviderSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // Combined first and last name
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    serviceType: { type: String, required: true },
    location: { type: String, required: true }, // Changed from address to location
    payRate: { type: [Number], required: true },
    selectedLanguages: { type: [String], required: true },
    about: { type: String, required: true },
    selectedServices: { type: [String], required: true },
    policeClearance: { type: String, required: true },
    photo: { type: String, required: true },
    selectedPetTypes: { type: [String] },
    selectedSyllabi: { type: [String] },
    selectedSubjects: { type: [String] },
    selectedGrades: { type: [String] },
    selectedAgeGroups: { type: [String] },
    availability: [{ day: String, startTime: String, endTime: String }], // From previous code
    isCertificationVerified: { type: Boolean, default: false }, // From previous code
    isAccountVerified: { type: Boolean, default: false }, // From previous code
    status: { type: String, default: 'pending', enum: ['pending', 'verified', 'rejected'] }, // From previous code
  },
  { timestamps: true, collection: 'serviceproviders' } // Explicitly set the collection name
);

export default mongoose.model('ServiceProvider', serviceProviderSchema);