import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const PaymentRedirectHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check for payment status in URL params on any page
    const queryParams = new URLSearchParams(location.search);
    const payment = queryParams.get('payment');
    const reference = queryParams.get('reference');

    if (payment) {
      const handlePaymentRedirect = async () => {
        try {
          if (reference) {
            // If we have a reference, check the payment status
            const response = await axios.get(`/loan/payment-status/${reference}`);

            if (response.data.success) {
              if (response.data.status === 'completed') {
                toast.success('Payment completed successfully!');
              } else if (response.data.status === 'failed') {
                toast.error(`Payment failed: ${response.data.error || 'Unknown error'}`);
              } else {
                toast.info('Payment is being processed. We will update your account once completed.');
              }
            }
          } else {
            // No reference, just go by the URL parameter
            if (payment === 'success') {
              toast.success('Payment completed successfully!');
            } else if (payment === 'failed') {
              toast.error('Payment was not completed. Please try again or contact support.');
            }
          }

          // Clean URL - replace the current URL without the query parameters
          navigate(location.pathname, { replace: true });
        } catch (error) {
          console.error('Error processing payment redirect:', error);
          toast.error('Something went wrong processing your payment status.');
          navigate(location.pathname, { replace: true });
        }
      };

      handlePaymentRedirect();
    }
  }, [location.search]);

  // This component doesn't render anything - it just processes redirects
  return null;
};

export default PaymentRedirectHandler; 