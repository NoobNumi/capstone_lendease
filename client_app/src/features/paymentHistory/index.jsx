import React from "react";
import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Table, {
  AvatarCell,
  SelectColumnFilter,
  StatusPill,
  DateCell,
} from "../../pages/protected/DataTables/Table";
import { jsPDF } from "jspdf";
import TitleCard from "../../components/Cards/TitleCard";
import { formatAmount } from "./../../features/dashboard/helpers/currencyFormat";
import { format, parseISO, addMonths } from "date-fns";
function PaymentHistory() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [paymentHistory, setPaymentHistory] = React.useState([]);

  const paymentHistoryList = async () => {
    let response = await axios({
      method: "POST",
      url: "payment_history/list",
      data: {},
    });

    let historyList = response.data.data;

    // Group payments by loan ID
    const grouped = historyList.reduce((acc, payment) => {
      const ref = payment.loan_id;
      if (!acc[ref]) acc[ref] = [];
      acc[ref].push(payment);
      return acc;
    }, {});

    // Sort and assign calculatedMonth
    Object.values(grouped).forEach((group) => {
      group.sort((a, b) => a.payment_id - b.payment_id);
      group.forEach((payment, index) => {
        if (payment.approval_date) {
          const approvalDate = parseISO(payment.approval_date);
          const monthDate = addMonths(approvalDate, index);
          payment.calculatedMonth = format(monthDate, "MMMM yyyy");
        } else {
          payment.calculatedMonth = "N/A";
        }
      });
    });

    setPaymentHistory(historyList);
  };

  useEffect(() => {
    paymentHistoryList();
  }, []);

  const TopSideButtons = ({
    removeFilter,
    applyFilter,
    applySearch,
    paymentHistory,
  }) => {
    const [filterParam, setFilterParam] = useState("");
    const [searchText, setSearchText] = useState("");

    const showFiltersAndApply = (params) => {
      applyFilter(params);
      setFilterParam(params);
    };

    const removeAppliedFilter = () => {
      removeFilter();
      setFilterParam("");
      setSearchText("");
    };

    useEffect(() => {
      if (searchText === "") {
        removeAppliedFilter();
      } else {
        applySearch(searchText);
      }
    }, [searchText]);
    let loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    return (
      <div className="inline-block float-right">
        <div className="badge badge-neutral mr-2 px-4 p-4 bg-white text-blue-950">
          Total : {paymentHistory.length}
        </div>
      </div>
    );
  };

  const columns = useMemo(
    () => [
      {
        Header: "#",
        accessor: "payment_id",
      },
      {
        Header: "Month",
        accessor: "calculatedMonth",
      },
      {
        Header: "Reference Number",
        accessor: "reference_number",
      },
      {
        Header: "Payment Amount",
        accessor: "payment_amount",
        Cell: ({ cell }) => <span>{formatAmount(cell.value)}</span>,
      },
      {
        Header: "Payment Date",
        accessor: "payment_date",
        Cell: ({ cell }) => (
          <span>
            {cell.value ? format(new Date(cell.value), "MMM dd, yyyy") : ""}
          </span>
        ),
      },
      {
        Header: "Action",
        id: "action",
        Cell: ({ row }) => {
          const payment = row.original;

          const handleDownloadReceipt = async () => {
            const doc = new jsPDF();

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

            try {
              const logoData = await getBase64ImageFromURL("/LOGO.jpeg");
              doc.addImage(logoData, "PNG", 90, 10, 30, 30);
            } catch (e) {}

            doc.setFont("helvetica", "normal");
            doc.setFontSize(12);

            const receiptDate = payment.payment_date
              ? format(new Date(payment.payment_date), "MMM dd, yyyy")
              : format(new Date(), "MMM dd, yyyy");
            const refNumber = payment.reference_number || payment.payment_id;

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

            // Payment Info - Aligned like a receipt
            y += 15;
            doc.setTextColor(149, 151, 164);
            doc.text("Month:", 20, y);
            doc.setTextColor(51, 51, 51);
            doc.text(`${payment.calculatedMonth}`, 190, y, { align: "right" });
            y += 10;
            doc.setTextColor(149, 151, 164);
            doc.text("Reference Number:", 20, y);
            doc.setTextColor(51, 51, 51);
            doc.text(`${payment.reference_number}`, 190, y, { align: "right" });
            y += 10;
            doc.setTextColor(149, 151, 164);
            doc.text("Payment Date:", 20, y);
            doc.setTextColor(51, 51, 51);
            doc.text(
              `${
                payment.payment_date
                  ? format(new Date(payment.payment_date), "MMM dd, yyyy")
                  : ""
              }`,
              190,
              y,
              { align: "right" }
            );

            y += 15;
            doc.setTextColor(51, 51, 51);
            doc.setFontSize(16);
            doc.text("Payment Amount:", 20, y);
            doc.setTextColor(23, 37, 84);
            doc.setFont("helvetica", "bold");
            doc.text(`PHP ${payment.payment_amount}`, 190, y, {
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

            doc.save(`receipt_${refNumber}_${payment.calculatedMonth}.pdf`);
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

  return (
    <TitleCard title="List" topMargin="mt-2">
      <div className="">
        <Table
          style={{ overflow: "wrap" }}
          className="table-sm"
          columns={columns}
          data={(paymentHistory || []).map((data) => {
            return {
              ...data,
            };
          })}
          searchField="Search"
        />
      </div>
    </TitleCard>
  );
}

export default PaymentHistory;
