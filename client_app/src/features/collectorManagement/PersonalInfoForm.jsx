import React, { useEffect, useMemo } from "react";
import { Formik, Form } from "formik";

import InputText from "../../components/Input/InputText";
import Dropdown from "../../components/Input/Dropdown";

import {
  regions,
  provinces,
  cities,
  barangays,
  provincesByCode,
  regionByCode,
} from "select-philippines-address";
// Helper function to calculate age based on date of birth
const calculateAge = (dob) => {
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const month = today.getMonth();
  const day = today.getDate();

  if (
    month < birthDate.getMonth() ||
    (month === birthDate.getMonth() && day < birthDate.getDate())
  ) {
    age--;
  }

  return age;
};

const PersonalInfoForm = ({
  selectedLoan,
  isReadOnly = false,
  formikConfig,
}) => {
  return (
    <Formik {...formikConfig(selectedLoan)}>
      {({
        validateForm,
        handleSubmit,
        handleChange,
        handleBlur,
        values,
        touched,
        errors,
        submitForm,
        setFieldTouched,
        setFieldValue,
        setFieldError,
        setErrors,
        isSubmitting,
      }) => {
        // Remove useEffect for age calculation and address fetching if not needed

        // Define the personal info form fields (address, birthdate, age removed)
        const PersonalInfo = useMemo(
          () => (
            <Form>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <InputText
                  disabled={isReadOnly}
                  isReadOnly={isReadOnly}
                  isRequired
                  label="Name"
                  name="name"
                  type="text"
                  value={values.name}
                  onBlur={handleBlur}
                  placeholder="Enter collector's full name"
                />
                <InputText
                  disabled={true}
                  isReadOnly={true}
                  label="Department"
                  name="department"
                  type="text"
                  value={"Collectors"}
                  onBlur={handleBlur}
                />
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <InputText
                  disabled={isReadOnly}
                  isReadOnly={isReadOnly}
                  isRequired
                  label="Username"
                  name="username"
                  type="text"
                  value={values.username}
                  onBlur={handleBlur}
                  placeholder="Enter User Name of Collector"
                />
                <InputText
                  isRequired
                  label="Email"
                  name="email"
                  type="email"
                  value={values.email}
                  onBlur={handleBlur}
                  onChange={(e) => setFieldValue("email", e.target.value)}
                  placeholder="Enter collector's email"
                />
                <InputText
                  disabled={isReadOnly}
                  isReadOnly={isReadOnly}
                  isRequired
                  label="Contact Number"
                  name="contact_number"
                  type="tel"
                  value={values.contact_number}
                  onBlur={handleBlur}
                  onChange={(e) =>
                    setFieldValue("contact_number", e.target.value)
                  }
                  placeholder="Enter collector's contact number"
                />
              </div>

              {/* Move the button inside the form */}
              {!isReadOnly && (
                <div className="flex justify-between mt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-primary"
                  >
                    {isSubmitting ? "Submitting..." : "Submit"}
                  </button>
                </div>
              )}
            </Form>
          ),
          [values, isReadOnly, handleBlur, setFieldValue, isSubmitting]
        );

        return <div>{PersonalInfo}</div>;
      }}
    </Formik>
  );
};

export default PersonalInfoForm;
