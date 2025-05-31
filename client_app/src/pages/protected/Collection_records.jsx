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
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
const TopSideButtons = ({
  myLoanList,
  dateFilter,
  setDateFilter,
  tempDateFilter,
  setTempDateFilter,
  onApply,
}) => {
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setTempDateFilter((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleReset = () => {
    const emptyFilter = { from: "", to: "" };
    setDateFilter(emptyFilter);
    setTempDateFilter(emptyFilter);
    onApply(); // triggers re-render of unfiltered data
  };

  return (
    <div className="float-right flex items-center gap-2">
      <div className="badge badge-neutral mr-2 px-4 py-1 bg-white text-blue-950">
        Total: {myLoanList.length}
      </div>
      <div className="flex items-center gap-1">
        <label className="text-sm text-gray-600">From:</label>
        <input
          type="date"
          name="from"
          className="input input-bordered input-sm"
          value={tempDateFilter.from}
          onChange={handleDateChange}
        />
        <label className="text-sm text-gray-600">To:</label>
        <input
          type="date"
          name="to"
          className="input input-bordered input-sm"
          value={tempDateFilter.to}
          onChange={handleDateChange}
        />
        <button onClick={onApply} className="btn btn-sm btn-primary ml-2">
          Filter
        </button>
        <button onClick={handleReset} className="btn btn-sm btn-outline ml-1">
          Reset
        </button>
      </div>
    </div>
  );
};

function Collection_records() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [myLoanList, setLoanList] = useState([]);
  const navigate = useNavigate();
  const [previewSrc, setPreviewSrc] = useState(null);
  const dispatch = useDispatch();
  const [dateFilter, setDateFilter] = useState({ from: "", to: "" });
  const [tempDateFilter, setTempDateFilter] = useState({ from: "", to: "" });

  const handleApplyFilter = () => {
    setDateFilter(tempDateFilter);
  };

  useEffect(() => {
    if (selectedLoan) {
      const dialog = document.getElementById("acceptCashPaymentDialog");
      if (dialog) dialog.showModal();
    }
  }, [selectedLoan]);

  const getFilteredLoans = () => {
    if (!dateFilter.from || !dateFilter.to) return myLoanList;

    return myLoanList.filter((loan) => {
      const loanDate = dayjs(loan.due_date);
      return (
        loanDate.isSameOrAfter(dayjs(dateFilter.from)) &&
        loanDate.isSameOrBefore(dayjs(dateFilter.to))
      );
    });
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
        Header: "Payment Number",
        accessor: "payment_number",
        Cell: ({ value }) => <span>{value} of 6</span>,
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
        Header: "Amount Paid",
        accessor: "monthly_payment",
        Cell: ({ value }) => <span>{formatAmount(value)}</span>,
      },

      {
        Header: "Date",
        accessor: "due_date",
        Cell: ({ value }) => <span>{dayjs(value).format("MMMM D, YYYY")}</span>,
      },
      {
        Header: "Collected By",
        accessor: "collector_name",
        Cell: ({ value }) => <span>{value}</span>,
      },
      {
        Header: "Receipt",
        accessor: "",
        Cell: ({ row }) => {
          let loan = row.original;
          const handleDownloadReceipt = async () => {
            const { jsPDF } = await import("jspdf");

            // Helper to load logo as base64
            const getBase64ImageFromURL = (url) => {
              return new Promise((resolve, reject) => {
                const img = new window.Image();
                img.setAttribute("crossOrigin", "anonymous");
                img.onload = () => {
                  const canvas = document.createElement("canvas");
                  canvas.width = img.width;
                  canvas.height = img.height;
                  const ctx = canvas.getContext("2d");
                  ctx.drawImage(img, 0, 0);
                  const dataURL = canvas.toDataURL("image/png");
                  resolve(dataURL);
                };
                img.onerror = (error) => reject(error);
                img.src = url;
              });
            };

            const doc = new jsPDF();

            // Add logo
            try {
              const logoData = await getBase64ImageFromURL("/LOGO.jpeg");
              doc.addImage(logoData, "PNG", 90, 10, 30, 30);
            } catch (e) {}

            doc.setFont("helvetica", "normal");
            doc.setFontSize(12);

            let y = 50;

            // Header Info
            doc.text("RAZV LENDING CORPORATION", 105, y, { align: "center" });
            y += 8;
            doc.text(
              "Jose Arcilla Street, Concepcion Virac, Catanduanes",
              105,
              y,
              { align: "center" }
            );
            y += 8;
            doc.text("SEC Registration No: 201706817", 105, y, {
              align: "center",
            });
            y += 8;
            doc.text(
              "Mobile No.: 09984059118 || Landline Phone No.:(052)811-4017",
              105,
              y,
              { align: "center" }
            );

            // Title
            y += 20;
            doc.setFontSize(18);
            doc.text("PAYMENT RECEIPT", 105, y, { align: "center" });
            doc.setFontSize(12);
            y += 10;
            doc.setLineDash([2, 2], 0);
            doc.line(20, y, 190, y);
            doc.setLineDash([]);

            // Payment Info - Fill with actual data
            y += 15;
            doc.setTextColor(149, 151, 164);
            doc.text("Month:", 20, y);
            doc.setTextColor(51, 51, 51);
            doc.text(
              `#${loan.payment_number} of ${loan.repayment_schedule_id || 6}`,
              190,
              y,
              { align: "right" }
            );
            y += 10;
            doc.setTextColor(149, 151, 164);
            doc.text("Reference Number:", 20, y);
            doc.setTextColor(51, 51, 51);
            doc.text("LOAN-mdhs4839", 190, y, { align: "right" });
            y += 10;
            doc.setTextColor(149, 151, 164);
            doc.text("Payment Date:", 20, y);
            doc.setTextColor(51, 51, 51);
            doc.text(
              loan.due_date ? dayjs(loan.due_date).format("MMMM D, YYYY") : "",
              190,
              y,
              { align: "right" }
            );

            // Borrower Info
            y += 15;
            doc.setFontSize(12);
            doc.setTextColor(149, 151, 164);
            doc.text("Borrower:", 20, y);
            doc.setTextColor(51, 51, 51);
            doc.text(
              `${loan.first_name || ""} ${loan.last_name || ""}`,
              190,
              y,
              { align: "right" }
            );
            y += 10;
            doc.setTextColor(149, 151, 164);
            doc.text("Collected By:", 20, y);
            doc.setTextColor(51, 51, 51);
            doc.text(loan.collector_name || "", 190, y, { align: "right" });

            y += 15;
            doc.setTextColor(51, 51, 51);
            doc.setFontSize(16);
            doc.text("Payment Amount:", 20, y);
            doc.setTextColor(23, 37, 84);
            doc.setFont("helvetica", "bold");
            doc.text("PHP " + loan.monthly_payment, 190, y, {
              align: "right",
            });

            // Footer
            y += 20;
            doc.setFontSize(12);
            doc.setLineDash([2, 2], 0);
            doc.line(20, y, 190, y);
            doc.setLineDash([]);
            y += 15;
            doc.setFont("helvetica", "normal");
            doc.setTextColor(51, 51, 51);
            doc.text("Thank you for your payment!", 105, y, {
              align: "center",
            });

            doc.save(
              `receipt_${loan.first_name || ""}_${loan.last_name || ""}_${
                loan.due_date ? dayjs(loan.due_date).format("YYYYMMDD") : ""
              }.pdf`
            );
          };

          return (
            <div className="flex">
              <button
                type="button"
                onClick={handleDownloadReceipt}
                className="btn btn-outline btn-sm"
              >
                <i className="fa-solid fa-download"></i>
              </button>
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
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            tempDateFilter={tempDateFilter}
            setTempDateFilter={setTempDateFilter}
            onApply={handleApplyFilter}
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
      </TitleCard>
    )
  );
}

export default Collection_records;
