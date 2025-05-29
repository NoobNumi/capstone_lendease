import moment from "moment";
import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import TitleCard from "../../components/Cards/TitleCard";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PlusCircleIcon from "@heroicons/react/24/outline/PlusCircleIcon";
import { Tooltip } from "react-tooltip";
import {
  setAppSettings,
  getFeatureList,
} from "../settings/appSettings/appSettingsSlice";

import Table from "../../pages/protected/DataTables/Table";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as Yup from "yup";

import FormWizard from "react-form-wizard-component";
import "react-form-wizard-component/dist/style.css";

import { useDropzone } from "react-dropzone";
import {
  regions,
  provinces,
  cities,
  barangays,
  provincesByCode,
  regionByCode,
} from "select-philippines-address";

import PersonalInfoForm from "./PersonalInfoForm";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const TopSideButtons = ({
  removeFilter,
  applyFilter,
  applySearch,
  faqList,
}) => {
  const [filterParam, setFilterParam] = useState("");
  const [searchText, setSearchText] = useState("");

  const locationFilters = [""];

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
  return (
    <div className="inline-block float-right">
      <button
        className="btn btn-outline bg-customBlue text-white"
        onClick={() => document.getElementById("addBorrower").showModal()}
      >
        Add
        <PlusCircleIcon className="h-6 w-6 text-white-500" />
      </button>
    </div>
  );
};

