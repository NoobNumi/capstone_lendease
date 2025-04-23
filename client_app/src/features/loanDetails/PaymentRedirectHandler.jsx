import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';

const PaymentRedirectHandler = ({ setRefreshData }) => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const processPaymentResult = async () => {
      const params = new URLSearchParams(location.search);
      const payment = params.get('payment');
      const reference = params.get('reference');

      if (payment) {
        try {
          if (reference) {
            // Check with backend about payment status
            const response = await axios.get(`/loan/payment-status/${reference}`);

            if (response.data.status === 'completed') {
              toast.success('Payment completed successfully!');
            } else if (response.data.status === 'failed') {
              toast.error(`Payment failed: ${response.data.error || 'Unknown error'}`);
            } else {
              toast.info('Payment is being processed. We will update your account once completed.');
            }
          } else {
            // No reference, just go by URL parameter
            if (payment === 'success') {
              toast.success('Payment completed successfully!');
            } else if (payment === 'failed') {
              toast.error('Payment was not completed. Please try again or contact support.');
            }
          }

          // Trigger refresh of loan data
          if (setRefreshData) {
            setRefreshData(prev => !prev);
          }

          // Clean URL
          navigate(location.pathname, { replace: true });
        } catch (error) {
          console.error('Error checking payment status:', error);
          toast.error('Error verifying payment status. Please check your payments section.');
          navigate(location.pathname, { replace: true });
        }
      }
    };

    processPaymentResult();
  }, [location.search]);

  // Render a transient message if payment parameter exists
  const params = new URLSearchParams(location.search);
  const payment = params.get('payment');

  if (!payment) return null;

  return (
    <div className={`alert ${payment === 'success' ? 'alert-success' : 'alert-error'} mb-4 shadow-lg`}>
      <div>
        {payment === 'success' ? (
          <>
            <CheckCircle className="w-6 h-6" />
            <div>
              <h3 className="font-bold">Payment Successful!</h3>
              <div className="text-sm">Your payment has been processed successfully.</div>
            </div>
          </>
        ) : (
          <>
            <AlertCircle className="w-6 h-6" />
            <div>
              <h3 className="font-bold">Payment Not Completed</h3>
              <div className="text-sm">There was an issue with your payment. Please try again.</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentRedirectHandler; 