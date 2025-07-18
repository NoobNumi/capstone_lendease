import { useState, useRef } from "react";

import LandingIntro from "./LandingIntro";
import ErrorText from "../../components/Typography/ErrorText";
import InputText from "../../components/Input/InputText";
import CheckCircleIcon from "@heroicons/react/24/solid/CheckCircleIcon";
import { Formik, useField, useFormik, Form } from "formik";
import * as Yup from "yup";
import { mdiAccount, mdiLockOutline } from "@mdi/js";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link, useNavigate } from "react-router-dom";

function ForgotPassword() {
  const navigate = useNavigate();
  const formikConfig = {
    initialValues: {
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      newPassword: Yup.string()
        .min(8, "Password must be at least 8 characters long")
        .matches(/[a-z]/, "Password must contain at least one lowercase letter")
        .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
        .matches(/[0-9]/, "Password must contain at least one number")
        .matches(
          /[!@#$%^&*(),.?":{}|<>]/,
          "Password must contain at least one special character"
        )
        .required("Password is required"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("newPassword"), null], "Passwords must match")
        .required("Required"),
    }),
    onSubmit: async (
      values,
      { setSubmitting, setFieldValue, setErrorMessage, setErrors }
    ) => {
      try {
        const token = window.location.pathname.split("/").pop();
        let res = await axios({
          method: "POST",
          url: `auth/reset-password/${token}`,
          data: {
            newPassword: values.newPassword,
            confirmPassword: values.confirmPassword,
          },
        });
        toast.success("Pasword Reset Successfully", {
          onClose: () => {
            setSubmitting(false);
            navigate("/login");
          },
          position: "top-right",
          autoClose: 500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      } catch (error) {
        console.log(error);

        let message = error.response.data.message;

        console.log({ message });
        toast.error(`Failed. ${message}`, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      }
    },
  };

  const INITIAL_USER_OBJ = {
    emailId: "",
  };

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [linkSent, setLinkSent] = useState(false);
  const [userObj, setUserObj] = useState(INITIAL_USER_OBJ);

  const submitForm = (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (userObj.emailId.trim() === "")
      return setErrorMessage("Email Id is required! (use any value)");
    else {
      setLoading(true);
      // Call API to send password reset link
      setLoading(false);
      setLinkSent(true);
    }
  };

  const updateFormValue = ({ updateType, value }) => {
    setErrorMessage("");
    setUserObj({ ...userObj, [updateType]: value });
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center bg-blue-950 shadow-lg">
      <div className="card mx-auto w-full max-w-5xl  shadow-xl">
        <div className="grid  md:grid-cols-2 grid-cols-1  bg-base-100 rounded-xl">
          <div className="flex justify-center items-center">
            <img
              src="/LOGO.jpeg"
              alt="Logo"
              className="w-24 h-24 rounded-full border-2 border-blue-950 p-2"
            />
          </div>
          <div className="py-24 px-10">
            <h2 className="text-2xl font-semibold mb-2 text-center">
              Reset Password
            </h2>

            {linkSent && (
              <>
                <div className="text-center mt-8">
                  <CheckCircleIcon className="inline-block w-32 text-success" />
                </div>
                <p className="my-4 text-xl font-bold text-center">Link Sent</p>
                <p className="mt-4 mb-8 font-semibold text-center">
                  Check your email to reset password
                </p>
                <div className="text-center mt-4">
                  <Link to="/login">
                    <button className="btn btn-block btn-primary ">
                      Login
                    </button>
                  </Link>
                </div>
              </>
            )}

            {!linkSent && (
              <>
                {/* <p className='my-8 font-semibold text-center'>We will send password reset link on your email</p> */}
                {/* <form onSubmit={(e) => submitForm(e)}>

                                    <div className="mb-4">

                                        <InputText type="emailId" defaultValue={userObj.emailId} updateType="emailId" containerStyle="mt-4" labelTitle="Email Id" updateFormValue={updateFormValue} />


                                    </div>

                                    <ErrorText styleClass="mt-12">{errorMessage}</ErrorText>
                                    <button type="submit" className={"btn mt-2 w-full btn-primary" + (loading ? " loading" : "")}>Send Reset Link</button>

                                    <div className='text-center mt-4'>ALready have account? <Link to="/login"><button className="  inline-block  hover:text-primary hover:underline hover:cursor-pointer transition duration-200">Login</button></Link></div>
                                </form> */}

                <Formik {...formikConfig}>
                  {({
                    handleSubmit,
                    handleChange,
                    handleBlur, // handler for onBlur event of form elements
                    values,
                    touched,
                    errors,
                    setFieldValue,
                  }) => {
                    return (
                      <Form className="space-y-4 md:space-y-6">
                        <InputText
                          icons={mdiAccount}
                          label="New Password"
                          name="newPassword"
                          type="text"
                          placeholder=""
                          value={values.newPassword}
                          onBlur={handleBlur} // This apparently updates `touched`?
                        />

                        <InputText
                          icons={mdiAccount}
                          label="Confirm new Password"
                          name="confirmPassword"
                          type="text"
                          placeholder=""
                          value={values.confirmPassword}
                          onBlur={handleBlur} // This apparently updates `touched`?
                        />

                        <button
                          type="submit"
                          className={
                            "btn mt-2 w-full btn-primary" +
                            (loading ? " loading" : "")
                          }
                        >
                          Submit
                        </button>
                      </Form>
                    );
                  }}
                </Formik>
              </>
            )}
          </div>
        </div>
      </div>{" "}
      <ToastContainer />
    </div>
  );
}

export default ForgotPassword;
