import axios from "axios";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { BsPlus } from "react-icons/bs";
import { FaBoxOpen } from "react-icons/fa";
import { Link } from "react-router-dom";
import { scrollToTop } from "../../../../utils/scrollUtils";
import Pagination from "../../../../components/Pagination/Pagination";
import ProductListAdmin from "../../../../components/ProductListAdmin/ProductListAdmin";

import Table, {
  AvatarCell,
  SelectColumnFilter,
  StatusPill,
  DateCell
} from '../../../../components/DataTables/Table'; // new
import toast from "react-hot-toast";
const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [refetch, setRefetch] = useState(false);
  const [sortValue, setSortValue] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // products pagination start index and end index
  const startIndex = (currentPage - 1) * 5;
  const endIndex = startIndex + 5;

  // previous page button
  const handlePrevClick = () => {
    scrollToTop();
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // next page button
  const handleNextClick = () => {
    scrollToTop();
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // previous and next button disable status
  const prevDisabled = currentPage === 1;
  const nextDisabled = currentPage === totalPages;

  // items to display
  const itemsToDisplay = products.slice(startIndex, endIndex);

  // Products sorting function
  const handleSort = (e) => {
    setSortValue(e.target.value);
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
  const tableColumns = [
    {
      Header: 'ID',
      accessor: '',

      Cell: ({ value }) => {
        return <span className="font-bold text-slate-700">1</span>;
      }
    },
    {
      Header: 'First Name',
      accessor: 'firstName',

      Cell: ({ value }) => {
        return <span className="font-bold text-slate-700">{value}</span>;
      }
    },
    {
      Header: 'Last Name',
      accessor: 'lastName',

      Cell: ({ value }) => {
        return <span className="font-bold text-slate-700">{value}</span>;
      }
    },
    {
      Header: 'Address',
      accessor: 'streetAddress',

      Cell: ({ value, row }) => {




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
      Header: 'Date Signed',
      accessor: 'signDate',

      Cell: ({ value }) => {
        return <span className="font-bold text-slate-700">{value}</span>;
      }
    },
    {
      Header: 'Status',
      accessor: 'status',
      Cell: StatusPill,
    },
    {
      Header: 'Action',
      accessor: '',

      Cell: ({ value, row }) => {

        let data = row.original;

        console.log(data)

        return <div>


          <Link
            to={`/dashboard/membership/${data._id}`}
          >
            <button

              className="border border-blue-500 text-blue-500 bg-transparent
          rounded-md px-4 py-2 
          transition-colors duration-300 ease-in-out hover:bg-blue-500 hover:text-white mr-2 "
              onClick={async () => {
                document.getElementById('viewReceipt').showModal();


              }}>



              <i className="fa-regular fa-eye"></i> View
            </button>
          </Link>

          {
            !data.status && <button
              className="border border-green-500 text-green-500 bg-transparent
             rounded-md px-4 py-2 
             transition-colors duration-300 ease-in-out hover:bg-green-500 hover:text-white"
              onClick={async () => {
                setactiveMembershipId(data._id);
                document.getElementById('approveModal').showModal();

              }}>



              <i className="fa-regular fa-eye"></i> Approve
            </button>
          }

          {
            !data.status && <button
              className="ml-2 border border-red-500 text-red-500 bg-transparent
  rounded-md px-4 py-2 
  transition-colors duration-300 ease-in-out hover:bg-red-500 hover:text-white"
              onClick={async () => {
                setactiveMembershipId(data._id);
                document.getElementById('rejectModal').showModal();

              }}>



              <i className="fa-regular fa-eye"></i> Reject
            </button>
          }

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
  return (
    <section className="product-management">
      {/* Change page title */}
      <Helmet>
        <title>Manage Products - HandiHub Shop</title>
      </Helmet>
      {/* Total products and new product button */}
      <div className="flex flex-wrap items-center justify-between gap-y-2 bg-white px-[4%] py-7 shadow-sm md:px-5">
        <h3 className="flex items-center gap-1 font-semibold sm:text-xl">
          <FaBoxOpen size={32} color="#b88e2f" /> Total Members:{" "}
          <span>{memeberList.length}</span>
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
      <div className="mt-6 divide-y bg-white m-4 ">
        <div className="p-4">

          <Table columns={tableColumns} data={memeberList} />
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
