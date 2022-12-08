import React, {useContext, useState, useEffect} from 'react';

import { carData } from "../CarNav/CarData"
import VehicleContext from "../vehicleContext"

function CarControl(props) {
  const {
    // hasMotion,
    currentPath
   } = props;

  const { vehicleMotion, changeColor } = useContext(VehicleContext)
  // const [ toggleMotion, setToggleMotion ] = useState(false)
  const [ color, setColor ] = useState(0)
  
  // useEffect(() => {
  //   vehicleMotion(toggleMotion)
  // }, [toggleMotion]);
  
  function filterByPath(item) {
    if (item.to === currentPath) {
      return true;
    }
    if (item.to === undefined) {
      return false;
    }
  }
  
  const carPathData = carData.filter(filterByPath)
  const carPathDataOptions = carPathData[0].options
  const carPathDataOptionCount = carPathDataOptions.length - 1
  
  useEffect(() => {
    changeColor(carPathDataOptions[color])
  }, [color]);

  console.log({color})

  const caret = (
    <svg width="32px" height="32px" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
      <path fill="#666666" d="M128,28A100,100,0,1,0,228,128,100.11332,100.11332,0,0,0,128,28Zm0,192a92,92,0,1,1,92-92A92.10416,92.10416,0,0,1,128,220ZM146.67578,94.97314,109.97949,128l36.69629,33.02686a3.99992,3.99992,0,1,1-5.35156,5.94628l-40-36a3.99976,3.99976,0,0,1,0-5.94628l40-36a3.99992,3.99992,0,1,1,5.35156,5.94628Z"/>
    </svg>
  )

  return (
    <>
      <div className="toggle-container">
        {/* {hasMotion && (
          <button className={`motion-toggle ${toggleMotion ? "motion-toggle--on" : "motion-toggle--off"}`} onClick={( () => setToggleMotion(!toggleMotion) )} />
        )} */}
        {carPathDataOptions && (
          <button 
            className="color-option-button"
            disabled={color <= 0} 
            onClick={() => setColor(prevCount => prevCount - 1)}
          >
            {caret}
          </button>
        )}
        {carPathDataOptions && (
          <button 
            className="color-option-button color-option-button--next"
            disabled={color >= carPathDataOptionCount} 
            onClick={() => setColor(prevCount => prevCount + 1)}
          >
            {caret}
          </button>
        )}
      </div>
    </>
  );
}

export default CarControl;