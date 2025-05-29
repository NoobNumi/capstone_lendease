import axios from "axios";
import { useEffect, useState, useMemo } from "react";
import Table, { StatusPill } from "../../pages/protected/DataTables/Table";
import TitleCard from "../../components/Cards/TitleCard";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../firebase";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  regions,
  provincesByCode,
  provinces,
  cities,
  barangays,
} from "select-philippines-address";
import * as yup from "yup";

function DetailedBorrowerAccounts() {
  const [borrowers, setBorrowers] = useState([]);
  const [collectors, setCollectors] = useState([]);
  const [addressRegions, setRegions] = useState([]);
  const [addressProvince, setProvince] = useState([]);
  const [addressCity, setCity] = useState([]);
  const [addressBarangay, setBarangay] = useState([]);

  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedBarangay, setSelectedBarangay] = useState("");

  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const [nationality, setNationality] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [birthplace, setBirthplace] = useState("");
  const [residenceType, setResidenceType] = useState("");
  const [validId, setValidId] = useState(null);
  const [incomeProof, setIncomeProof] = useState(null);

  useEffect(() => {
    regions().then((res) => {
      const formatted = res.map((region) => ({
        value: region.region_code,
        label: region.region_name,
      }));
      setRegions(formatted);
    });
  }, []);

  const handleRegionChange = async (e) => {
    const code = e.target.value;
    setSelectedRegion(code);
    setSelectedProvince("");
    setSelectedCity("");
    setSelectedBarangay("");
    const provinces = await provincesByCode(code);
    setProvince(
      provinces.map((p) => ({
        value: p.province_code,
        label: p.province_name,
      }))
    );
    setCity([]);
    setBarangay([]);
  };

  const handleProvinceChange = async (e) => {
    const code = e.target.value;
    setSelectedProvince(code);
    setSelectedCity("");
    setSelectedBarangay("");
    const citiesList = await cities(code);
    setCity(
      citiesList.map((c) => ({
        value: c.city_code,
        label: c.city_name,
      }))
    );
    setBarangay([]);
  };

  const handleCityChange = async (e) => {
    const code = e.target.value;
    setSelectedCity(code);
    setSelectedBarangay("");
    const barangaysList = await barangays(code);
    setBarangay(
      barangaysList.map((b) => ({
        value: b.brgy_code,
        label: b.brgy_name,
      }))
    );
  };

  const handleBarangayChange = (e) => {
    setSelectedBarangay(e.target.value);
  };

  const TopSideButtons = () => {
    return (
      <div className="inline-block float-right">
        <div className="badge badge-neutral mr-2 px-4 p-4 bg-white text-blue-950">
          Total : {borrowers.length}
        </div>
        <button
          className="btn btn-outline bg-blue-950 text-white"
          onClick={() =>
            document.getElementById("addBorrowerModal").showModal()
          }
        >
          Add
          <PlusCircleIcon className="h-6 w-6 text-white-500" />
        </button>
      </div>
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/admin/borrower/all-borrowers");
        setBorrowers(response.data.data);
        console.log("Borrowers data fetched successfully:", response.data.data);
      } catch (error) {
        console.error("Error fetching borrower account data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchCollectors = async () => {
      try {
        const response = await axios.get("/admin/borrower/collectors");
        setCollectors(response.data.data);
        console.log(
          "Collectors data fetched successfully:",
          response.data.data
        );
      } catch (error) {
        console.error("Error fetching collectors data:", error);
      }
    };
    fetchCollectors();
  }, []);

  const [regionMap, setRegionMap] = useState({});
  const [provinceMap, setProvinceMap] = useState({});
  const [cityMap, setCityMap] = useState({});
  const [barangayMap, setBarangayMap] = useState({});

  useEffect(() => {
    async function loadLookups() {
      const regionsList = await regions();

      // Set Region Map
      const regionMapObj = Object.fromEntries(
        regionsList.map((r) => [r.region_code, r.region_name])
      );
      setRegionMap(regionMapObj);

      const uniqueRegionCodes = [
        ...new Set(borrowers.map((b) => b.address_region)),
      ];

      const provinceMapObj = {};
      const cityMapObj = {};
      const barangayMapObj = {};

      for (const regionCode of uniqueRegionCodes) {
        const provs = await provinces(regionCode);

        provs.forEach((p) => {
          provinceMapObj[p.province_code] = p.province_name;
        });

        for (const prov of provs) {
          const cits = await cities(prov.province_code);

          cits.forEach((c) => {
            cityMapObj[c.city_code.trim()] = c.city_name;
          });

          for (const city of cits) {
            const brgys = await barangays(city.city_code);

            brgys.forEach((b) => {
              barangayMapObj[b.brgy_code.trim()] = b.brgy_name;
            });
          }
        }
      }

      setProvinceMap(provinceMapObj);
      setCityMap(cityMapObj);
      setBarangayMap(barangayMapObj);
    }

    if (borrowers.length > 0) {
      loadLookups();
    }
  }, [borrowers]);

  const [selectedBorrower, setSelectedBorrower] = useState(null);

  // Modal Step Logic
  let currentStep = 1;
  let isSubmitting = false;
  let validationErrors = {};

  const nextBtn = document.getElementById("nextBtn");
  const submitBtn = document.getElementById("submitBtn");

  function updateStepUI() {
    document.getElementById("step1").style.display =
      currentStep === 1 ? "block" : "none";
    document.getElementById("step2").style.display =
      currentStep === 2 ? "block" : "none";

    document
      .getElementById("stepIndicator1")
      .classList.toggle("step-primary", currentStep >= 1);
    document
      .getElementById("stepIndicator2")
      .classList.toggle("step-primary", currentStep >= 2);

    document.getElementById("prevBtn").style.visibility =
      currentStep > 1 ? "visible" : "hidden";

    if (currentStep === 2) {
      nextBtn.style.display = "none";
      submitBtn.style.display = "inline-block";
      submitBtn.disabled = isSubmitting;
      submitBtn.innerHTML = isSubmitting
        ? '<div class="flex gap-2 items-center"><span class="loading loading-spinner"></span> <span>Submitting...</span></div>'
        : "Submit";
    } else {
      nextBtn.style.display = "inline-block";
      nextBtn.disabled = false;
      nextBtn.textContent = "Next";
      submitBtn.style.display = "none";
    }
  }

  async function uploadFileToFirebase(file, fieldName) {
    const fileRef = ref(storage, `${fieldName}/${Date.now()}-${file.name}`);
    try {
      const snapshot = await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log(`Uploaded ${fieldName}:`, downloadURL);
      return downloadURL;
    } catch (err) {
      console.error(`Upload failed for ${fieldName}`, err);
      throw err;
    }
  }

  function getStepSchema(currentStep, employmentType) {
    switch (currentStep) {
      case 1: {
        const baseSchema = {
          employment_type: yup.string().required("Required"),
        };

        if (employmentType === "Employed") {
          return yup.object().shape({
            ...baseSchema,
            monthly_income_employed: yup.string().trim().required("Required"),
            atm_card_number_employed: yup.string().trim().required("Required"),
            account_number_employed: yup.string().trim().required("Required"),
            position: yup.string().required("Required"),
            company_name: yup.string().required("Required"),
            work_type: yup.string().required("Required"),
            job_status: yup.string().required("Required"),
            employment_year: yup.string().required("Required"),
            school_address: yup.string().notRequired(),
          });
        }

        if (employmentType === "Nonemployed") {
          return yup.object().shape({
            ...baseSchema,
            monthly_income_nonemployed: yup
              .string()
              .trim()
              .required("Required"),
            atm_card_number_nonemployed: yup
              .string()
              .trim()
              .required("Required"),
            account_number_nonemployed: yup
              .string()
              .trim()
              .required("Required"),
            income_source: yup.string().required("Required"),
            business_type: yup.string().required("Required"),
            business_name: yup.string().required("Required"),
            business_address: yup.string().required("Required"),
            income_proof: yup
              .mixed()
              .required("Required")
              .test(
                "fileType",
                "Proof of income is required",
                (value) => value && value.type === "application/pdf"
              ),
            pensioner: yup.string().required("Required"),
            monthly_pension: yup.string().required("Required"),
          });
        }

        return yup.object().shape(baseSchema);
      }

      case 2:
        return yup.object().shape({
          first_name: yup.string().required("Required"),
          last_name: yup.string().required("Required"),
          middle_name: yup.string().required("Required"),
          contact_number: yup.string().required("Required"),
          email: yup.string().email("Invalid email").required("Required"),
          gender: yup.string().required("Required"),
          date_of_birth: yup.string().required("Required"),
          nationality: yup.string().required("Required"),
          address_region: yup.string().required("Required"),
          address_province: yup.string().required("Required"),
          address_city: yup.string().required("Required"),
          address_barangay: yup.string().required("Required"),
          zip_code: yup.string().required("Required"),
          valid_id: yup
            .mixed()
            .required("Required")
            .test(
              "fileType",
              "Valid ID is required",
              (value) => value && value.type === "application/pdf"
            ),
          birth_place: yup.string().required("Required"),
          residence_type: yup.string().required("Required"),
        });

      default:
        return yup.object();
    }
  }

  function renderValidationErrors() {
    Object.keys(validationErrors).forEach((field) => {
      let inputs = [];
      if (
        ["monthly_income", "atm_card_number", "account_number"].includes(field)
      ) {
        const employmentType =
          document.querySelector('[name="employment_type"]:checked')?.value ||
          document.querySelector('[name="employment_type"]')?.value;

        const inputId = `${field}_${employmentType?.toLowerCase()}`;
        const el = document.getElementById(inputId);
        if (el) inputs = [el];
      }

      if (!inputs.length) {
        inputs = document.querySelectorAll(`[name="${field}"]`);
      }

      if (!inputs.length) return;

      // Add red border to all affected inputs
      inputs.forEach((input) => {
        input.classList.add("border", "border-red-600");
      });

      const firstInput = inputs[0];
      const isRadioGroup = firstInput.type === "radio" && inputs.length > 1;

      if (isRadioGroup) {
        const groupContainer =
          firstInput.closest(".flex.flex-col") ||
          firstInput.closest(".form-control");

        const existingError = groupContainer.querySelector(".error-msg");
        if (existingError) existingError.remove();

        const errorEl = document.createElement("p");
        errorEl.textContent = validationErrors[field];
        errorEl.className = "text-red-500 text-sm mt-2 error-msg";
        groupContainer.appendChild(errorEl);

        inputs.forEach((input) => {
          const listener = function handleRadioChange() {
            const errMsg = groupContainer.querySelector(".error-msg");
            if (errMsg) errMsg.remove();
            delete validationErrors[field];

            // Remove red border from all radios in the group
            inputs.forEach((el) => {
              el.classList.remove("border", "border-red-600");
              el.removeEventListener("change", handleRadioChange);
            });
          };
          input.addEventListener("change", listener);
        });

        return;
      }

      const existingError = firstInput.nextElementSibling;
      if (existingError?.classList.contains("error-msg")) {
        existingError.remove();
      }

      const errorEl = document.createElement("p");
      errorEl.textContent = validationErrors[field];
      errorEl.className = "text-red-500 text-sm mt-2 error-msg";
      firstInput.insertAdjacentElement("afterend", errorEl);

      const listener = function handleInput() {
        if (firstInput.value.trim() !== "") {
          const errMsg = firstInput.nextElementSibling;
          if (errMsg?.classList.contains("error-msg")) {
            errMsg.remove();
          }
          delete validationErrors[field];
          firstInput.classList.remove("border", "border-red-600");
          firstInput.removeEventListener("input", handleInput);
        }
      };

      firstInput.addEventListener("input", listener);
    });
  }

  async function handleStepChange(direction) {
    const form = document.querySelector("#addBorrowerModal form");
    const formData = new FormData(form);
    const employmentType = formData.get("employment_type");
    const stepData = {};
    formData.forEach((value, key) => {
      stepData[key] = value;
    });

    const clearErrors = () => {
      validationErrors = {};
      document.querySelectorAll(".error-msg").forEach((el) => el.remove());
    };

    if (direction === "next") {
      const stepSchema = getStepSchema(currentStep, employmentType);
      try {
        await stepSchema.validate(stepData, { abortEarly: false });
        clearErrors();
        if (currentStep < 2) {
          currentStep++;
          updateStepUI();
        }
      } catch (err) {
        clearErrors();
        if (Array.isArray(err.inner)) {
          err.inner.forEach((e) => {
            validationErrors[e.path] = e.message;
          });
          renderValidationErrors();
        } else {
          console.error("Validation error format is unexpected", err);
        }
      }
      return;
    }

    if (direction === "submit") {
      const stepSchema = getStepSchema(2, employmentType);
      try {
        await stepSchema.validate(stepData, { abortEarly: false });
        clearErrors();
      } catch (err) {
        clearErrors();
        if (Array.isArray(err.inner)) {
          err.inner.forEach((e) => {
            validationErrors[e.path] = e.message;
          });
          renderValidationErrors();
          return;
        } else {
          console.error("Validation error format is unexpected", err);
          return;
        }
      }

      isSubmitting = true;
      currentStep = 2;
      updateStepUI();

      const formObject = { employment_type: employmentType };
      const allowedFields =
        employmentType === "Employed"
          ? [
              "employment_type",
              "first_name",
              "middle_name",
              "last_name",
              "contact_number",
              "email",
              "gender",
              "nationality",
              "address_region",
              "address_province",
              "address_city",
              "address_barangay",
              "zip_code",
              "date_of_birth",
              "birth_place",
              "residence_type",
              "position",
              "company_name",
              "work_type",
              "job_status",
              "monthly_income_employed",
              "employment_year",
              "atm_card_number_employed",
              "account_number_employed",
              "school_address",
              "collector_id",
            ]
          : [
              "employment_type",
              "first_name",
              "middle_name",
              "last_name",
              "contact_number",
              "email",
              "gender",
              "nationality",
              "address_region",
              "address_province",
              "address_city",
              "address_barangay",
              "zip_code",
              "date_of_birth",
              "birth_place",
              "residence_type",
              "income_source",
              "monthly_income_nonemployed",
              "business_type",
              "business_name",
              "business_address",
              "pensioner",
              "monthly_pension",
              "atm_card_number_nonemployed",
              "account_number_nonemployed",
              "collector_id",
            ];

      for (const [name, value] of formData.entries()) {
        if (!allowedFields.includes(name)) continue;
        if (value === undefined || value === null || value === "") continue;
        formObject[name] = value;
      }

      try {
        const uploads = [];
        const validId = formData.get("valid_id");
        const incomeProof = formData.get("income_proof");

        if (validId) uploads.push(uploadFileToFirebase(validId, "valid_id"));
        else uploads.push(Promise.resolve(null));

        if (employmentType === "Nonemployed" && incomeProof) {
          uploads.push(uploadFileToFirebase(incomeProof, "income_proof"));
        } else uploads.push(Promise.resolve(null));

        const [uploadedValidId, uploadedIncomeProof] = await Promise.all(
          uploads
        );

        if (uploadedValidId) formObject["valid_id"] = uploadedValidId;
        if (uploadedIncomeProof)
          formObject["income_proof"] = uploadedIncomeProof;

        Object.keys(formObject).forEach((key) => {
          if (formObject[key] === undefined) {
            formObject[key] = null;
          }
        });

        const response = await axios.post(
          "/borrower/submit-detailed-form",
          formObject,
          { headers: { "Content-Type": "application/json" } }
        );

        await axios.post("/auth/send-verification-email", {
          email: formObject.email,
        });

        if (response.status === 200 || response.status === 201) {
          setTimeout(async () => {
            document.getElementById("addBorrowerModal").close();
            form.reset();
            currentStep = 1;
            updateStepUI();
            toast.success("Account added successfully!", {
              position: "top-right",
              autoClose: 2000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "light",
            });

            try {
              const updatedData = await axios.get("/admin/borrower/list");
              setBorrowers(updatedData.data.data);
            } catch (fetchError) {
              console.error("Failed to refresh borrower list:", fetchError);
            }

            isSubmitting = false;
            updateStepUI();
          }, 2000);
        } else {
          toast.error(
            "Something went wrong with creating the account. Please try again.",
            {
              position: "top-right",
              autoClose: 2000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "light",
            }
          );
          isSubmitting = false;
          updateStepUI();
        }
      } catch (error) {
        console.error("Submission error:", error);
        toast.error("An error occurred while submitting the form.", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
        isSubmitting = false;
        updateStepUI();
      }
      return;
    }

    if (direction === "prev" && currentStep > 1) {
      currentStep--;
      updateStepUI();
    }
  }

  document.addEventListener("DOMContentLoaded", updateStepUI);

  // assign collector to borrower
  const handleAssignCollector = async (e) => {
    e.preventDefault();

    const form = e.target;
    const collector_id = form.collector_id.value;
    const borrower_id = selectedBorrower?.borrower_id;

    // Yup validation schema
    const schema = yup.object().shape({
      collector_id: yup.string().required("Please select a collector."),
      borrower_id: yup.string().required("No borrower selected."),
    });

    try {
      await schema.validate({ collector_id, borrower_id });

      await axios.post("/borrower/assign-borrower-to-collector", {
        borrower_id,
        collector_id,
      });

      toast.success("Borrower assigned successfully", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      document.getElementById("assignCollectorModal").close();

      // Refresh table data after assignment
      try {
        const updatedData = await axios.get("/admin/borrower/all-borrowers");
        setBorrowers(updatedData.data.data);
      } catch (fetchError) {
        console.error("Failed to refresh borrower list:", fetchError);
      }
    } catch (err) {
      if (err.name === "ValidationError") {
        toast.error(err.message, {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      } else {
        console.error("Error assigning collector:", err);
        toast.error("Failed to assign collector. Please try again.", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      }
    }
  };

  // Table Columns

  const columns = useMemo(
    () => [
      {
        Header: "#",
        accessor: "",
        Cell: ({ row }) => <span>{row.index + 1}</span>,
      },
      {
        Header: "First Name",
        accessor: "first_name",
      },
      {
        Header: "Middle Name",
        accessor: "middle_name",
      },
      {
        Header: "Last Name",
        accessor: "last_name",
      },
      {
        Header: "Gender",
        accessor: "gender",
        Cell: ({ value }) => <StatusPill value={value} />,
      },
      {
        Header: "Complete Address",
        accessor: "address_region",
        Cell: ({ row }) => {
          const {
            address_region,
            address_province,
            address_city,
            address_barangay,
            zip_code,
          } = row.original;

          const region = regionMap[address_region];
          const province = provinceMap[address_province];
          const city = cityMap[address_city];
          const barangay = barangayMap[address_barangay];

          return (
            <span className="text-wrap">
              {barangay && city && province && region
                ? [
                    barangay ? `Brgy. ${barangay}` : null,
                    city,
                    province,
                    region,
                    zip_code,
                  ]
                    .filter(Boolean)
                    .join(", ")
                : "Loading..."}
            </span>
          );
        },
      },
      {
        Header: "Nationality",
        accessor: "nationality",
      },
      {
        Header: "Birthdate",
        accessor: "date_of_birth",
        Cell: ({ value }) => {
          const date = new Date(value);
          return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });
        },
      },
      {
        Header: "Birthplace",
        accessor: "birth_place",
      },
      {
        Header: "Civil Status",
        accessor: "civil_status",
      },
      {
        Header: "Contact Number",
        accessor: "contact_number",
      },
      {
        Header: "Email",
        accessor: "email",
      },
      {
        Header: "Employment Type",
        accessor: "employment_type",
        Cell: ({ value }) => (
          <StatusPill
            value={value}
            className={
              "text-white " + (value === "Employed" ? "bg-green" : "bg-red")
            }
          >
            {value}
          </StatusPill>
        ),
      },
      {
        Header: "Residence Type",
        accessor: "residence_type",
      },
      {
        Header: "Assigned to a collector",
        accessor: "is_assigned_to_a_collector",
        Cell: ({ value }) => (
          <span
            className={
              value === "yes"
                ? "bg-green-200 px-3 py-1 rounded-xl text-green-700 font-medium"
                : "bg-red-200 px-3 py-1 rounded-xl text-red-700 font-medium"
            }
          >
            {value ? value.toUpperCase() : "Yes"}
          </span>
        ),
      },
      {
        Header: "Action",
        accessor: "",
        Cell: ({ row }) => {
          return (
            <div className="flex">
              <button
                className="btn btn-outline btn-sm"
                title="View Borrower's Details"
                onClick={() => {
                  setSelectedBorrower(row.original);
                  document.getElementById("viewDetailsModal").showModal();
                }}
              >
                <i className="fa-solid fa-eye"></i>
              </button>
              {row.original.is_assigned_to_a_collector !== "yes" && (
                <button
                  className="btn btn-outline btn-sm ml-2"
                  title="Assign Collector"
                  onClick={() => {
                    document.getElementById("assignCollectorModal").showModal();
                    setSelectedBorrower(row.original);
                  }}
                >
                  <i className="fa-solid fa-user-tag"></i>
                </button>
              )}
            </div>
          );
        },
      },
    ],
    [regionMap, provinceMap, cityMap, barangayMap]
  );

  return (
    <div>
      {/* Header */}
      <TitleCard
        title="List"
        topMargin="mt-2"
        TopSideButtons={<TopSideButtons />}
      >
        <div className="">
          {/* Table */}
          <Table
            columns={columns}
            data={borrowers || []}
            searchField="last_name, first_name"
          />
        </div>
        <ToastContainer />
      </TitleCard>
      {/* View Modal */}
      <dialog id="viewDetailsModal" className="modal">
        <form method="dialog" className="modal-box">
          <h3 className="font-bold text-lg">Borrower Details</h3>
          {selectedBorrower && (
            <div>
              <p>
                <strong>Name:</strong> {selectedBorrower.first_name}{" "}
                {selectedBorrower.middle_name} {selectedBorrower.last_name}
              </p>
              <p>
                <strong>Gender:</strong> {selectedBorrower.gender}
              </p>
              <p>
                <strong>Address:</strong>{" "}
                {[
                  selectedBorrower.address_barangay
                    ? `Brgy. ${barangayMap[selectedBorrower.address_barangay]}`
                    : null,
                  cityMap[selectedBorrower.address_city],
                  provinceMap[selectedBorrower.address_province],
                  regionMap[selectedBorrower.address_region],
                  selectedBorrower.zip_code,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </p>
              <p>
                <strong>Contact:</strong> {selectedBorrower.contact_number}
              </p>
              <p>
                <strong>Email:</strong> {selectedBorrower.email}
              </p>
              <p>
                <strong>Employment Type:</strong>{" "}
                {selectedBorrower.employment_type}
              </p>
            </div>
          )}
          <div className="modal-action">
            <button className="btn">Close</button>
          </div>
        </form>
      </dialog>

      {/* Add Modal */}
      <dialog id="addBorrowerModal" className="modal w-full ">
        <form method="dialog" className="modal-box w-11/12 max-w-5xl relative">
          <div className="flex">
            <h3 className="font-bold text-lg">Add Borrower</h3>
            <button
              type="button"
              className="btn btn-sm btn-circle btn-ghost fixed right-2 top-2"
              onClick={() =>
                document.getElementById("addBorrowerModal").close()
              }
            >
              ✕
            </button>
          </div>
          {/* Steps */}
          <div className="steps mb-4 w-full">
            <div className="step step-primary" id="stepIndicator1">
              Employment Type
            </div>
            <div className="step" id="stepIndicator2">
              Personal Details
            </div>
          </div>

          {/* Step 1 */}
          <div id="step1">
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">Employment Type</span>
              </label>
              <select
                id="employmentType"
                className="select select-bordered"
                name="employment_type"
                required
                onChange={(e) => {
                  const selectedEmployment = e.target.value;
                  document.getElementById("employedFields").style.display =
                    selectedEmployment === "Employed" ? "block" : "none";
                  document.getElementById("nonEmployedFields").style.display =
                    selectedEmployment === "Nonemployed" ? "block" : "none";
                }}
              >
                <option selected disabled>
                  Select Employment Type
                </option>
                <option value="Employed">Employed</option>
                <option value="Nonemployed">Nonemployed</option>
              </select>
            </div>

            {/* Employed Fields */}
            <div id="employedFields" style={{ display: "none" }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Position</span>
                  </label>
                  <input
                    type="text"
                    name="position"
                    required
                    className="input input-bordered"
                    placeholder="Enter Position"
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Company Name</span>
                  </label>
                  <input
                    type="text"
                    required
                    name="company_name"
                    className="input input-bordered"
                    placeholder="Enter Company Name"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control mt-3">
                  <label className="label">
                    <span className="label-text">Work Type</span>
                  </label>

                  <div className="flex flex-col gap-2">
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="work_type"
                          value="Government"
                          className="radio radio-primary"
                        />
                        <span className="ml-2">Government</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="work_type"
                          value="Private"
                          className="radio radio-primary"
                        />
                        <span className="ml-2">Private</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Job Status</span>
                  </label>
                  <select
                    name="job_status"
                    required
                    className="select select-bordered w-full"
                  >
                    <option selected disabled>
                      Select Job Status
                    </option>
                    <option value="Contractual">Contractual</option>
                    <option value="Casual">Casual</option>
                    <option value="Probationary">Probationary</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Project-Based">Project-Based</option>
                    <option value="Consultant">Consultant</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Monthly Income</span>
                  </label>
                  <input
                    type="number"
                    required
                    name="monthly_income_employed"
                    id="monthly_income_employed"
                    className="input input-bordered"
                    placeholder="Enter Monthly Income"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    min={0}
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Employment Year/s</span>
                  </label>
                  <input
                    type="number"
                    required
                    name="employment_year"
                    className="input input-bordered"
                    placeholder="Enter Employment Years"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    min={0}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">ATM Card Number</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    required
                    id="atm_card_number_employed"
                    name="atm_card_number_employed"
                    placeholder="Enter ATM Card Number"
                    inputMode="numeric"
                    pattern="\d*"
                    maxLength={19} // Includes spaces if formatting
                    onInput={(e) => {
                      e.target.value = e.target.value
                        .replace(/\D/g, "") // Remove non-digits
                        .replace(/(.{4})/g, "$1 "); // Add space every 4 digits
                      // Remove trailing space
                    }}
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Account Number</span>
                  </label>
                  <input
                    type="number"
                    required
                    id="account_number_employed"
                    name="account_number_employed"
                    className="input input-bordered"
                    placeholder="Account Number"
                  />
                </div>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Assigned Collector</span>
                </label>
                <select
                  name="collector_id"
                  required
                  className="select select-bordered w-full"
                >
                  <option selected disabled>
                    Select Collector
                  </option>
                  {collectors.map((collector) => (
                    <option
                      key={collector.collector_id}
                      value={collector.collector_id}
                    >
                      {collector.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Work Address</span>
                </label>
                <textarea
                  name="school_address"
                  className="textarea input-bordered"
                  placeholder="Enter Work Address"
                />
              </div>
            </div>

            {/* Nonemployed Fields */}
            <div id="nonEmployedFields" style={{ display: "none" }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Source of Income</span>
                  </label>
                  <select
                    className="select select-bordered"
                    required
                    name="income_source"
                  >
                    <option selected disabled>
                      Select source of income
                    </option>
                    <option value="Business">Business</option>
                    <option value="Self-Employed">Self-Employed</option>
                    <option value="Unemployed">Unemployed</option>
                    <option value="Pensioner">Pensioner</option>
                  </select>
                </div>
                {/* Proof of Income */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Proof of Income</span>
                  </label>
                  <input
                    type="file"
                    required
                    className="file-input file-input-bordered"
                    accept="application/pdf"
                    name="income_proof"
                    onChange={(e) => setIncomeProof(e.target.files[0])}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Monthly Income</span>
                  </label>
                  <input
                    type="number"
                    required
                    name="monthly_income_nonemployed"
                    id="monthly_income_nonemployed"
                    className="input input-bordered"
                    placeholder="Enter Monthly Income"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    min={0}
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Business Type</span>
                  </label>
                  <input
                    type="text"
                    name="business_type"
                    required
                    className="input input-bordered"
                    placeholder="Enter Business Type"
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Business Name</span>
                  </label>
                  <input
                    type="text"
                    name="business_name"
                    required
                    className="input input-bordered"
                    placeholder="Enter Business Name"
                  />
                </div>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Business Address</span>
                </label>
                <textarea
                  type="text"
                  name="business_address"
                  required
                  className="textarea input-bordered"
                  placeholder="Enter Business Address"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Pensioner</span>
                  </label>
                  <select
                    required
                    className="select select-bordered"
                    name="pensioner"
                  >
                    <option selected disabled>
                      Select Pensioner
                    </option>
                    <option value="GSIS">GSIS</option>
                    <option value="SSS">SSS</option>
                  </select>
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Monthly Pension</span>
                  </label>
                  <input
                    type="number"
                    name="monthly_pension"
                    required
                    className="input input-bordered"
                    placeholder="Enter Monthly Pension"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    min={0}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">ATM Card Number</span>
                  </label>
                  <input
                    type="text"
                    name="atm_card_number_nonemployed"
                    required
                    id="atm_card_number_nonemployed"
                    className="input input-bordered"
                    placeholder="Enter ATM Card Number"
                    inputMode="numeric"
                    pattern="\d*"
                    maxLength={19} // Includes spaces if formatting
                    onInput={(e) => {
                      e.target.value = e.target.value
                        .replace(/\D/g, "") // Remove non-digits
                        .replace(/(.{4})/g, "$1 ") // Add space every 4 digits
                        .trim(); // Remove trailing space
                    }}
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Account Number</span>
                  </label>
                  <input
                    type="number"
                    required
                    id="account_number_nonemployed"
                    name="account_number_nonemployed"
                    className="input input-bordered"
                    placeholder="Account Number"
                  />
                </div>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Assigned Collector</span>
                </label>
                <select
                  name="collector"
                  required
                  className="select select-bordered w-full"
                >
                  <option selected disabled>
                    Select Collector
                  </option>
                  {collectors.map((collector) => (
                    <option key={collector._id} value={collector._id}>
                      {collector.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div id="step2" style={{ display: "none" }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">First Name</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  placeholder="First Name"
                  name="first_name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Middle Name</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  placeholder="Middle Name"
                  name="middle_name"
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Last Name</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  placeholder="Last Name"
                  name="last_name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Contact Number</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  placeholder="Contact Number"
                  name="contact_number"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  type="email"
                  className="input input-bordered"
                  placeholder="Email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Gender</span>
                </label>
                <select
                  className="select select-bordered"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  name="gender"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Nationality</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  placeholder="Enter Nationality"
                  value={nationality}
                  name="nationality"
                  onChange={(e) => setNationality(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Region */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Region</span>
                </label>
                <select
                  className="select select-bordered"
                  value={selectedRegion}
                  onChange={handleRegionChange}
                  name="address_region"
                >
                  <option selected disabled>
                    Select Region
                  </option>
                  {addressRegions.map((region) => (
                    <option key={region.value} value={region.value}>
                      {region.label}
                    </option>
                  ))}
                </select>
              </div>
              {/* Province */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Province</span>
                </label>
                <select
                  className="select select-bordered"
                  value={selectedProvince}
                  onChange={handleProvinceChange}
                  disabled={!selectedRegion}
                  name="address_province"
                >
                  <option selected disabled>
                    Select Province
                  </option>
                  {addressProvince.map((province) => (
                    <option key={province.value} value={province.value}>
                      {province.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* City */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">City</span>
                </label>
                <select
                  className="select select-bordered"
                  value={selectedCity}
                  onChange={handleCityChange}
                  name="address_city"
                  disabled={!selectedProvince}
                >
                  <option selected disabled>
                    Select City
                  </option>
                  {addressCity.map((city) => (
                    <option key={city.value} value={city.value}>
                      {city.label}
                    </option>
                  ))}
                </select>
              </div>
              {/* Barangay */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Barangay</span>
                </label>
                <select
                  className="select select-bordered"
                  value={selectedBarangay}
                  onChange={handleBarangayChange}
                  disabled={!selectedCity}
                  name="address_barangay"
                >
                  <option selected disabled>
                    Select Barangay
                  </option>
                  {addressBarangay.map((barangay) => (
                    <option key={barangay.value} value={barangay.value}>
                      {barangay.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">ZIP code</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  placeholder="Enter ZIP Code"
                  value={zipCode}
                  name="zip_code"
                  onChange={(e) => setZipCode(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Birthdate</span>
                </label>
                <input
                  type="date"
                  className="input input-bordered"
                  value={birthdate}
                  name="date_of_birth"
                  onChange={(e) => setBirthdate(e.target.value)}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Birthplace</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  name="birth_place"
                  placeholder="Enter Birth Place"
                  value={birthplace}
                  onChange={(e) => setBirthplace(e.target.value)}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Residence Type</span>
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="residence_type"
                      value="Own"
                      className="radio radio-primary"
                      checked={residenceType === "Own"}
                      onChange={(e) => setResidenceType(e.target.value)}
                    />
                    <span className="ml-2">Own</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="residence_type"
                      value="Rent"
                      checked={residenceType === "Rent"}
                      onChange={(e) => setResidenceType(e.target.value)}
                      className="radio radio-primary"
                    />
                    <span className="ml-2">Rent</span>
                  </label>
                </div>
              </div>
            </div>
            {/* Valid ID */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Valid ID</span>
              </label>
              <input
                type="file"
                className="file-input file-input-bordered"
                accept="application/pdf"
                name="valid_id"
                required
                onChange={(e) => setValidId(e.target.files[0])}
              />
            </div>
          </div>

          {/* Footer buttons */}
          <div className="modal-action flex justify-between">
            <button
              type="button"
              className="btn"
              id="prevBtn"
              style={{ visibility: "hidden" }}
              onClick={() => handleStepChange("prev")}
            >
              Previous
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                className="btn bg-buttonPrimary text-white"
                id="nextBtn"
                onClick={() => handleStepChange("next")}
              >
                Next
              </button>

              <button
                type="button"
                className="btn bg-buttonPrimary text-white"
                id="submitBtn"
                style={{ display: "none" }}
                onClick={() => handleStepChange("submit")}
              >
                Submit
              </button>
            </div>
          </div>
        </form>
      </dialog>

      {/* Assign Collector */}
      <dialog id="assignCollectorModal" className="modal">
        <form className="modal-box" onSubmit={handleAssignCollector}>
          {selectedBorrower && (
            <>
              <h3 className="font-bold text-lg mb-2">Assign Collector</h3>
              <div className="form-control p-0">
                <label className="label text-sm p-0 mb-3">
                  Select a Collector to assign to this borrower
                </label>

                <select
                  name="collector_id"
                  required
                  className="select select-bordered w-full"
                >
                  <option selected disabled>
                    Select Collector
                  </option>
                  {collectors.map((collector) => (
                    <option
                      key={collector.collector_id}
                      value={collector.collector_id}
                    >
                      {collector.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="modal-action">
                <button
                  className="btn"
                  type="button"
                  onClick={() =>
                    document.getElementById("assignCollectorModal").close()
                  }
                >
                  Cancel
                </button>
                <button className="btn btn-primary" type="submit">
                  Assign selected collector
                </button>
              </div>
              <input
                type="hidden"
                name="borrower_id"
                value={selectedBorrower.borrower_id}
              />
            </>
          )}
        </form>
      </dialog>
    </div>
  );
}

export default DetailedBorrowerAccounts;
