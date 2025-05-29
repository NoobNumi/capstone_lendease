import { useState } from "react";
import { Link } from "react-router-dom";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { mdiAccount, mdiLockOutline, mdiEye, mdiEyeOff } from "@mdi/js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import InputText from "../../components/Input/InputText";

function Login() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const formikConfig = {
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string().required("Required field"),
      password: Yup.string()
        .min(8, "Minimum of 8 characters")
        .required("Required field"),
    }),
    onSubmit: async (values) => {
      try {
        const res = await axios.post("auth/login", values);
        const { token, data: user } = res.data;
        localStorage.setItem("token", token);
        localStorage.setItem("loggedInUser", JSON.stringify(user));

        console.log({ user });

        if (user.role === "Borrower") {
          window.location.href = "/app/loan_application";
        } else if (user.role === "Admin" || user.role === "Loan Officer") {
          window.location.href = "/app/loan_management";
        } else {
          window.location.href = "/app/dashboard";
        }
      } catch (error) {
        const errorMessage =
          error.response?.data?.message || "An unknown error occurred.";

        console.log({ errorMessage });
        if (
          errorMessage ===
          "Please verify you account first. Check your email to verify."
        ) {
          console.log("1");
          await axios.post("auth/send-verification-email", {
            email: values.email,
          });
        }
        toast.error(errorMessage, { position: "top-right", autoClose: 3000 });
      }
    },
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Login Form - Full Width on Small Screens */}
      <div className="w-full  flex items-center justify-center bg-gray-100 px-6 md:px-0">
        <div className="w-full max-w-lg">
          <div className="flex justify-center -mt-12 mb-6">
            <img
              src="/LOGO.jpeg"
              alt="Logo"
              className="w-20 h-20 rounded-full border-4 border-blue-950 shadow-lg p-1"
            />
          </div>
          <div className="p-6 shadow-lg bg-white rounded-lg">
            <h1 className="text-xl font-bold text-center text-blue-950">
              Login
            </h1>
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
                      type={showPassword ? "text" : "password"}
                      value={values.password}
                      onBlur={handleBlur}
                      endAdornment={
                        <button
                          type="button"
                          onClick={togglePasswordVisibility}
                          className="absolute inset-y-0 right-0 flex items-center pr-3"
                        >
                          {showPassword ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-gray-500"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path
                                fillRule="evenodd"
                                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-gray-500"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                                clipRule="evenodd"
                              />
                              <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                            </svg>
                          )}
                        </button>
                      }
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-blue-950 text-white font-bold py-2 rounded"
                  >
                    Sign in
                  </button>
                  <div className="text-right text-blue-950 text-sm">
                    <a href="/forgot-password" className="hover:underline">
                      Forgot Password?
                    </a>
                  </div>
                  <div className="text-center text-blue-950 text-sm flex justify-center">
                    <p>Don't have an account? Email us to apply </p>
                    <a
                      href="https://mail.google.com/mail/?view=cm&amp;fs=1&amp;to=lendease528@gmail.com"
                      target="_blankñ"
                      className="text-blue-950 underline ml-1"
                    >
                      here
                    </a>
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
