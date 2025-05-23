import { BarChart2, ShoppingBag, Users, Zap } from "lucide-react";
import { motion } from "framer-motion";

import Header from "../../UI/AdminDashboard/Common/Header";
import StatCard from "../../UI/AdminDashboard/Common/StatCard";
import RevenueByServiceChart from "../../UI/AdminDashboard/Revenue/RevenueByServiceChart";
import CategoryDistributionChart from "../../UI/AdminDashboard/Category/CategoryDistributionChart";
import ProfitLossOverviewChart from "../../UI/AdminDashboard/ProfitLoss/ProfitLossOverviewChart";
import { useState, useEffect } from "react";
import axios from "axios";

const Overview = () => {
  const [totalBooking, setTotalBooking] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalServices, setTotalServices] = useState(0);
  const [totalProvider, setTotalProvider] = useState(0);

  useEffect(() => {
    const getTotalBooking = () => {
      axios
        .get("http://localhost:8070/adminDashBoard/Financial/totBooking")
        .then((res) => {
          console.log(res);
          setTotalBooking(res.data.count);
        });
    };

    const getTotalUser = () => {
      axios
        .get("http://localhost:8070/adminDashBoard/Financial/totUser")
        .then((res) => {
          console.log(res);
          setTotalUsers(res.data.count);
        });
    };

    const getTotalServices = () => {
      axios
        .get("http://localhost:8070/adminDashBoard/Financial/totService")
        .then((res) => {
          setTotalServices(res.data.count);
        });
    };

    const getTotalProviders = () => {
      axios
        .get("http://localhost:8070/adminDashBoard/Financial/totProvider")
        .then((res) => {
          setTotalProvider(res.data.count);
        });
    };
    getTotalBooking();
    getTotalUser();
    getTotalServices();
    getTotalProviders();
  }, []);

  return (
    <div className="flex-1 w-64 relative z-10  ml-[2%] ">
      <Header title="Overview" />

      <main className="max-w-screen mx-auto py-8 px-0 lg:px-8">
        {/* STATS */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-4 gap-9 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <StatCard
            name="Total Agreements"
            icon={Zap}
            value={totalBooking}
            color="#6366F1"
          />
          <StatCard
            name="Users"
            icon={Users}
            value={totalUsers}
            color="#8B5CF6"
          />
          <StatCard
            name="Total Services"
            icon={ShoppingBag}
            value={totalServices}
            color="#EC4899"
          />
          <StatCard
            name="Total Providers"
            icon={BarChart2}
            value={totalProvider}
            color="#10B981"
          />
        </motion.div>
        {/*add Charts*/}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <RevenueByServiceChart />
          <CategoryDistributionChart />
        </div>
      </main>
    </div>
  );
};
export default Overview;
