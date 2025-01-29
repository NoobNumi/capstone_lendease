import React, { useEffect, useMemo } from 'react';
import { Formik, Form } from 'formik';

import InputText from '../../components/Input/InputText';
import Dropdown from '../../components/Input/Dropdown';


import {
  regions,
  provinces,
  cities,
  barangays,
  provincesByCode,
  regionByCode
} from 'select-philippines-address';
// Helper function to calculate age based on date of birth
const calculateAge = (dob) => {
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const month = today.getMonth();
  const day = today.getDate();

  if (month < birthDate.getMonth() || (month === birthDate.getMonth() && day < birthDate.getDate())) {
    age--;
  }

  return age;
};

const PersonalInfoForm = ({ selectedLoan,
  addressRegions,
  addressProvince,
  setProvince,
  cities,
  addressCity,
  setCity,
  barangays,
  addressBarangay,
  setBarangay,
  provincesByCode,
  formikConfig }) => {




  // Formik form rendering logic
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
        isSubmitting
      }) => {

        console.log({ values })
        // Automatically update age when date of birth changes
        useEffect(() => {
          if (values.date_of_birth) {
            const age = calculateAge(values.date_of_birth);
            setFieldValue('age', age);
          }
        }, [values.date_of_birth, setFieldValue]);



        useEffect(() => {

          async function fetchRegion() {
            let availableRegions = await regions()

            let data = availableRegions.find(p => p.region_code === values.address_region);


            // setAddressRegion(data ? data.region_name : '');
          }


          async function fetchProvinceName() {
            let provinces = await provincesByCode(values.address_region);
            setProvince(provinces.map(r => {
              return {
                value: r.province_code,
                label: r.province_name
              };
            }));
            //setAddressProvince(data ? data.province_name : '');
          }

          async function fetchCities() {
            let citiesAvailable = await cities(values.address_province);
            setCity(
              citiesAvailable.map(r => {
                return {
                  value: r.city_code,
                  label: r.city_name
                };
              })
            );


          }


          async function fetchBrgy() {
            let brgyAvailable = await barangays(values.address_city);
            setBarangay(
              brgyAvailable.map(r => {
                return {
                  value: r.brgy_code,
                  label: r.brgy_name
                };
              })
            );


          }

          fetchRegion()
          fetchProvinceName();
          fetchCities()
          fetchBrgy();
        }, [values.address_region, values.address_province]); // Dependencies for useEffect

        // Define the personal info form fields
        const PersonalInfo = useMemo(() => (
          <Form>
            {/* Given Name, Middle Name, Last Name */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <InputText
                isRequired
                label="Given Name"
                name="first_name"
                type="text"
                value={values.first_name}
                onBlur={handleBlur}
                onChange={(e) => setFieldValue('first_name', e.target.value)}
              />
              <InputText
                isRequired
                label="Middle Name"
                name="middle_name"
                type="text"
                value={values.middle_name}
                onBlur={handleBlur}
              />
              <InputText
                isRequired
                label="Last Name"
                name="last_name"
                type="text"
                value={values.last_name}
                onBlur={handleBlur}
              />
            </div>

            {/* Address Fields */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
              <Dropdown
                label="Region"
                name="address_region"
                value={values.address_region}
                onBlur={handleBlur}
                options={addressRegions}
                setFieldValue={setFieldValue}
                functionToCalled={async (regionCode) => {
                  if (regionCode) {
                    setFieldValue('address_province', '');
                    // Fetch provinces based on region
                    const provinces = await provincesByCode(regionCode);
                    setProvince(
                      provinces.map(r => {
                        return {
                          value: r.province_code,
                          label: r.province_name
                        };
                      })
                    );
                    // setFieldValue('address_province', provinces);
                  }
                }}
              />
              <Dropdown
                label="Province"
                name="address_province"
                value={values.address_province}
                onBlur={handleBlur}
                options={addressProvince}
                setFieldValue={setFieldValue}
                functionToCalled={async (code) => {
                  if (code) {

                    let citiesList = await cities(code);

                    setCity(
                      citiesList.map(r => {
                        return {
                          value: r.city_code,
                          label: r.city_name
                        };
                      })
                    );

                    // setFieldValue('address_city', cities);
                  }
                }}
              />
              <Dropdown
                label="City"
                name="address_city"
                value={values.address_city}
                onBlur={handleBlur}
                options={addressCity}
                setFieldValue={setFieldValue}

                functionToCalled={async (code) => {
                  if (code) {

                    let barangayList = await barangays(code);

                    setBarangay(
                      barangayList.map(r => {
                        return {
                          value: r.brgy_code,
                          label: r.brgy_name
                        };
                      })
                    );

                    // setFieldValue('address_city', cities);
                  }
                }}
              />
              <Dropdown
                label="Barangay"
                name="address_barangay"
                value={values.address_barangay}
                onBlur={handleBlur}
                options={addressBarangay}
                setFieldValue={setFieldValue}
              />
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <InputText
                isRequired
                label="Email"
                name="email"
                type="email"
                value={values.email}
                onBlur={handleBlur}
                onChange={(e) => setFieldValue('email', e.target.value)}
              />
              <InputText
                isRequired
                label="Contact Number"
                name="contact_number"
                type="tel"
                value={values.contact_number}
                onBlur={handleBlur}
                onChange={(e) => setFieldValue('contact_number', e.target.value)}
              />
            </div>

            {/* Birth Date & Age */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <InputText
                isRequired
                label="Birth Date"
                name="date_of_birth"
                type="date"
                value={values.date_of_birth ? new Date(values.date_of_birth).toISOString().split('T')[0] : ''}
                onBlur={handleBlur}
                onChange={(e) => setFieldValue('date_of_birth', e.target.value)}
              />
              <InputText
                isRequired
                label="Age"
                name="age"
                type="text"
                value={values.age}
                onBlur={handleBlur}
              />
            </div>

            {/* Gender and Nationality */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Dropdown
                label="Gender"
                name="gender"
                value={values.gender}
                onBlur={handleBlur}
                setFieldValue={setFieldValue}
                options={[
                  { value: 'MALE', label: 'Male' },
                  { value: 'FEMALE', label: 'Female' }
                ]}
              />
              <InputText
                isRequired
                label="Nationality"
                name="nationality"
                type="text"
                value={values.nationality}
                onBlur={handleBlur}
                onChange={(e) => setFieldValue('nationality', e.target.value)}
              />
            </div>
          </Form>
        ), [values, addressRegions, addressProvince, addressCity, addressBarangay]);

        return (
          <div>
            {PersonalInfo}
            <div className="flex justify-between mt-4">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="btn btn-primary"
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        );
      }}
    </Formik>
  );
};

export default PersonalInfoForm;
