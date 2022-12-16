import React from 'react';
import classNames from 'classnames';
import { Routes, Route, NavLink, useLocation } from "react-router-dom";

import B1page from './B1';
import J4page from './J4';
import J7page from './J7';
import J9page from './J9';
import J11page from './J11';
import J12page from './J12';
import ShoxPage from './Shox';
import PrestoPage from './Presto';
import AM95Page from './AM95';
import Home from './Home/Home';
import CarNav from './CarNav/CarNav';
import CarControl from './CarControl/CarControl';

import "./scss/index.scss";

function App() {
  const location = useLocation();
  const isHome = location.pathname === "/"
  const carsWithMotion = [ "/J4", "/J9", "/J11", "/J12" ]
  const hasMotion = carsWithMotion.find(element => element === location.pathname);

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
          <img className='logo' alt="home" src={`${process.env.PUBLIC_URL + "/images/logo@2x.png"}`} />
          {!isHome && (
            <img className="rotation ml" alt="360" src={`${process.env.PUBLIC_URL + "/images/360.svg"}`} />
          )}
        </NavLink>

        {!isHome && (
          <>
          <CarNav />
          <CarControl hasMotion={hasMotion} currentPath={location.pathname} />
          </>
        )}

        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/J4" element={<J4page />} />
            <Route path="/J7" element={<J7page />} />
            <Route path="/J9" element={<J9page />} />
            <Route path="/J11" element={<J11page />} />
            <Route path="/J12" element={<J12page />} />
            <Route path="/B1" element={<B1page />} />
            <Route path="/Shox" element={<ShoxPage />} />
            <Route path="/Presto" element={<PrestoPage />} />
            <Route path="/AM95" element={<AM95Page />} />
        </Routes>
      </>
  );
}

export default App;
