import { NavLink } from "react-router-dom";

function Home() {
  return (
      <div className="selection-grid" style={{color: "ffffff"}}>
        <NavLink to="/J4" className="selection selection-j4" />
        <NavLink to="/J7" className="selection selection-j7" />
        <NavLink to="/J9" className="selection selection-j9" />
        <NavLink to="/J11" className="selection selection-j11" />
        <NavLink to="/J12" className="selection selection-j12" />
        <NavLink to="/B1" className="selection selection-bat" />
        <NavLink to="/AM95" className="selection selection-am95" />
        <NavLink to="/Shox" className="selection selection-shox" />
        <NavLink to="/Presto" className="selection selection-presto" />
      </div>
  );
}

export default Home;