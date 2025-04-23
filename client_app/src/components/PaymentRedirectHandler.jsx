import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const PaymentRedirectHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Add this debugging line
    console.log("PaymentRedirectHandler checking URL params:", location.search);

    const queryParams = new URLSearchParams(location.search);
    const payment = queryParams.get('payment');
    const reference = queryParams.get('reference');

    if (payment) {
      console.log("Payment redirect detected:", { payment, reference });
      const handlePaymentRedirect = async () => {
        try {
          if (reference) {
            // If we have a reference, check the payment status
            const response = await axios.get(`/loan/payment-status/${reference}`);


            console.log({ response })
            if (response.data.success) {
              if (response.data.status === 'completed') {

                console.log('Manually processing payment due to success redirect but pending status');

                try {
                  // Call manual processing endpoint
                  const manualResult = await axios.post(`/loan/manual-process-payment/${reference}`);

                  if (manualResult.data.success) {
                    toast.success('Payment has been successfully processed!');
                  } else {
                    toast.info('Payment is being processed. We will update your account once completed.');
                  }
                } catch (manualError) {
                  console.error('Error in manual payment processing:', manualError);
                  toast.info('Your payment may take some time to reflect in your account.');
                }


              } else if (response.data.status === 'failed') {
                toast.error(`Payment failed: ${response.data.error || 'Unknown error'}`);
              } else if (payment === 'success') {
                // If payment is success according to URL but not completed according to our records
                // This is where we manually process the payment
                console.log('Manually processing payment due to success redirect but pending status');

                try {
                  // Call manual processing endpoint
                  const manualResult = await axios.post(`/loan/manual-process-payment/${reference}`);

                  if (manualResult.data.success) {
                    toast.success('Payment has been successfully processed!');
                  } else {
                    toast.info('Payment is being processed. We will update your account once completed.');
                  }
                } catch (manualError) {
                  console.error('Error in manual payment processing:', manualError);
                  toast.info('Your payment may take some time to reflect in your account.');
                }
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