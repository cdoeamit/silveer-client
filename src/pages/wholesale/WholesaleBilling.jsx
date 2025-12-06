import React from 'react';
import WholesaleDashboard from './WholesaleDashboard';
import BillingDashboard from '../admin/BillingDashboard'; // Import existing component

const WholesaleBilling = () => {
  return (
    <WholesaleDashboard>
      <BillingDashboard />
    </WholesaleDashboard>
  );
};

export default WholesaleBilling;
