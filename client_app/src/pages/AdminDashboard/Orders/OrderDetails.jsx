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
import { formatPrice } from "../../../../utils/formatPrice";
import { dateFormatMDY } from "../../../../utils/dateFormatMDY";
import useAxiosSecure from "../../../../hooks/useAxiosSecure";
import { productDetails } from "../../../../assets/data/productDetails";

const PaymentDetailsTable = ({ data }) => {
  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Paypal Payment Details</h2>
      <table className="table-auto w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2">Field</th>
            <th className="border border-gray-300 px-4 py-2">Value</th>
          </tr>
        </thead>
        <tbody>
          {/* Customer Details */}
          <tr>
            <td className="border border-gray-300 px-4 py-2">Customer Email</td>
            <td className="border border-gray-300 px-4 py-2">{data.email}</td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-4 py-2">First Name</td>
            <td className="border border-gray-300 px-4 py-2">{data.firstName}</td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-4 py-2">Last Name</td>
            <td className="border border-gray-300 px-4 py-2">{data.lastName}</td>
          </tr>

          {/* Payment Details */}
          <tr>
            <td className="border border-gray-300 px-4 py-2">Payment ID</td>
            <td className="border border-gray-300 px-4 py-2">{data.paymentDetails.id}</td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-4 py-2">Payment Intent</td>
            <td className="border border-gray-300 px-4 py-2">{data.paymentDetails.intent}</td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-4 py-2">Payment Status</td>
            <td className="border border-gray-300 px-4 py-2">{data.paymentDetails.status}</td>
          </tr>

          {/* Purchase Unit Details */}
          <tr>
            <td className="border border-gray-300 px-4 py-2">Purchase Amount</td>
            <td className="border border-gray-300 px-4 py-2">
              {data.paymentDetails.purchase_units[0].amount.value}{" "}
              {data.paymentDetails.purchase_units[0].amount.currency_code}
            </td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-4 py-2">Payee Email</td>
            <td className="border border-gray-300 px-4 py-2">
              {data.paymentDetails.purchase_units[0].payee.email_address}
            </td>
          </tr>

          {/* Shipping Details */}
          <tr>
            <td className="border border-gray-300 px-4 py-2">Shipping Name</td>
            <td className="border border-gray-300 px-4 py-2">
              {data.paymentDetails.purchase_units[0].shipping.name.full_name}
            </td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-4 py-2">Shipping Address</td>
            <td className="border border-gray-300 px-4 py-2">
              {data.paymentDetails.purchase_units[0].shipping.address.address_line_1},
              {data.paymentDetails.purchase_units[0].shipping.address.admin_area_2},
              {data.paymentDetails.purchase_units[0].shipping.address.admin_area_1},
              {data.paymentDetails.purchase_units[0].shipping.address.postal_code},
              {data.paymentDetails.purchase_units[0].shipping.address.country_code}
            </td>
          </tr>

          {/* Payer Info */}
          <tr>
            <td className="border border-gray-300 px-4 py-2">Payer Name</td>
            <td className="border border-gray-300 px-4 py-2">
              {data.paymentDetails.payer.name.given_name}{" "}
              {data.paymentDetails.payer.name.surname}
            </td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-4 py-2">Payer Email</td>
            <td className="border border-gray-300 px-4 py-2">
              {data.paymentDetails.payer.email_address}
            </td>
          </tr>

          {/* Transaction Details */}
          <tr>
            <td className="border border-gray-300 px-4 py-2">Transaction ID</td>
            <td className="border border-gray-300 px-4 py-2">
              {data.paymentDetails.purchase_units[0].payments.captures[0].id}
            </td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-4 py-2">Transaction Status</td>
            <td className="border border-gray-300 px-4 py-2">
              {data.paymentDetails.purchase_units[0].payments.captures[0].status}
            </td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-4 py-2">Transaction Amount</td>
            <td className="border border-gray-300 px-4 py-2">
              {data.paymentDetails.purchase_units[0].payments.captures[0].amount.value}{" "}
              {data.paymentDetails.purchase_units[0].payments.captures[0].amount.currency_code}
            </td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-4 py-2">Capture Time</td>
            <td className="border border-gray-300 px-4 py-2">
              {new Date(
                data.paymentDetails.purchase_units[0].payments.captures[0].create_time
              ).toLocaleString()}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
const ProductManagement = () => {
  const { axiosSecure } = useAxiosSecure();
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

  let orderId = params.id;



  console.log({ orderId })



  const [orderDetails, setOrderDetails] = useState({});
  const [address_region, setaddress_region] = useState('');
  const [address_province, setaddress_province] = useState('');
  const [address_city, setaddress_cities] = useState('');
  const [address_barangay, setaddress_barangay] = useState('');
  const fetchDetails = async () => {

    let res = await axios({
      method: 'POST',
      url: `users/order/${orderId}`
    })

    setOrderDetails(res.data.data)

    setIsLoaded(true)

  };
  useEffect(() => {
    fetchDetails();

  }, []);


  const handleStatusChange = async (orderId, newStatus) => {


    console.log({ newStatus })

    if (newStatus === 'cancelled') {
      document.getElementById('cancelOrderModal').showModal();
    }
    return true;
    try {
      const res = await axiosSecure.put(`/admin/orders/${orderId}/status`, {
        status: newStatus,
      });
      if (res.data.modifiedCount > 0) {
        fetchDetails()
        toast.success("Order status updated successfully");
      } else {
        toast.error("Failed to update order status");
      }
    } catch (err) {
      console.error("Error updating order status:", err);
      toast.error("Failed to update order status");
    }
  };


  const formikConfig = () => {

    return {
      initialValues: {

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


  const formikConfigCancelOrder = () => {

    return {
      initialValues: {
        reason: ''
      },
      validationSchema: Yup.object({
        reason: Yup.string().required('Required field'),

      }),
      onSubmit: async (
        values,
        { setSubmitting, setFieldValue, setErrorMessage, setErrors }
      ) => {



        const res = await axiosSecure.post(`/admin/order/cancel/${orderId}`, {
          reason: values.reason,
        });
        toast.success("Cancelled Successfully");
        document.getElementById('cancelOrderModal').close();

      }
    }
  }


  const handleApproveRequest = async (membershipId, status) => {

    console.log({ membershipId })
    let res = await axios({
      method: 'POST',
      url: `users/membership/${membershipId}/${status}`
    });

    fetchDetails()

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
          Order Details
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
        <div className="mt-6 divide-y ">
          <div className="">
            <div className="max-w-md mx-auto mt-4">
              <div className="bg-yellow-200 border border-yellow-400 text-yellow-800 px-4 py-3 rounded flex items-center" role="alert">
                <svg
                  className="w-5 h-5 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M12 4h.01M12 20h.01M4.293 4.293a1 1 0 010 1.414L12 12l7.707-7.293a1 1 0 10-1.414-1.414L12 10.586 4.293 4.293z"
                  />
                </svg>
                <span>Please double-check the payment proof and receipt before changing the status to Processing.</span>
              </div>
            </div>
            <div className="flex justify-end items-center p-4 bg-gray-100 ">

              <h1 className="text-xl font-bold mr-2 text-blue-500">Status</h1>
              <select
                className={`cursor-pointer rounded border border-gray-300 px-3 py-2 text-gray-800 ${orderDetails.status === "cancelled" &&
                  "border-red-300 bg-red-200 text-red-800"
                  } ${orderDetails.status === "delivered" && "border-green-300 bg-green-200 text-green-800"}`}
                disabled={
                  orderDetails.status === "cancelled" ||
                  orderDetails.status === "delivered"
                }
                value={orderDetails.status}
                onChange={(e) =>
                  handleStatusChange(orderDetails._id, e.target.value)
                }
              >
                <option
                  value="pending"
                  disabled={[
                    "pending",
                    "processing",
                    "shipped",
                    "delivered",
                    "cancelled",
                  ].includes(orderDetails.status)}
                  className={
                    [
                      "pending",
                      "processing",
                      "shipped",
                      "delivered",
                      "cancelled",
                    ].includes(orderDetails.status)
                      ? "text-gray-400"
                      : ""
                  }
                >
                  Pending
                </option>
                <option
                  value="processing"
                  disabled={[
                    "processing",
                    "delivered",
                    "cancelled",
                  ].includes(orderDetails.status)}
                  className={
                    ["processing", "delivered", "cancelled"].includes(
                      orderDetails.status,
                    )
                      ? "text-gray-400"
                      : ""
                  }
                >
                  Processing
                </option>
                <option
                  value="shipped"
                  disabled={[
                    // "processing",
                    // "delivered",
                    // "cancelled",
                  ].includes(orderDetails.status)}
                  className={
                    [].includes(
                      orderDetails.status,
                    )
                      ? "text-gray-400"
                      : ""
                  }
                >
                  Shipped
                </option>
                <option
                  value="delivered"
                  disabled={["delivered", "cancelled"].includes(
                    orderDetails.status,
                  )}
                  className={
                    ["delivered", "cancelled"].includes(orderDetails.status)
                      ? "text-gray-400"
                      : ""
                  }
                >
                  Delivered
                </option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

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

                  return <div className="flex flex-col md:flex-row">
                    <div className=" flex-1  max-w-3xl mx-auto p-8 bg-white border border-gray-300 rounded-lg shadow-lg">
                      {/* Header Section */}
                      <div className="flex justify-between items-center border-b pb-4 mb-6">
                        {/* Logo */}
                        <div className="flex items-center space-x-4">
                          <img src={
                            '/src/assets/logo/logo.png'
                          } alt="Company Logo" className="w-20 h-20 object-cover" />
                          <div>
                            <h1 className="text-xl font-bold">Handi Hub</h1>
                            <p className="text-sm text-gray-600">Zone 2, San Jose, Alanao Lupi Camarines Sur</p>
                          </div>
                        </div>
                        {/* Invoice Info */}
                        <div className="text-right">
                          <h2 className="text-xl font-bold">Invoice</h2>
                          <p className="text-sm text-gray-600">Invoice #: 123456</p>
                          <p className="text-sm text-gray-600">Date: {orderDetails.date}</p>
                        </div>
                      </div>

                      {/* Billing and Client Info */}
                      <div className="flex justify-between mb-6">
                        <div>
                          <StatusPill value={orderDetails.status !== 'pending' && orderDetails.payment_prof ? 'PAID' : orderDetails.status} />
                          <h3 className="text-lg font-bold mt-2">Billed To:</h3>
                          <p className="text-gray-700">{
                            `${orderDetails.billingData.firstName} ${orderDetails.billingData.lastName}`
                          }</p>
                          <p className="text-gray-700">{
                            `${orderDetails.billingData.complete_address}`
                          }</p>
                        </div>
                        {/* <div>
                          <h3 className="text-lg font-bold">Company Info:</h3>
                          <p className="text-gray-700">Company Name</p>
                          <p className="text-gray-700">123 Business Rd, City, Country</p>
                        </div> */}
                      </div>

                      {/* Table Section */}
                      <table className="w-full mb-6 border-collapse">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border px-4 py-2 text-left text-sm text-gray-700">Item</th>
                            <th className="border px-4 py-2 text-left text-sm text-gray-700">Quantity</th>
                            <th className="border px-4 py-2 text-left text-sm text-gray-700">Price</th>
                            <th className="border px-4 py-2 text-left text-sm text-gray-700">Total</th>
                            <th className="border px-4 py-2 text-left text-sm text-gray-700">Image</th>
                            <th className="border px-4 py-2 text-left text-sm text-gray-700">Customization</th>
                          </tr>
                        </thead>
                        <tbody>

                          {
                            orderDetails.items.map((item) => {
                              return <tr>
                                <td className="border px-4 py-2">{item.title}</td>
                                <td className="border px-4 py-2">{item.quantity}</td>
                                <td className="border px-4 py-2">{formatPrice(item.price)}</td>
                                <td className="border px-4 py-2">{formatPrice(item.price * item.quantity)}</td>
                                <td className="border px-4 py-2">
                                  <img src={item.thumbnail} alt="Proof of Payment 2" className="w-12 h-12 object-cover" />
                                </td>
                                <td className="border px-4 py-2">


                                  <div
                                    style={{ backgroundColor: item.color }} // Use inline style for hex color
                                    className="w-20 h-18 inline-block m-2 flex items-center justify-center"
                                  >
                                    {/* Optional: Display the hex code */}
                                    <span className="text-white font-bold">{item.color}</span>
                                  </div>
                                </td>
                              </tr>

                            })
                          }


                        </tbody>
                      </table>

                      {/* Summary Section */}
                      <div className="flex justify-end mb-6">
                        <div className="w-full sm:w-1/3">
                          <div className="flex justify-between py-2">
                            <span className="font-bold">Shipping Fee:</span>
                            <span>
                              {formatPrice(productDetails.shippingFee)}</span>
                          </div>

                          <div className="flex justify-between py-2 border-t-2 border-gray-200 pt-2">
                            <span className="font-bold">Total:</span>
                            <span>    {formatPrice(orderDetails.totalPrice)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <p className="text-center text-gray-600 text-sm">
                        Thank you!
                      </p>
                    </div>

                    <div className=" flex-1  max-w-3xl mx-auto p-8 bg-white border border-gray-300 rounded-lg shadow-lg">
                      <h1 className="text-xl font-bold">Proof of Payment</h1>
                      {orderDetails.billingData.paymentDetails && <PaymentDetailsTable data={orderDetails.billingData} />}
                      <div className="p-4 flex flex-col items-center">
                        {
                          orderDetails.payment_prof && <img
                            src={orderDetails.payment_prof}
                            alt="Placeholder"
                            className="mt-4 w-80 h-90"
                          />
                        }
                        {
                          !orderDetails.billingData.paymentDetails && !orderDetails.payment_prof && <h1 className="text-xl font-bold text-green-500">Cash on Delivery</h1>
                        }
                      </div>
                      <h1 className="text-xl font-bold mb-2">Reference #</h1>
                      <p>{orderDetails.referenceNumber}</p>
                      <h1 className="text-xl font-bold mb-2 mt-8">Submitted Customization </h1>
                      <div className="flex space-x-2">

                        {
                          orderDetails.items.map((item) => {




                            return (item.customizeDesignImagesLinks || []).map((thumbnail, index) => {
                              return <div className="w-24 h-24 overflow-hidden rounded-lg shadow-md">
                                <img
                                  src={thumbnail}
                                  alt={`preview-${index}`}
                                  className="w-full h-auto rounded-lg shadow-md" // Tailwind classes for styling
                                />

                              </div>
                            })


                          })





                        }
                      </div>
                    </div>

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
          <dialog id="cancelOrderModal" className="modal">
            <Formik {...formikConfigCancelOrder()}>
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
                return <div className="modal-box">
                  <form method="dialog">
                    {/* if there is a button in form, it will close the modal */}
                    <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                  </form>
                  <h3 className="font-bold text-lg">Cancel Order Confirmation</h3>
                  <p className="py-4">Are you sure you want to cancel this order?</p>

                  <InputText

                    label="Reason"
                    name="reason"
                    type="text"
                    placeholder=""
                    value={values.reason}

                    onBlur={handleBlur} // This apparently updates `touched`?
                  />
                  <div className="modal-action">
                    <button
                      type="submit"
                      onClick={async () => {

                        handleSubmit()
                        // await handleApproveRequest(membershipId, 'APPROVED');
                      }}
                      className={
                        'btn mt-2 bg-red-500 text-white font-bold'

                      }>
                      Approve
                    </button>
                  </div>
                </div>
              }}
            </Formik>

          </dialog>
        </div >
      }
    </section >
  );
};

export default ProductManagement;