function CollectorManagement() {
  // Define file handling logic
  const [files, setFiles] = useState({
    borrowerValidID: null,
    bankStatement: null,
    coMakersValidID: null,
  });

  const onDrop = (acceptedFiles, fieldName) => {
    setFiles((prevFiles) => ({
      ...prevFiles,
      [fieldName]: acceptedFiles[0],
    }));
  };

  const dropzoneProps = (fieldName) => ({
    onDrop: (files) => onDrop(files, fieldName),
    accept: {
      "image/*": [".jpeg", ".png", ".jpg"],
      "application/pdf": [".pdf"],
    },
    multiple: false,
  });

  const [file, setFile] = useState(null);
  const [faqList, setList] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeChildID, setactiveChildID] = useState("");
  const [selectedLoan, setselectedLoan] = useState(null);
  const [isEditModalOpen, setisEditModalOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [myborrowerList, setborrowerList] = useState([]);

  const borrowerList = async () => {
    let res = await axios({
      method: "get",
      url: `admin/collector/list`,
      data: {},
    });
    let list = res.data.data;

    setborrowerList(list);
    console.log("list", setborrowerList(list));
  };

  useEffect(() => {
    borrowerList();
    setIsLoaded(true);
  }, []);

  const appSettings = useSelector((state) => state.appSettings);
  let { codeTypeList, packageList } = appSettings;

  const removeFilter = async () => {
    // No-op for now
  };

  const applyFilter = (params) => {
    let filteredfaqList = faqList.filter((t) => {
      return t.address === params;
    });
    setList(filteredfaqList);
  };

  // Search according to name
  const applySearch = (value) => {
    let filteredUsers = users.filter((t) => {
      return (
        t.email.toLowerCase().includes(value.toLowerCase()) ||
        t.firstName.toLowerCase().includes(value.toLowerCase()) ||
        t.lastName.toLowerCase().includes(value.toLowerCase())
      );
    });
    setList(filteredUsers);
  };

  function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
  }

  let loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
  const columns = useMemo(
    () => [
      {
        Header: "#",
        accessor: "",
        Cell: ({ row }) => {
          return <span className="">{row.index + 1}</span>;
        },
      },

      {
        Header: "Full Name",
        accessor: "name",
        Cell: ({ row, value }) => {
          return <span className="">{value}</span>;
        },
      },
      {
        Header: "email",
        accessor: "email",
        Cell: ({ row, value }) => {
          return <span className="">{value}</span>;
        },
      },

      {
        Header: "Contact Number",
        accessor: "contact_number",
        Cell: ({ row, value }) => {
          return <span className="">{value}</span>;
        },
      },
      {
        Header: "Number Of Borrowers",
        accessor: "no_of_borrowers",
        Cell: ({ row, value }) => {
          return <span className="">{value}</span>;
        },
      },
    ],
    []
  );

  const handleOnChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append("file", file);
      let res = await axios({
        method: "POST",
        url: "user/uploadFile",
        data,
      });

      setIsSubmitting(false);
      fetchFaqList();
      toast.success(`Uploaded Successfully`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    } catch (error) {
      toast.error(`Something went wrong`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    } finally {
      document.getElementById("my_modal_1").close();
    }
  };

  const [currentStep, setCurrentStep] = useState(0);
  const formikConfig = (selectUser) => {
    let PersonalInfoTabValidation = {};

    if (currentStep === 0) {
      PersonalInfoTabValidation = {
        email: Yup.string()
          .email("Invalid email address")
          .required("Email is required"),
        contact_number: Yup.string()
          .matches(/^[0-9]+$/, "Contact number must be digits")
          .required("Contact number is required"),
      };
    }

    return {
      initialValues: {
        email: selectUser?.email || "",
        contact_number: selectUser?.contact_number || "",
      },
      validationSchema: Yup.object({
        ...PersonalInfoTabValidation,
      }),
      onSubmit: async (values, { setFieldError, setSubmitting, resetForm }) => {
        setSubmitting(true);

        try {
          // Only handle Collector role
          if (selectedLoan && selectedLoan.collector_id) {
            let res = await axios({
              method: "put",
              url: `admin/collector/update/${selectedLoan.collector_id}`,
              data: { ...values, role: "Collector" },
            });
            resetForm();
            borrowerList();
            document.getElementById("addBorrower").close();

            setselectedLoan(null);

            toast.success("Successfully Updated!", {
              onClose: () => {},
              position: "top-right",
              autoClose: 500,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "light",
            });
          } else {
            let res = await axios({
              method: "post",
              url: `admin/collector/create`,
              data: { ...values, role: "Collector" },
            });
            resetForm();
            borrowerList();
            document.getElementById("addBorrower").close();

            toast.success("Successfully created!", {
              onClose: () => {},
              position: "top-right",
              autoClose: 500,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "light",
            });
          }
        } catch (error) {
          const errorMessage =
            error?.response?.data?.message || "Something went wrong";

          toast.error(errorMessage, {
            onClose: () => {},
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });
        }
      },
    };
  };

  return (
    <TitleCard
      title="List"
      topMargin="mt-2"
      TopSideButtons={
        <TopSideButtons
          applySearch={applySearch}
          applyFilter={applyFilter}
          removeFilter={removeFilter}
          faqList={faqList}
        />
      }
    >
      <div className="">
        <dialog id="addBorrower" className="modal">
          <div className="modal-box w-11/12 max-w-5xl">
            <form method="dialog">
              <button
                className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                onClick={() => {
                  setselectedLoan(null);
                }}
              >
                ✕
              </button>
            </form>
            <h1
              className="font-bold text-lg  p-4 bg-gradient-to-r from-gray-200 to-gray-300
              z-10 text-blue-950 border bg-white
             rounded-lg"
            >
              New Collector Account
            </h1>
            <p className="text-sm text-gray-500 mt-1 font-bold"></p>
            <div className="p-2 space-y-4 md:space-y-6 sm:p-4">
              <PersonalInfoForm formikConfig={formikConfig} />
            </div>
          </div>
        </dialog>

        <Table
          style={{ overflow: "wrap" }}
          className="table-sm"
          columns={columns}
          data={(myborrowerList || []).map((data) => {
            return {
              ...data,
            };
          })}
          searchField="lastName"
        />
      </div>

      <ToastContainer />
    </TitleCard>
  );
}

export default CollectorManagement;
