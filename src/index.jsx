import React from 'react';
import { HashRouter as Router } from 'react-router';
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