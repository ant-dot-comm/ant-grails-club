import classNames from 'classnames';
import React, { useState, useEffect, useContext } from 'react';
import { NavLink } from "react-router-dom";
import VehicleContext from "../vehicleContext"
import { carData } from "./CarData"

function CarNav() {
  const [opened, setIsOpened] = useState(false)
  const { setColor } = useContext(VehicleContext)


  useEffect(() => {
    setIsOpened(opened)
  }, [opened]);

  if (opened) {
    document.body.classList.add('noscroll');
  } else {
    document.body.classList.remove("noscroll");
  }

  const NavLinkClasses = (isActive) => classNames(
    "nav-vehicle-link",
    isActive ? 'nav-vehicle-link-active' : 'nav-vehicle-link-inactive',
  )

  return (
        <nav className={`nav-vehicle ${opened ? "nav-vehicle--open" : ""}`}>
          <button 
            className={`nav-button ${opened ? "nav-button--open" : ""}`} 
            onClick={( () => setIsOpened(!opened) )}
          >
            <svg width="32" height="32" viewBox="0 0 100 100">
              <path className="line line1" d="M 20,29.000046 H 80.000231 C 80.000231,29.000046 94.498839,28.817352 94.532987,66.711331 94.543142,77.980673 90.966081,81.670246 85.259173,81.668997 79.552261,81.667751 75.000211,74.999942 75.000211,74.999942 L 25.000021,25.000058" />
              <path className="line line2" d="M 20,50 H 80" />
              <path className="line line3" d="M 20,70.999954 H 80.000231 C 80.000231,70.999954 94.498839,71.182648 94.532987,33.288669 94.543142,22.019327 90.966081,18.329754 85.259173,18.331003 79.552261,18.332249 75.000211,25.000058 75.000211,25.000058 L 25.000021,74.999942" />
            </svg>
          </button>
          
          <ul className={`nav-vehicle-list ${opened ? "nav-vehicle-list--open" : ""}`} >
            {
              carData && carData.map((data, key)=>{   
                return (
                    <li key={key} className='nav-vehicle-option' style={{ transitionDelay: `${key}00ms` }}>
                      <NavLink className={({ isActive }) => NavLinkClasses(isActive)} to={data.to} onClick={() => setColor('')}>
                        <img className='nav-vehicle-button-img' alt="" src={data.img} />
                      </NavLink>
                    </li>
                );   
              })  
            }
          </ul>
        </nav>
  );
}

export default CarNav;
