// Frontend/personal-assistance-app/src/Hooks/CustomHook/useServiceProviders.js
import { useState, useEffect } from "react";
import { filterServiceProviders } from "../../../Lib/api";

const useServiceProviders = () => {
  const [category, setCategory] = useState("Pet Care"); // Default category
  const [serviceProviders, setServiceProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch service providers when category changes
  useEffect(() => {
    const fetchServiceProviders = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await filterServiceProviders({
          serviceType: category,
        });
        setServiceProviders(response.data.serviceProviders || []);
      } catch (err) {
        setError("Failed to fetch service providers");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchServiceProviders();
  }, [category]);

  return {
    category,
    setCategory,
    serviceProviders,
    loading,
    error,
  };
};

export default useServiceProviders;