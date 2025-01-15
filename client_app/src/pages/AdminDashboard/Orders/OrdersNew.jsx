import axios from "axios";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { BsPlus } from "react-icons/bs";
import { FaBoxOpen } from "react-icons/fa";
import { Link } from "react-router-dom";
import { scrollToTop } from "../../../../utils/scrollUtils";
import Pagination from "../../../../components/Pagination/Pagination";
import ProductListAdmin from "../../../../components/ProductListAdmin/ProductListAdmin";
import { formatPrice } from "../../../../utils/formatPrice";
import { dateFormatMDY } from "../../../../utils/dateFormatMDY";
import Table, {
  AvatarCell,
  SelectColumnFilter,
  StatusPill,
  DateCell
} from '../../../../components/DataTables/Table'; // new
import toast from "react-hot-toast";
import useAxiosSecure from "../../../../hooks/useAxiosSecure";
const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [refetch, setRefetch] = useState(false);
  const [sortValue, setSortValue] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // products pagination start index and end index
  const startIndex = (currentPage - 1) * 5;
  const endIndex = startIndex + 5;

  const [orders, setOrders] = useState([]);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const { axiosSecure } = useAxiosSecure();

  // Get all orders
  const getAllOrders = async () => {
    try {
      const res = await axiosSecure.get("/admin/orders");
      setOrders(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getAllOrders();
  }, []);


  // Filter orders with status "pending" or "processing"
  const pendingOrders = orders.filter(
    (order) => order.status === "pending" || order.status === "processing"
  );

  // Get the total number of pending or processing orders
  const totalOrders = pendingOrders.length;

  // Toggle all the ordered items of an user
  const toggleOrderDetails = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };




  // useEffect(() => {
  //   axios
  //     .get(`/products?sortBy=${sortValue}`)
  //     .then((res) => {
  //       setProducts(res.data);
  //       setTotalPages(Math.ceil(res.data.length / 5));
  //     })
  //     .catch((error) => console.error("Error fetching products:", error));
  // }, [refetch, sortValue]);






  const [memeberList, setMemberList] = useState([]);
  const [activeMembershipId, setactiveMembershipId] = useState('');
  const listMembers = async () => {
    let res = await axios({
      method: 'POST',
      url: 'users/listMembers'
    });
    let data = res.data.data;

    setMemberList(data)

  };
  useEffect(() => {
    listMembers();
  }, []);

  console.log({ orders })


  const tableColumns = [
    {
      Header: '#',
      accessor: '',

      Cell: ({ value, row }) => {
        console.log({ row })

        return <span className="font-bold text-slate-700">{row.index + 1}</span>;
      }
    },
    {
      Header: 'First Name',
      accessor: 'billingData.firstName',

      Cell: ({ value }) => {
        return <span className="font-bold text-slate-700">{value}</span>;
      }
    },
    {
      Header: 'Last Name',
      accessor: 'billingData.lastName',

      Cell: ({ value }) => {
        return <span className="font-bold text-slate-700">{value}</span>;
      }
    },
    {
      Header: 'Email',
      accessor: 'email',

      Cell: ({ value }) => {
        return <span className="font-bold text-slate-700">{value}</span>;
      }
    },

    {
      Header: 'Date Created',
      accessor: 'date',

      Cell: ({ value }) => {
        return <span className="font-bold text-slate-700">{value}</span>;
      }
    },
    {
      Header: 'Total',
      accessor: 'totalPrice',

      Cell: ({ value }) => {
        return <span className="font-bold text-slate-700">{formatPrice(value)}</span>;
      }
    },
    {
      Header: 'Quantity',
      accessor: 'quantity',

      Cell: ({ value }) => {
        return <span className="font-bold text-slate-700">{value}</span>;
      }
    },
    {
      Header: 'Type',
      accessor: '',

      Cell: ({ value, row }) => {

        let data = row.original;

        let status = data.billingData.paymentDetails || data.payment_prof ? 'Online Payment' : 'Cash on Delivery'
        return <span className="font-bold text-yellow-600">{status}</span>;
      }
    },
    {
      Header: 'Status',
      accessor: 'status',
      Cell: StatusPill,
    },

    //   {
    //     Header: 'Address',
    //     accessor: 'streetAddress',

    //     Cell: ({ value, row }) => {




    //       return <span className="font-bold text-slate-700">{value}</span>;
    //     }
    //   },
    //   {
    //     Header: 'Email',
    //     accessor: 'email',

    //     Cell: ({ value }) => {
    //       return <span className="font-bold text-slate-700">{value}</span>;
    //     }
    //   },
    //   {
    //     Header: 'Date Signed',
    //     accessor: 'signDate',

    //     Cell: ({ value }) => {
    //       return <span className="font-bold text-slate-700">{value}</span>;
    //     }
    //   },
    //   {
    //     Header: 'Status',
    //     accessor: 'status',
    //     Cell: StatusPill,
    //   },
    {
      Header: 'Action',
      accessor: '',

      Cell: ({ value, row }) => {

        let data = row.original;

        let order = data;


        return <div>


          <Link
            to={`/dashboard/orders_new/${data._id}`}
          >
            <button

              className="border border-gray-500 text-gray-500 bg-transparent
              rounded-md px-4 py-2 
              transition-colors duration-300 ease-in-out hover:bg-gray-500 hover:text-white mr-2 "
              onClick={async () => {
                document.getElementById('viewReceipt').showModal();


              }}>



              <i className="fa-regular fa-eye"></i> View
            </button>
          </Link>

          <select
            className={`cursor-pointer rounded border border-gray-300 px-3 py-2 text-gray-800 ${order.status === "cancelled" &&
              "border-red-300 bg-red-200 text-red-800"
              } ${order.status === "delivered" && "border-green-300 bg-green-200 text-green-800"}`}
            disabled={
              order.status === "cancelled" ||
              order.status === "delivered"
            }
            value={order.status}
            onChange={(e) =>
              handleStatusChange(order._id, e.target.value)
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
              ].includes(order.status)}
              className={
                [
                  "pending",
                  "processing",
                  "shipped",
                  "delivered",
                  "cancelled",
                ].includes(order.status)
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
              ].includes(order.status)}
              className={
                ["processing", "delivered", "cancelled"].includes(
                  order.status,
                )
                  ? "text-gray-400"
                  : ""
              }
            >
              Processing
            </option>
            <option
              value="delivered"
              disabled={["delivered", "cancelled"].includes(
                order.status,
              )}
              className={
                ["delivered", "cancelled"].includes(order.status)
                  ? "text-gray-400"
                  : ""
              }
            >
              Delivered
            </option>
            <option value="cancelled">Cancelled</option>
          </select>

        </div >
      }
    },


  ]


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
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await axiosSecure.put(`/admin/orders/${orderId}/status`, {
        status: newStatus,
      });
      if (res.data.modifiedCount > 0) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId ? { ...order, status: newStatus } : order,
          ),
        );
        toast.success("Order status updated successfully");
      } else {
        toast.error("Failed to update order status");
      }
    } catch (err) {
      console.error("Error updating order status:", err);
      toast.error("Failed to update order status");
    }
  };

  const [activeTab, setActiveTab] = useState("pending");

  const orderStatus = [
    { id: 1, name: "Order 1", status: "pending", },
    { id: 2, name: "Order 2", status: "processing" },
    { id: 3, name: "Order 3", status: "delivered" },
    { id: 4, name: "Order 4", status: "cancelled" },
  ];

  const filteredData = orders.filter((order) => order.status === activeTab);


  console.log({ orders })
  return (
    <section className="product-management">
      {/* Change page title */}
      <Helmet>
        <title>Manage Products - HandiHub Shop</title>
      </Helmet>
      {/* Total products and new product button */}
      <div className="flex flex-wrap items-center justify-between gap-y-2 bg-white px-[4%] py-7 shadow-sm md:px-5">
        <h3 className="flex items-center gap-1 font-semibold sm:text-xl">
          <FaBoxOpen size={32} color="#b88e2f" /> Total Orders:{" "}
          <span>{filteredData.length}</span>
        </h3>

      </div>
      {/* Products list container */}
      <div className="mt-6 divide-y bg-white m-4 ">
        <div className="p-4">
          <div className="flex space-x-4 border-b border-gray-300 mb-4">
            {orderStatus.map((tab) => (
              <button
                key={tab}
                className={`px-4 py-2 font-semibold ${activeTab === tab.status
                  ? "text-blue-500 border-b-2 border-blue-500"
                  : "text-gray-500"
                  }`}
                onClick={() => setActiveTab(tab.status)}
              >
                <span className="capitalize">{tab.status}</span>
              </button>
            ))}
          </div>
          <Table columns={tableColumns} data={filteredData} />

        </div>



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
                await handleApproveRequest(activeMembershipId, 'APPROVED');
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
                await handleApproveRequest(activeMembershipId, 'REJECTED');
              }}
              className={
                'btn mt-2 bg-red-500 text-white font-bold'

              }>
              Reject
            </button>
          </div>
        </div>
      </dialog>
    </section>
  );
};

export default ProductManagement;
