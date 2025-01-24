import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import LandingIntro from './LandingIntro';
import ErrorText from '../../components/Typography/ErrorText';
import InputText from '../../components/Input/InputText';
import { Formik, useField, useFormik, Form } from 'formik';
import * as Yup from 'yup';
import { mdiAccount, mdiLockOutline, mdiEye, mdiEyeOff } from '@mdi/js';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

function TriangleGridBackground() {
  return (
    <div className="relative w-full h-screen bg-gray-100 overflow-hidden">
      {/* Triangle 1 */}
      <div className="absolute top-10 left-10 w-0 h-0 border-l-[50px] border-l-transparent border-b-[100px] border-b-red-500 border-r-[50px] border-r-transparent"></div>

      {/* Triangle 2 */}
      <div className="absolute top-1/4 right-20 w-0 h-0 border-l-[60px] border-l-transparent border-b-[120px] border-b-blue-500 border-r-[60px] border-r-transparent"></div>

      {/* Triangle 3 */}
      <div className="absolute bottom-16 left-1/3 w-0 h-0 border-l-[70px] border-l-transparent border-b-[140px] border-b-green-500 border-r-[70px] border-r-transparent"></div>

      {/* Triangle 4 */}
      <div className="absolute bottom-10 right-10 w-0 h-0 border-l-[40px] border-l-transparent border-b-[80px] border-b-yellow-500 border-r-[40px] border-r-transparent"></div>

      {/* Main Content */}

    </div>
  );
}


function Login() {
  const INITIAL_LOGIN_OBJ = {
    password: '',
    emailId: '',
  };

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loginObj, setLoginObj] = useState(INITIAL_LOGIN_OBJ);

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
      password: Yup.string()
        .min(8, 'Minimum of 8 characters')
        .required('Required field'),
    }),
    onSubmit: async (values) => {
      try {
        const res = await axios.post('auth/login', values);

        const { token, data: user } = res.data;

        localStorage.setItem('token', token);
        localStorage.setItem('loggedInUser', JSON.stringify(user));

        window.location.href = '/app/dashboard';
      } catch (error) {
        toast.error('Login Failed. Unknown User.', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    },
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Left Column for Background Section */}
      <div className="hidden md:block w-1/2 bg-gradient-to-r from-gray-100 to-blue-900 text-blue-950 relative flex items-center justify-center">
        {/* Triangle Decorations */}
        <div className="relative w-full h-screen">
          <div className="absolute top-10 left-10 w-0 h-0 border-l-[50px] border-l-transparent border-b-[100px] border-b-red-500 border-r-[50px] border-r-transparent"></div>
          <div className="absolute top-1/4 right-20 w-0 h-0 border-l-[60px] border-l-transparent border-b-[120px] border-b-blue-500 border-r-[60px] border-r-transparent"></div>
          <div className="absolute bottom-16 left-1/3 w-0 h-0 border-l-[70px] border-l-transparent border-b-[140px] border-b-green-500 border-r-[70px] border-r-transparent"></div>
          <div className="absolute bottom-10 right-10 w-0 h-0 border-l-[40px] border-l-transparent border-b-[80px] border-b-yellow-500 border-r-[40px] border-r-transparent"></div>

          {/* Centered Circle */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-950 text-white w-80 h-100 flex flex-col items-center justify-center text-center clip-hexagon p-10">
            {/* <h2 className="text-xl font-bold">APPLY FOR A LOAN</h2> */}
            <div className="bg-white p-2 rounded-full shadow-lg">
              <img
                src="/LOGO.png"
                alt="Logo"
                className="w-24 h-24 rounded-full border-2 border-blue-950 p-2"
              />
            </div>
            <p className="text-sm mt-2">Get started with your loan application in just a few minutes.</p>
            <button className="mt-4 bg-white text-blue-950 py-2 px-6 rounded-full font-bold">
              Apply Now
            </button>
          </div>
        </div>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-100 relative">
        {/* Container for Login Card */}
        <div className="relative w-full max-w-md">
          {/* Circular Image */}
          <div className="flex justify-center -mt-12 mb-10">
            <img
              src="/LOGO.png"
              alt="Logo"
              className="w-20 h-20 rounded-full border-4 border-blue-950 shadow-lg p-1" // Added shadow-lg
            />
          </div>

          {/* Login Form Card */}
          <div className="p-8 space-y-6 shadow-lg bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg">
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
                    placeholder=""
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
                      className="absolute inset-y-0 right-0 flex items-center pr-3 z-10"
                    >
                      {showPassword ? (
                        <svg className="w-10 h-5 mt-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d={mdiEyeOff} />
                        </svg>
                      ) : (
                        <svg className="w-10 h-5 mt-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d={mdiEye} />
                        </svg>
                      )}
                    </button>
                  </div>
                  <div className="text-right text-blue-950">
                    <a href="/forgot-password">
                      <span className="text-sm hover:text-buttonPrimary hover:underline cursor-pointer transition duration-200">
                        Forgot Password?
                      </span>
                    </a>
                  </div>
                  <button
                    type="submit"
                    className={`btn mt-2 w-full bg-blue-950 font-bold text-white ${loading ? 'loading' : ''
                      }`}
                  >
                    Sign in
                  </button>
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
