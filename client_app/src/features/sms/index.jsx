import { useState, useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Table, { StatusPill } from '../../pages/protected/DataTables/Table';
import { formatAmount } from '../dashboard/helpers/currencyFormat';
import { format } from 'date-fns';
import { jwtDecode } from 'jwt-decode';
import checkAuth from '../../app/auth';
import { Formik, useField, useFormik, Form } from 'formik';
import * as Yup from 'yup';
import InputText from '../../components/Input/InputText';
import Dropdown from '../../components/Input/Dropdown';
import TextAreaInput from '../../components/Input/TextAreaInput'
import {
    regions,
    provinces,
    cities,
    barangays,
    provincesByCode,
    regionByCode
} from 'select-philippines-address';

// import Table, { StatusPill } from '../../pages/protected/DataTables/Table';
function SmsForm({ onSendSms, getSMS, borrowerList }) {

    console.log({ borrowerList })

    let mappedBorrowerList = borrowerList.map((b) => {
        return {
            ...b,
            value: b.contact_number,
            label: `${b.first_name} ${b.last_name}`

        }
    })
    const messageTemplates = {
        Confirmation: "Your loan application has been successfully confirmed. Thank you for choosing us!",
        "Due Notification": "Reminder: Your loan payment is due. Please make the payment by the due date to avoid penalties."
    };

    const formikConfig = {
        initialValues: {
            mobile_number: '',
            email: '',
            type: '',
            message: ''
        },
        validationSchema: Yup.object({
            mobile_number: Yup.string()
                .required('Required field')
                .matches(/^[0-9]{11}$/, 'Must be a valid 11-digit number'),
            email: Yup.string()
                .required('Required field')
                .email('Must be a valid email address'),
            type: Yup.string().required('Required field'),
            message: Yup.string().required('Required field')
        }),
        onSubmit: async (values, { setSubmitting, setFieldError }) => {
            try {


                const sendMessage = async ({ firstName, lastName, phoneNumber, }) => {
                    const message = values.message;


                    // URL encoding the message and phone number
                    const url = `https://sadnsrmvis.com/hwebit_sms/index.php?cp_num=${encodeURIComponent(values.mobile_number)}&message=${encodeURIComponent(message)}`;

                    try {
                        // Perform the request to the server
                        const response = fetch(url, {
                            method: 'GET',
                            mode: 'no-cors'
                        })
                        const data = await response.json(); // Assuming the server returns JSON

                        // Handle the server response
                        if (response.ok) {
                            //console.log('Message sent successfully:', data);
                        } else {
                            // console.error('Error sending message:', data);
                        }
                    } catch (error) {
                        // console.error('Network error:', error);
                    }
                };
                await sendMessage({
                    firstName: 'Dexter',
                    lastName: 'Miranda',
                    phoneNumber: values.mobile_number
                });

                let res = await axios({
                    method: 'POST',
                    url: 'sms/create',
                    data: {
                        sender: 'SYSTEM', // Assuming email is the sender
                        receiver: values.mobile_number, // Assuming mobile_number is the receiver
                        message: values.message,
                        date_sent: new Date().toISOString(), // Sending current date in ISO format
                        status: 'Pending'
                    }
                });


                await getSMS()
                toast.success('Sent Successfully', {
                    onClose: () => {
                        setSubmitting(false);
                        // navigate('/app/users');
                    },
                    position: 'top-right',
                    autoClose: 500,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: 'light'
                });

                // await onSendSms(values);
                // setSubmitting(false);
                // alert('SMS sent successfully!');
            } catch (error) {
                setSubmitting(false);
                setFieldError('general', 'Failed to send SMS. Please try again.');
            }
        }
    };

    return (
        <div className="p-4">
            <Formik {...formikConfig}>
                {({
                    handleSubmit,
                    handleChange,
                    handleBlur,
                    values,
                    touched,
                    errors,
                    setFieldValue
                }) => (
                    <Form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>

                        <Dropdown
                            className="z-50"
                            label="Select Borrower"
                            name="borrower"
                            value={values.borrower}
                            onBlur={handleBlur}
                            options={mappedBorrowerList}
                            setFieldValue={(name, value) => {
                                setFieldValue('borrower', value);

                                let selected = borrowerList.find(b => b.contact_number === value)

                                setFieldValue('email', selected.email);

                                setFieldValue('mobile_number', selected.contact_number);
                            }}
                        />

                        <InputText
                            label="Email"
                            labelColor="text-blue-950"
                            name="email"
                            type="text"
                            placeholder="Enter your email"
                            value={values.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                        />
                        <InputText
                            label="Contact Number"
                            labelColor="text-blue-950"
                            name="mobile_number"
                            type="text"
                            placeholder="Enter your contact number"
                            value={values.mobile_number}
                            onChange={handleChange}
                            onBlur={handleBlur}
                        />
                        <Dropdown
                            className="z-50"
                            label="Message Type"
                            name="type"
                            value={values.type}
                            onBlur={handleBlur}
                            options={[
                                { value: 'Confirmation', label: 'Confirmation' },
                                { value: 'Due Notification', label: 'Due Notification' }
                            ]}
                            setFieldValue={(name, value) => {
                                setFieldValue(name, value);
                                if (messageTemplates[value]) {
                                    setFieldValue('message', messageTemplates[value]);
                                }
                            }}
                        />
                        <TextAreaInput
                            label="Message Content"
                            name="message"
                            value={values.message}
                            onChange={handleChange}
                            onBlur={handleBlur}
                        />
                        {errors.general && <p className="text-red-500">{errors.general}</p>}
                        <button
                            type="submit"
                            className="btn mt-2 w-full bg-blue-950 font-bold text-white"
                        >
                            Send
                        </button>
                    </Form>
                )}
            </Formik>
        </div>
    );
}




function ForgotPassword() {
    const [activeTab, setActiveTab] = useState(1); // State to control active tab
    const INITIAL_USER_OBJ = { emailId: "" };
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [linkSent, setLinkSent] = useState(false);
    const [userObj, setUserObj] = useState(INITIAL_USER_OBJ);
    const [isLoaded, setIsLoaded] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState({});


    const [smsList, setSMSList] = useState([]);

    const [borrowerList, setBorrowerList] = useState([]);

    const params = useParams();
    let userId = params.userId;

    const [selectedUser, setSelectedUser] = useState({});


    const getUser = async () => {
        let res = await axios.get(`user/${userId}`);
        let user = res.data.data;
        setSelectedUser(user);
    };






    const getSMS = async () => {
        let res = await axios({
            method: 'get',
            url: `/sms`,

        });
        let result = res.data.data;

        setSMSList(result);
    };



    const getAllBorrowers = async () => {
        let res = await axios({
            method: 'get',
            url: `/user/borrowers/list`,

        });
        let result = res.data.data;

        setBorrowerList(result);
    };



    useEffect(() => {
        getUser();
        getSMS()
        getAllBorrowers();
        setIsLoaded(true);
    }, []);



    const columns = useMemo(() => [
        {
            Header: 'ID',
            accessor: '',
            Cell: ({ row }) => {
                return (
                    <div className="flex space-x-2">
                        {row.index + 1} {/* Add 1 to make it 1-based index */}
                    </div>
                );
            },
        },
        {
            Header: 'Reciever',
            accessor: 'receiver',
            Cell: ({ row, value }) => {

                return (
                    <div className="flex space-x-2">
                        {value}
                    </div>
                );
            },
        },
        {
            Header: 'Message',
            accessor: 'message',
            Cell: ({ row, value }) => {

                return (
                    <div className="flex space-x-2">
                        {value}
                    </div>
                );
            },
        },
        {
            Header: 'Date Sent',
            accessor: 'date_sent',
            Cell: ({ row, value }) => {

                return format(value, 'MMM dd, yyyy hh:mm:a');
            },
        },


    ], []);

    return isLoaded && (
        selectedUser ? (
            <main className="container mx-auto p-4 h-screen">

                <div className="flex flex-col md:flex-row h-[calc(100vh-100px)] bg-white rounded-lg shadow-lg">
                    <div className="w-full md:w-1/3 p-2 overflow-y-auto border border-gray-300 rounded-lg">
                        {/* Content for the left div */}
                        <SmsForm
                            getSMS={getSMS}
                            borrowerList={borrowerList}
                        />
                    </div>
                    <div className="w-full md:w-2/3 p-2 overflow-y-auto border border-gray-300 rounded-lg">
                        <div className="">
                            <Table columns={columns} data={smsList || []} />
                        </div>
                    </div>
                </div>
                <ToastContainer />
            </main>
        ) : (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">Unknown User</h1>
                    <p className="text-lg text-gray-600">We couldn't find the user you're looking for.</p>
                </div>
            </div>
        )
    );
}

export default ForgotPassword;



