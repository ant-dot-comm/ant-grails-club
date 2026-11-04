import React, { Suspense, lazy } from 'react';
import classNames from 'classnames';
import { Routes, Route, NavLink, Navigate, useLocation } from "react-router";

// The showroom (three.js and every car) is code-split so the home page loads without it
const Showroom = lazy(() => import('./Showroom'));
import Home from './Home/Home';
import CarNav from './CarNav/CarNav';
import CarControl from './CarControl/CarControl';
import Loader from './Loader/Loader';

import "./scss/index.scss";

function App() {
  const location = useLocation();
  const isHome = location.pathname === "/"
  const carsWithMotion = [ "/J4", "/J9", "/J11", "/J12", "/B1" ]
  const hasMotion = carsWithMotion.includes(location.pathname);

  return (
      <>
        <NavLink 
          to="/" 
          className={
            classNames(
              'logo-img', 
              {"justify-center" : isHome},
              {"flex-center" : !isHome}
            )
          }>
          <img className='logo' alt="home" src={`${import.meta.env.BASE_URL + "images/logo@2x.png"}`} />
          {!isHome && (
            <img className="rotation ml" alt="360" src={`${import.meta.env.BASE_URL + "images/360.svg"}`} />
          )}
        </NavLink>

        {!isHome && (
          <>
          <CarNav />
          <CarControl key={location.pathname} hasMotion={hasMotion} currentPath={location.pathname} />
          </>
        )}

        <Suspense fallback={null}>
        <Routes>
            <Route path="/" element={<Home />} />
            {/* One route for every car, so the showroom isn't rebuilt when you switch cars */}
            <Route path="/:car" element={<Showroom />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </Suspense>

        {!isHome && <Loader />}
      </>
  );
}

export default App;
