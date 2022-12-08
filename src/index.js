import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import { VehicleProvider } from "./vehicleContext"
import App from './App';


const rootElement = document.getElementById('root');
const root = createRoot(rootElement);
root.render(
    <Router>
        <VehicleProvider>
            <App />
        </VehicleProvider>
    </Router>
)