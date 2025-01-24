import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

function AccountVerification() {
    const navigate = useNavigate();
    const { token } = useParams(); // Retrieve the token from the route
    const [verificationStatus, setVerificationStatus] = useState('pending'); // pending, success, error, or already-verified
    const [message, setMessage] = useState('');

    const verify = async () => {
        try {
            const response = await axios.get(`auth/verify-email/${token}`);
            const { success, message } = response.data;

            console.log({ message })

            if (success) {
                setVerificationStatus('success');
                setMessage('Your account has been successfully verified!');
                setTimeout(() => {
                    navigate('/login'); // Navigate to login page after a short delay
                }, 3000);
            } else if (message === 'User is already verified') {
                setVerificationStatus('already-verified');
                setMessage('Your account is already verified. You can proceed to log in.');
            } else {
                setVerificationStatus('error');
                setMessage(message || 'Verification failed. Please try again.');
            }
        } catch (error) {
            console.error('Verification failed:', error);
            setVerificationStatus('error');
            setMessage('An error occurred during verification. Please try again.');
        }
    };

    useEffect(() => {
        verify();
    }, []);

    return (
        <div className="confirmation-container flex items-center justify-center h-screen bg-gray-100">
            <div className="confirmation-message text-center">
                {verificationStatus === 'pending' && (
                    <>
                        <div className="flex items-center justify-center mb-4">
                            {/* Spinner */}
                            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid border-opacity-75"></div>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-700">Verification In Progress</h2>
                    </>
                )}
                {verificationStatus === 'success' && (
                    <>
                        <h2 className="text-xl font-semibold text-green-600">Verification Successful!</h2>
                        <p className="text-gray-600 mt-2">{message}</p>
                    </>
                )}
                {verificationStatus === 'already-verified' && (
                    <>
                        <h2 className="text-xl font-semibold text-blue-600">Already Verified</h2>
                        <p className="text-gray-600 mt-2">{message}</p>
                        <button
                            onClick={() => navigate('/login')}
                            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Go to Login
                        </button>
                    </>
                )}
                {verificationStatus === 'error' && (
                    <>
                        <h2 className="text-xl font-semibold text-red-600">Verification Failed</h2>
                        <p className="text-gray-600 mt-2">{message}</p>
                        <button
                            onClick={() => navigate('/')}
                            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Go to Homepage
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

export default AccountVerification;
