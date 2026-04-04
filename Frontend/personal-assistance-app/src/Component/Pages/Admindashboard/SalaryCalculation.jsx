import React from "react";
import Header from "../../UI/AdminDashboard/Common/Header";
import SalaryApprovalList from "../../UI/AdminDashboard/SalaryHandle/SalaryApprovalList";
import DeductionList from "../../UI/AdminDashboard/SalaryHandle/DeductionList";
import { Button } from "bootstrap/dist/js/bootstrap.bundle.min";
import TopEarners from "../../UI/AdminDashboard/SalaryHandle/TopEarners";
import { LampDemo } from "../../UI/AdminDashboard/SalaryHandle/lamp";
export default function SalaryCalculation() {
  const handleSalary = () => {
    alert("Salary processing endpoint was removed during payment redesign. Reconnect payroll module to new APIs.");
  };

  return (
    <div className="flex-1 relative z-10  ml-[4%] ">
      <Header title="Manage Provider Salaries" />
      <main className="max-w-screen mx-auto py-8 px-0 lg:px-8 ">
        <div className="rounded-2xl w-[1200px] overflow-hidden bg-slate-900 bg-opacity-50 z-1 ml-[10px] mb-[80px] mr-[10px]">
          <h4 className="ml-[20px] mt-2 mb-10">Salary Approval</h4>
          <div className="ml-[900px]">
            <button
              className="bg-white text-blue-900 mb-[20px] text-bolt p-4"
              onClick={handleSalary}
            >
              Process Salary
            </button>
          </div>
          <div className="ml-[60px]">
            <SalaryApprovalList />
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="rounded-xl overflow-hidden bg-slate-900 bg-opacity-50 z-1 mt-[8px] ml-[10px] flex-1">
            <div className="flex items-start gap-4">
              <div className="ml-[100px] mt-[20px] flex-1">
                <DeductionList />
              </div>
              <div>
                <h4 className="text-center mt-[80px] mr-[20px]">
                  {" "}
                  Deduction Rates
                </h4>
              </div>
            </div>
          </div>
          <div className="rounded-xl overflow-hidden bg-slate-900 bg-opacity-50 z-1 mt-[8px] ml-[10px]">
            <h3 className="mt-[10px] ml-[10px]">Top Earners</h3>
            <LampDemo />
          </div>
        </div>
      </main>
    </div>
  );
}
