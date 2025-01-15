import axios from "axios";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { BsPlus } from "react-icons/bs";
import { FaBoxOpen } from "react-icons/fa";
import { useLoaderData, useParams } from "react-router-dom";
import { scrollToTop } from "../../../../utils/scrollUtils";
import Pagination from "../../../../components/Pagination/Pagination";
import ProductListAdmin from "../../../../components/ProductListAdmin/ProductListAdmin";

import Table, {
  AvatarCell,
  SelectColumnFilter,
  StatusPill,
  DateCell
} from '../../../../components/DataTables/Table'; // new

import Dropdown from '../../../../components/Input/Dropdown';
import InputText from '../../../../components/Input/InputText';
import { Formik, useField, useFormik, Form } from 'formik';
import * as Yup from 'yup';
import { regions, provinces, cities, barangays, regionByCode, provincesByCode, provinceByName } from "select-philippines-address";

import toast from "react-hot-toast";
const ProductManagement = () => {

  const [products, setProducts] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [sortValue, setSortValue] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  // products pagination start index and end index
  const startIndex = (currentPage - 1) * 5;
  const endIndex = startIndex + 5;
  const params = useParams()

  let membershipId = params.id;


  const [addressRegion, setRegions] = useState([]);
  const [addressProvince, setProvince] = useState([]);
  const [addressCity, setCity] = useState([]);
  const [addressBarangay, setBarangay] = useState([]);
  const prepareAddress = async () => {
    await regions().then(region => {
      setRegions(
        region.map(r => {
          return {
            value: r.region_code,
            label: r.region_name
          };
        })
      );
    });
    // await regionByCode('01').then(region => console.log(region.region_name));
    await provinces().then(province => console.log(province));
    // await provincesByCode('01').then(province => console.log(province));
    // await provinceByName('Rizal').then(province =>
    //   console.log(province.province_code)
    // );
    await cities()
    await barangays()
  };
  useEffect(() => {
    prepareAddress();
  }, []);



  const [memberData, setMemberData] = useState({});
  const [address_region, setaddress_region] = useState('');
  const [address_province, setaddress_province] = useState('');
  const [address_city, setaddress_cities] = useState('');
  const [address_barangay, setaddress_barangay] = useState('');
  const listMembers = async () => {
    let res = await axios({
      method: 'POST',
      url: `users/getMember/${membershipId}`
    }).then(async (res) => {
      let data = res.data.data;

      let memberData = data;





      let address_region = await regionByCode(memberData.address_region)
      let address_province = await provincesByCode(memberData.address_region).then((data) => {
        return data.find(p => p.province_code === memberData.address_province)
      })



      let address_cities = await cities(memberData.address_province).then((data) => {
        return data.find(p => p.city_code === memberData.address_city)
      })


      let address_barangay = await barangays(memberData.address_city).then((data) => {
        return data.find(p => p.brgy_code === memberData.address_barangay)
      })






      setaddress_region(address_region.region_name);
      setaddress_province(address_province.province_name);
      setaddress_cities(address_cities.city_name);
      setaddress_barangay(address_barangay.brgy_name);
      // setMemberData({
      //   ...memberData,
      //   address_region: address_region,
      //   address_province: address_province,
      //   address_cities: address_cities,
      //   address_barangay: address_barangay
      // })
      setIsLoaded(true)
      setMemberData(data)

    });




  };
  useEffect(() => {
    listMembers();
  }, []);


  const formikConfig = () => {

    return {
      initialValues: {
        firstName: memberData.firstName,
        lastName: memberData.lastName,
        address_region: '',
        address_province: '',
        address_city: '',
        address_barangay: '',
        streetAddress: memberData.streetAddress,
        email: memberData.email,
        zipCode: memberData.zipCode,
        homeNumber: memberData.homeNumber,
        cellularNumber: memberData.cellularNumber,
        workNumber: memberData.workNumber,
        website: memberData.website,
        membershipTerm: memberData.membershipTerm,
        membershipLevel: memberData.membershipLevel,
        signDate: memberData.signDate
      },
      validationSchema: Yup.object({
        email: Yup.string().required('Required field'),
        password: Yup.string()
          .min(8, 'Minimun of 8 character(s)')
          .required('Required field')
      }),
      onSubmit: async (
        values,
        { setSubmitting, setFieldValue, setErrorMessage, setErrors }
      ) => {

      }
    }
  }


  const handleApproveRequest = async (membershipId, status) => {

    console.log({ membershipId })
    let res = await axios({
      method: 'POST',
      url: `users/membership/${membershipId}/${status}`
    });

    listMembers()

    if (status === 'REJECTED') {
      toast.error("Rejected");
      document.getElementById('rejectModal').close();

    } else {
      document.getElementById('approveModal').close();
      document.getElementById('approveModal').close();
      toast.success("Success");
    }



  };
  return (
    <section className="product-management">
      {/* Change page title */}
      <Helmet>
        <title>Manage Products - HandiHub Shop</title>
      </Helmet>
      {/* Total products and new product button */}
      <div className="flex flex-wrap items-center justify-between gap-y-2 bg-white px-[4%] py-7 shadow-sm md:px-5">
        <h3 className="flex items-center gap-1 font-semibold sm:text-xl">
          Member Profile
        </h3>
        {/* <Link
          to="/dashboard/add-product"
          className="flex items-center gap-0.5 rounded-md border border-primary bg-primary px-5 py-2 text-xs font-medium text-white transition-all hover:bg-[#967426]"
        >
          <BsPlus size={22} />
          Add
        </Link> */}
      </div>
      {/* Products list container */}
      {isLoaded &&
        <div className="mt-6 divide-y bg-white m-4 ">
          <div className="p-4">

            <div className="">
              <Formik {...formikConfig()}>
                {({
                  handleSubmit,
                  handleChange,
                  handleBlur, // handler for onBlur event of form elements
                  values,
                  touched,
                  errors,
                  setFieldValue,
                  isSubmitting
                }) => {

                  return <div >
                    < form method="dialog" >
                      {/* if there is a button in form, it will close the modal */}
                      < button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" >✕</button>
                    </form>
                    <h3 className="font-bold text-lg text-yellow-700"></h3>

                    <Form className="">
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 ">

                        <InputText
                          // icons={mdiAccount}
                          label="First Name"
                          labelColor="text-white"
                          name="firstName"
                          type="text"
                          placeholder=""
                          value={values.firstName}
                          onBlur={handleBlur} // This apparently updates `touched`?
                        />
                        <InputText
                          // icons={mdiAccount}
                          label="Last Name"
                          labelColor="text-white"
                          name="lastName"
                          type="text"
                          placeholder=""
                          value={values.lastName}
                          onBlur={handleBlur} // This apparently updates `touched`?
                        />


                      </div>

                      <div className="z-50 grid grid-cols-1 gap-3 md:grid-cols-4 ">
                        <InputText
                          // icons={mdiAccount}
                          label="Region"
                          labelColor="text-white"
                          name="lastName"
                          type="text"
                          placeholder=""
                          value={address_region}
                          onBlur={handleBlur} // This apparently updates `touched`?
                        /> <InputText
                          // icons={mdiAccount}
                          label="Province"
                          labelColor="text-white"
                          name="lastName"
                          type="text"
                          placeholder=""
                          value={address_province}
                          onBlur={handleBlur} // This apparently updates `touched`?
                        />
                        <InputText
                          // icons={mdiAccount}
                          label="City"
                          labelColor="text-white"
                          name="lastName"
                          type="text"
                          placeholder=""
                          value={address_city}
                          onBlur={handleBlur} // This apparently updates `touched`?
                        />

                        <InputText
                          // icons={mdiAccount}
                          label="Barangay"
                          labelColor="text-white"
                          name="lastName"
                          type="text"
                          placeholder=""
                          value={address_barangay}
                          onBlur={handleBlur} // This apparently updates `touched`?
                        />

                        {/* <Dropdown
                          className="z-50"
                          defaultValue={address_region}
                          // defaultInputValue="01"
                          label="Region"
                          name="address_region"

                          setFieldValue={setFieldValue}
                          onBlur={handleBlur}
                          options={addressRegions}
                          affectedInput="address_province"
                          allValues={values}
                          functionToCalled={async regionCode => {
                            if (regionCode) {
                              setFieldValue('address_province', '');
                              await provincesByCode(regionCode).then(
                                province => {
                                  setProvince(
                                    province.map(p => {
                                      return {
                                        value: p.province_code,
                                        label: p.province_name
                                      };
                                    })
                                  );
                                }
                              );
                            }
                          }}
                        /> */}


                      </div>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 ">
                        <InputText
                          // icons={mdiAccount}
                          label="Street Address"
                          labelColor="text-white"
                          name="streetAddress"
                          type="text"
                          placeholder=""
                          value={values.streetAddress}
                          onBlur={handleBlur} // This apparently updates `touched`?
                        />
                        <InputText
                          // icons={mdiAccount}
                          label="Zip Code"
                          labelColor="text-white"
                          name="zipCode"
                          type="text"
                          placeholder=""
                          value={values.zipCode}
                          onBlur={handleBlur} // This apparently updates `touched`?
                        />

                      </div>
                      <InputText
                        // icons={mdiAccount}
                        label="Email"
                        labelColor="text-white"
                        name="email"
                        type="email"
                        placeholder=""
                        value={values.email}
                        onBlur={handleBlur} // This apparently updates `touched`?
                      />
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-3 ">
                        <InputText
                          // icons={mdiAccount}
                          label="Home Number"
                          labelColor="text-white"
                          name="homeNumber"
                          type="number"
                          placeholder=""
                          value={values.homeNumber}
                          onBlur={handleBlur} // This apparently updates `touched`?
                        />
                        <InputText
                          // icons={mdiAccount}
                          label="Cellular Number"
                          labelColor="text-white"
                          name="cellularNumber"
                          type="number"
                          placeholder=""
                          value={values.cellularNumber}
                          onBlur={handleBlur} // This apparently updates `touched`?
                        />
                        <InputText
                          // icons={mdiAccount}
                          label="Work Number"
                          labelColor="text-white"
                          name="workNumber"
                          type="number"
                          placeholder=""
                          value={values.workNumber}
                          onBlur={handleBlur} // This apparently updates `touched`?
                        />

                      </div>

                      <InputText
                        // icons={mdiAccount}
                        label="Website"
                        labelColor="text-white"
                        name="website"
                        type="text"
                        placeholder=""
                        value={values.website}
                        onBlur={handleBlur} // This apparently updates `touched`?
                      />          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 ">
                        <InputText
                          // icons={mdiAccount}
                          label="Membership Term"
                          labelColor="text-white"
                          name="membershipTerm"
                          type="text"
                          placeholder=""
                          value={values.membershipTerm}
                          onBlur={handleBlur} // This apparently updates `touched`?
                        />
                        <InputText
                          // icons={mdiAccount}
                          label="Membership Level"
                          labelColor="text-white"
                          name="membershipLevel"
                          type="text"
                          placeholder=""
                          value={values.membershipLevel}
                          onBlur={handleBlur} // This apparently updates `touched`?
                        />
                      </div>
                      <label className={`mt - 0 font - bold text - neutral - 600  block mb - 0 `}>
                        Signature</label>
                      <div className="flex flex-col p-4 border border-gray-300 rounded-lg w-full">
                        {/* Signature Canvas */}

                        {/* Button to clear the signature aligned to the right */}
                        <div className="max-w-md mx-auto">
                          <img
                            src={memberData.downloadURL}

                            className="w-full h-auto object-contain"
                          />
                        </div>

                      </div>
                      <InputText
                        // icons={mdiAccount}
                        label="Signing Date"
                        labelColor="text-white"
                        name="signDate"
                        type="date"
                        placeholder=""
                        value={values.signDate}
                        onBlur={handleBlur} // This apparently updates `touched`?
                      />
                      <div className="modal-action mt-12">
                        <button
                          type="submit"
                          onClick={async () => {

                            document.getElementById('approveModal').showModal();

                          }}
                          disabled={isSubmitting}
                          className={
                            'btn mt-2 bg-green-500 text-white font-bold'

                          }>
                          Approve
                        </button>
                        <button
                          type="submit"
                          onClick={async () => {

                            document.getElementById('rejectModal').showModal();

                          }}

                          className={
                            'btn mt-2 bg-red-500 text-white font-bold'

                          }>
                          Reject
                        </button>
                      </div>
                    </Form>

                  </div>

                }}
              </Formik>
            </div >
            {/* <p className="w-full text-sm font-medium text-gray-700">
            Manage all of your products
          </p>
          <div className="flex w-full items-center justify-end gap-2">
            <p className="text-sm font-medium text-gray-700">Sort By:</p>
            <select
              onChange={handleSort}
              id="product_order_list"
              className="rounded bg-[#ffe5a8] px-2 py-1 text-sm outline-none"
            >
              <option value="desc" className="bg-[#ffe5a8]">
                Latest (desc)
              </option>
              <option value="asc" className="bg-[#ffe5a8]">
                Oldest (asc)
              </option>
            </select>
          </div> */}
          </div>

          <dialog id="approveModal" className="modal">
            <div className="modal-box">
              <form method="dialog">
                {/* if there is a button in form, it will close the modal */}
                <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
              </form>
              <h3 className="font-bold text-lg">Approval Confirmation</h3>
              <p className="py-4">Are you sure you want to approve this request?</p>
              <div className="modal-action">
                <button
                  type="submit"
                  onClick={async () => {
                    await handleApproveRequest(membershipId, 'APPROVED');
                  }}
                  className={
                    'btn mt-2 bg-green-500 text-white font-bold'

                  }>
                  Approve
                </button>
              </div>
            </div>
          </dialog>
          <dialog id="rejectModal" className="modal">
            <div className="modal-box">
              <form method="dialog">
                {/* if there is a button in form, it will close the modal */}
                <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
              </form>
              <h3 className="font-bold text-lg"> Confirmation</h3>
              <p className="py-4">Are you sure you want to reject this request?</p>
              <div className="modal-action">
                <button
                  type="submit"
                  onClick={async () => {
                    await handleApproveRequest(membershipId, 'REJECTED');
                  }}
                  className={
                    'btn mt-2 bg-red-500 text-white font-bold'

                  }>
                  Reject
                </button>
              </div>
            </div>
          </dialog>

        </div>
      }
    </section>
  );
};

export default ProductManagement;
