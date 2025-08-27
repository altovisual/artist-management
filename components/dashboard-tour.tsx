// components/dashboard-tour.tsx
'use client';

import React from 'react';
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export function DashboardTour() {
  React.useEffect(() => {
    const hasSeenTour = localStorage.getItem('dashboard_tour_seen');
    if (!hasSeenTour) {
      const driverObj = driver({
        showProgress: true,
        steps: [
          { element: '.stats-cards-container', popover: { title: 'Your Dashboard Overview', description: 'Here you can see a quick summary of your artists, social accounts, and assets.' } },
          { element: '.artists-table-container', popover: { title: 'Manage Your Artists', description: 'This section allows you to view, add, and edit your artists.' } },
          // Add more steps as needed
        ]
      });

      driverObj.drive();
      localStorage.setItem('dashboard_tour_seen', 'true'); // Mark tour as seen
    }
  }, []); // Run once on component mount

  return null; // This component doesn't render any UI itself
}