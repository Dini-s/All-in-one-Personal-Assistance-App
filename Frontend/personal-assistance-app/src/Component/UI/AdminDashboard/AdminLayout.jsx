import { Link, Outlet } from "react-router-dom";
import SideNavBar from "../SideNavBar";
import SideBar from "./Common/SideBar";

const AdminLayout = () => {
  return (
   <div className="flex h-screen w-screen bg-indigo-900 text-gray-100 overflow-auto ml-[0%]">
      {/* Sidebar */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 opacity-90" />
        <div className="absolute inset-0 backdrop-blur-sm" />
      </div>
      <SideBar />
      {/* Main Content */}

      <Outlet />
    </div>
  );
};

export default AdminLayout;
