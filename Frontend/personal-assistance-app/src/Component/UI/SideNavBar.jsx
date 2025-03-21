import React from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./../../Styles/navbar.css";
import { Link, Outlet } from "react-router-dom";
function SideNavBar() {
  return (
    <div className="main_contatent">
      <input type="checkbox" id="check"></input>
      <div className="btn_one">
        <label htmlFor="check">
          <i className="fa fa-bars"></i>
        </label>
      </div>

      <div className="sideBar_menu">
        <div className="logo">
          <a href="#">SereniLux</a>
        </div>

        <div className="btn_two">
          <label htmlFor="check">
            <i className="fa fa-times"></i>
          </label>
        </div>

        <div className="menu">
          <ul>
            <li>
              <Link to="/MakePayment">
                <i className="fa fa-home"></i>Home
              </Link>
            </li>
            <li>
              <a href="#">
                <i className="fa fa-credit-card"></i>Monthly Service Payment
              </a>
            </li>
            <li>
              <a href="#">
                <i className="fa fa-credit-card"></i>Refund Service Payment
              </a>
            </li>

            <li>
              <a href="#">
                <i className="fa fa-ban"></i>Cancel Subscription
              </a>
            </li>
          </ul>
        </div>
      </div>
      <Outlet />
    </div>
  );
}

export default SideNavBar;
