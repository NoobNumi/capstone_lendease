import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import TitleCard from "../../components/Cards/TitleCard";
import PlusCircleIcon from "@heroicons/react/24/outline/PlusCircleIcon";
import Table, { StatusPill } from "../../pages/protected/DataTables/Table";
import { formatAmount } from "./../../features/dashboard/helpers/currencyFormat";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import Dropzone from "react-dropzone";

const TopSideButtons = ({ myLoanList, statusFilter, setStatusFilter }) => (
  <div className="float-right flex items-center gap-2">
    <div className="badge badge-neutral mr-2 px-4 py-1 bg-white text-blue-950">
      Total : {myLoanList.length}
    </div>
    <select
      className="select select-bordered select-sm"
      value={statusFilter}
      onChange={(e) => setStatusFilter(e.target.value)}
    >
      <option value="">All Statuses</option>
      <option value="Overdue">Overdue</option>
      <option value="Due Today">Due Today</option>
      <option value="Due Soon">Due Soon</option>
      <option value="Upcoming">Upcoming</option>
    </select>
  </div>
);

function Collections() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [myLoanList, setLoanList] = useState([]);
  const navigate = useNavigate();
  const [previewSrc, setPreviewSrc] = useState(null);
  const dispatch = useDispatch();
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    if (selectedLoan) {
      const dialog = document.getElementById("acceptCashPaymentDialog");
      if (dialog) dialog.showModal();
    }
  }, [selectedLoan]);

  // Filter loans by status
  const getFilteredLoans = () => {
    if (!statusFilter) return myLoanList;
    return myLoanList.filter((loan) => loan.computed_status === statusFilter);
  };

  const loanList = async () => {
    const res = await axios.post("loan/list", {});
    const list = res.data.data;

    const updatedList = list.map((loan) => {
      const principal = parseFloat(loan.loan_amount);
      const interestRate = parseFloat(loan.interest_rate); // assume 18
      const months = loan.repayment_schedule_id; // assume 6

      const totalInterest = principal * (interestRate / 100);
      const totalToPay = principal + totalInterest;
      const monthlyPayment = totalToPay / months;

      // Payment number based on months since approval
      const approvalDate = dayjs(loan.approval_date);
      const today = dayjs();
      const paymentNumber = today.diff(approvalDate, "month") + 1;

      // Cap at total repayment months
      const cappedPaymentNumber = Math.min(paymentNumber, months);
      const dueDate = approvalDate
        .add(cappedPaymentNumber, "month")
        .format("YYYY-MM-DD");

      const getStatus = () => {
        const daysDiff = dayjs(dueDate).diff(today, "day");
        if (daysDiff < 0) return "Overdue";
        if (daysDiff === 0) return "Due Today";
        if (daysDiff <= 7) return "Due Soon";
        return "Upcoming";
      };

      return {
        ...loan,
        monthly_payment: monthlyPayment.toFixed(2),
        payment_number: cappedPaymentNumber,
        due_date: dueDate,
        computed_status: getStatus(),
      };
    });

    setLoanList(updatedList);
  };

  useEffect(() => {
    loanList();
    setIsLoaded(true);
  }, []);

  const columns = useMemo(
    () => [
      {
        Header: "#",
        accessor: "",
        Cell: ({ row }) => <span>{row.index + 1}</span>,
      },
      {
        Header: "Borrower",
        accessor: "first_name",
        Cell: ({ row }) => {
          const { first_name, last_name } = row.original;
          return (
            <span>
              {first_name} {last_name}
            </span>
          );
        },
      },
      {
        Header: "Amount Due",
        accessor: "monthly_payment",
        Cell: ({ value }) => <span>{formatAmount(value)}</span>,
      },
      {
        Header: "Payment Number",
        accessor: "payment_number",
        Cell: ({ value }) => <span>{value} of 6</span>,
      },
      {
        Header: "Due Date",
        accessor: "due_date",
        Cell: ({ value }) => <span>{dayjs(value).format("MMMM D, YYYY")}</span>,
      },
      {
        Header: "Status",
        accessor: "computed_status",
        Cell: ({ value }) => <StatusPill value={value} />,
      },
      {
        Header: "Action",
        accessor: "",
        Cell: ({ row }) => {
          let loan = row.original;
          return (
            <div className="flex">
              <a href="">
                <button
                  className="btn btn-outline btn-sm"
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedLoan(loan);
                  }}
                >
                  <i class="fa-solid fa-credit-card"></i>
                </button>
              </a>
            </div>
          );
        },
      },
    ],
    []
  );

  const user = useSelector((state) => state.auth?.user);

  return (
    isLoaded && (
      <TitleCard
        title="List"
        topMargin="mt-2"
        TopSideButtons={
          <TopSideButtons
            myLoanList={myLoanList}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
          />
        }
      >
        <div>
          <Table
            style={{ overflow: "wrap" }}
            className="table-sm"
            columns={columns}
            data={getFilteredLoans().map((data) => ({ ...data }))}
            searchField="lastName"
          />
        </div>
        {selectedLoan && (
          <dialog className="modal" id="acceptCashPaymentDialog">
            <form className="modal-box my-2">
              <h3 className="font-bold text-lg mb-5">Current Payment</h3>
              <div className="flex justify-between mb-2">
                <span className="text-md text-slate-600">Payment Number</span>
                <span className="text-md font-semibold text-slate-800">
                  {selectedLoan.payment_number} of{" "}
                  {selectedLoan.repayment_schedule_id}
                </span>
              </div>

              <div className="flex justify-between mb-2">
                <span className="text-md text-slate-600">Due Date</span>
                <span className="text-md font-semibold text-slate-800">
                  {dayjs(selectedLoan.due_date).format("MMMM D, YYYY")}
                </span>
              </div>

              <div className="flex justify-between mb-2">
                <span className="text-md text-slate-600">Status</span>
                <span
                  className={`text-md font-semibold p-2 py-1 rounded-full ${
                    selectedLoan.computed_status === "Upcoming"
                      ? "bg-green-200 text-green-800"
                      : selectedLoan.computed_status === "Overdue"
                      ? "bg-red-200 text-red-800"
                      : selectedLoan.computed_status === "Due Today"
                      ? "bg-orange-200 text-orange-800"
                      : ""
                  }`}
                >
                  {selectedLoan.computed_status}
                </span>
              </div>

              <div className="flex justify-between mb-2">
                <span className="text-md text-slate-600">Collector</span>
                <span className="text-md font-semibold text-slate-800">
                  {selectedLoan.collector_name}
                </span>
              </div>

              <div className="flex justify-between mb-2">
                <span className="text-md text-slate-600">Date Today</span>
                <span className="text-md font-semibold text-slate-800">
                  {dayjs().format("MMMM D, YYYY")}
                </span>
              </div>

              <div className="flex justify-between mb-2">
                <span className="text-md text-slate-600">Principal</span>
                <span className="text-md font-semibold text-slate-800">
                  {formatAmount(selectedLoan.loan_amount)}
                </span>
              </div>

              <div className="flex justify-between mb-2">
                <span className="text-md text-slate-600">Balance</span>
                <span className="text-md font-semibold text-slate-800">
                  {/* You may want to calculate actual remaining balance */}
                  {formatAmount(selectedLoan.loan_amount)}
                </span>
              </div>

              <div className="flex justify-between mb-2">
                <span className="text-md text-slate-600">Interest</span>
                <span className="text-md font-semibold text-slate-800">
                  {formatAmount(
                    (selectedLoan.loan_amount * selectedLoan.interest_rate) /
                      100
                  )}
                </span>
              </div>

              <div className="flex justify-between mb-2">
                <span className="text-md text-slate-600">Amount Due</span>
                <span className="text-md font-semibold text-slate-800">
                  {formatAmount(selectedLoan.monthly_payment)}
                </span>
              </div>
              <div className="w-full mb-4">
                <p className="text-start text-md text-slate-600 mb-2">
                  Photo Proof of Payment
                </p>
                <Dropzone
                  onDrop={(acceptedFiles) => {
                    if (acceptedFiles && acceptedFiles.length > 0) {
                      const file = acceptedFiles[0];
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        setPreviewSrc(e.target.result);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  accept={{ "image/*": [] }}
                  multiple={false}
                >
                  {({ getRootProps, getInputProps, isDragActive, open }) => (
                    <div
                      {...getRootProps({
                        className:
                          `border border-dashed border-gray-400 rounded px-4 py-2 w-full cursor-pointer bg-white max-w-full ` +
                          (isDragActive ? "bg-blue-50" : ""),
                        // Prevent click when preview is shown
                        onClick: previewSrc
                          ? (e) => e.stopPropagation()
                          : undefined,
                      })}
                    >
                      <input {...getInputProps()} name="proofPhoto" />
                      {previewSrc ? (
                        <div className="flex flex-col items-start gap-2 relative">
                          <img
                            src={previewSrc}
                            alt="Preview"
                            className="mt-2 max-h-40 object-contain"
                          />
                          <button
                            type="button"
                            className="text-red-700 text-sm bg-red-100 w-7 h-7 rounded-full absolute top-0 right-0 hover:bg-red-200 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewSrc(null);
                            }}
                          >
                            <i className="fa-solid fa-xmark"></i>
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">
                          {isDragActive
                            ? "Drop the image here ..."
                            : "📷 Click or drag image here to upload"}
                        </span>
                      )}
                    </div>
                  )}
                </Dropzone>
              </div>
              <hr className="my-4 border-t-2 border-gray-200" />
              <div className="flex flex-column md:flex-row items-center justify-between fw-full mb-2">
                <span className="text-lg font-semibold text-slate-600 tracking-wide">
                  TOTAL
                </span>
                <span className="text-xl font-semibold text-slate-800">
                  {formatAmount(selectedLoan.monthly_payment)}
                </span>
              </div>
              <hr className="my-4 border-t-2 border-gray-200" />
              <div className="modal-action">
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    setSelectedLoan(null);
                    setPreviewSrc(null);
                    document.getElementById("acceptCashPaymentDialog").close();
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  onClick={(e) => {
                    e.preventDefault();
                    // Add your logic to upload image and record payment here
                    console.log("Submit payment for", selectedLoan);
                    setSelectedLoan(null);
                    setPreviewSrc(null);
                    document.getElementById("acceptCashPaymentDialog").close();
                  }}
                >
                  Collect Payment
                </button>
              </div>
            </form>
          </dialog>
        )}
      </TitleCard>
    )
  );
}

export default Collections;
