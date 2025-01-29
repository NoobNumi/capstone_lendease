import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { mdiAccount, mdiLockOutline, mdiEye, mdiEyeOff } from '@mdi/js';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import InputText from '../../components/Input/InputText';

function Login() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const formikConfig = {
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      email: Yup.string().required('Required field'),
      password: Yup.string().min(8, 'Minimum of 8 characters').required('Required field'),
    }),
    onSubmit: async (values) => {
      try {
        const res = await axios.post('auth/login', values);
        const { token, data: user } = res.data;
        localStorage.setItem('token', token);
        localStorage.setItem('loggedInUser', JSON.stringify(user));
        window.location.href = '/app/loan_application';
      } catch (error) {
        const errorMessage =
          error.response?.data?.message || 'An unknown error occurred.';

        if (errorMessage === 'Please verify your account first. Check your email to verify.') {
          await axios.post('auth/send-verification-email', { email: values.email });
        }
        toast.error(errorMessage, { position: 'top-right', autoClose: 3000 });
      }
    },
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      {/* Left Column */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-r from-gray-100 to-blue-900 items-center justify-center relative p-10">
        <div className="text-center text-white">
          <img src="/LOGO.png" alt="Logo" className="w-24 h-24 mx-auto mb-4 rounded-full border-4 border-white" />
          <p className="text-lg">Get started with your loan application in just a few minutes.</p>
          <Link to="/apply" className="mt-4 inline-block bg-white text-blue-900 py-2 px-6 rounded-full font-bold">Apply Now</Link>
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
          <div className="flex justify-center -mt-12 mb-6">
            <img src="/LOGO.png" alt="Logo" className="w-20 h-20 rounded-full border-4 border-blue-900 shadow-lg p-1" />
          </div>
          <h1 className="text-xl font-bold text-center text-blue-900 mb-4">Login</h1>
          <Formik {...formikConfig}>
            {({ handleSubmit, handleBlur, values }) => (
              <Form className="space-y-4">
                <InputText
                  icons={mdiAccount}
                  label="Email"
                  labelColor="text-blue-900"
                  name="email"
                  type="text"
                  value={values.email}
                  onBlur={handleBlur}
                />
                <div className="relative">
                  <InputText
                    icons={mdiLockOutline}
                    label="Password"
                    labelColor="text-blue-900"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={values.password}
                    onBlur={handleBlur}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path d={showPassword ? mdiEyeOff : mdiEye} />
                    </svg>
                  </button>
                </div>
                <button
                  type="submit"
                  className={`w-full py-2 rounded-md font-bold text-white bg-blue-900 ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
                <div className="text-right text-blue-900">
                  <Link to="/forgot-password" className="text-sm hover:underline">Forgot Password?</Link>
                </div>
                <div className="text-center text-blue-900">
                  <Link to="/register" className="text-sm hover:underline">Don't have an account? Register</Link>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default Login;
