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
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Left Section - Hidden on Small Screens */}
      <div className="hidden md:hidden md:block w-1/2 bg-gradient-to-r from-gray-100 to-blue-900 text-blue-950 relative flex items-center justify-center">
        <div className="relative w-full h-screen">
          {/* Triangles */}
          <div className="absolute top-10 left-10 w-0 h-0 border-l-[50px] border-l-transparent border-b-[100px] border-b-red-500 border-r-[50px] border-r-transparent"></div>
          <div className="absolute top-1/4 right-20 w-0 h-0 border-l-[60px] border-l-transparent border-b-[120px] border-b-blue-500 border-r-[60px] border-r-transparent"></div>
          <div className="absolute bottom-16 left-1/3 w-0 h-0 border-l-[70px] border-l-transparent border-b-[140px] border-b-green-500 border-r-[70px] border-r-transparent"></div>
          <div className="absolute bottom-10 right-10 w-0 h-0 border-l-[40px] border-l-transparent border-b-[80px] border-b-yellow-500 border-r-[40px] border-r-transparent"></div>

          {/* Centered Circle */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-950 text-white w-80 h-100 flex flex-col items-center justify-center text-center p-10 rounded-lg">
            <div className="bg-white p-2 rounded-full shadow-lg">
              <img src="/LOGO.png" alt="Logo" className="w-24 h-24 rounded-full border-2 border-blue-950 p-2" />
            </div>
            <p className="text-sm mt-2">Get started with your loan application in just a few minutes.</p>
            <button className="mt-4 bg-white text-blue-950 py-2 px-6 rounded-full font-bold">Apply Now</button>
          </div>
        </div>
      </div>

      {/* Login Form - Full Width on Small Screens */}
      <div className="w-full  flex items-center justify-center bg-gray-100 px-6 md:px-0">
        <div className="w-full max-w-lg">
          <div className="flex justify-center -mt-12 mb-6">
            <img src="/LOGO.png" alt="Logo" className="w-20 h-20 rounded-full border-4 border-blue-950 shadow-lg p-1" />
          </div>
          <div className="p-6 shadow-lg bg-white rounded-lg">
            <h1 className="text-xl font-bold text-center text-blue-950">Login</h1>
            <Formik {...formikConfig}>
              {({ handleSubmit, handleBlur, values }) => (
                <Form className="space-y-4">
                  <InputText
                    icons={mdiAccount}
                    label="Username"
                    labelColor="text-blue-950"
                    name="email"
                    type="text"
                    value={values.email}
                    onBlur={handleBlur}
                  />
                  <div className="relative">
                    <InputText
                      icons={mdiLockOutline}
                      labelColor="text-blue-950"
                      label="Password"
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
                      {showPassword ? (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path d={mdiEyeOff} />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path d={mdiEye} />
                        </svg>
                      )}
                    </button>
                  </div>
                  <button type="submit" className="w-full bg-blue-950 text-white font-bold py-2 rounded">
                    Sign in
                  </button>
                  <div className="text-right text-blue-950 text-sm">
                    <a href="/forgot-password" className="hover:underline">Forgot Password?</a>
                  </div>
                  <div className="text-center text-blue-950 text-sm">
                    <a href="/register" className="hover:underline">Don't have an account? Register</a>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default Login;
