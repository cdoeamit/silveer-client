import React from 'react';
import RegularDashboard from './RegularDashboard';
import RegularBillingDashboard from '../admin/RegularBillingDashboard'; // Use existing

const RegularBilling = () => (
  <RegularDashboard>
    <RegularBillingDashboard />
  </RegularDashboard>
);

export default RegularBilling;
