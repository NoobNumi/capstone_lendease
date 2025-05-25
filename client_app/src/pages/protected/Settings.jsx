import {
  useEffect,
  useState,
  forwardRef,
  createRef,
  useMemo,
  useRef,
} from "react";
import { useDispatch } from "react-redux";
import { setPageTitle } from "../../features/common/headerSlice";
import Settings from "../../features/layaway";
import InputText from "../../components/Input/InputText";
import Quill from "quill";
import "quill/dist/quill.core.css";
import "quill/dist/quill.snow.css";
import "quill/dist/quill.bubble.css";
const Inline = Quill.import("blots/inline");
const Embed = Quill.import("blots/embed");

import Dropdown from "../../components/Input/Dropdown";
import { Formik, useField, useFormik, Form } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import checkAuth from "../../app/auth";
import { ToastContainer, toast } from "react-toastify";
import html2canvas from "html2canvas";
import domtoimage from "dom-to-image";
import Table, {
  AvatarCell,
  SelectColumnFilter,
  StatusPill,
  DateCell,
} from "../../pages/protected/DataTables/Table"; // new

import { format, formatDistance, formatRelative, subDays } from "date-fns";
import { Button } from "./DataTables/shared/Button";

class TokenBlot extends Embed {
  static create(value) {
    const node = super.create();
    node.setAttribute("data-token", value);
    node.setAttribute("contenteditable", "false");

    // Style as chip
    node.classList.add(
      "inline-block",
      "bg-orange-200",
      "text-orange-800",
      "rounded-full",
      "px-2",
      "py-1",
      "text-xs",
      "font-semibold",
      "mr-1",
      "cursor-default",
      "ql-token-chip"
    );

    node.innerText = TokenBlot.formatLabel(value);
    return node;
  }

  static value(node) {
    return node.getAttribute("data-token");
  }

  static formatLabel(token) {
    return token
      .replace(/[{}]/g, "")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
  }
}

TokenBlot.blotName = "token";
TokenBlot.tagName = "span";

Quill.register(TokenBlot);

const Tab1Content = () => {
  const token = checkAuth();

  const decoded = jwtDecode(token);

  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState({});
  const [acccountSetttings, setAccountSettings] = useState({});
  const fetchEmployee = async () => {
    let res = await axios({
      method: "GET",
      url: `user/${decoded.EmployeeID}/childDetails`,
    });
    let user = res.data.data;

    setSelectedEmployee(user[0]);
    setIsLoaded(true);
  };

  const fetchAccountSettings = async () => {
    let res = await axios({
      method: "GET",
      url: `settings/accounts/get`,
    });
    let result = res.data.data;

    setAccountSettings(result);

    // setSelectedEmployee(user[0]);
    // setIsLoaded(true);
  };

  useEffect(() => {
    fetchEmployee();
    // fetchAccountSettings()
  }, []);

  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePhotoPreview, setprofilePhotoPreview] = useState(null);
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];

    console.log({ file });
    setProfilePhoto(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setprofilePhotoPreview(reader.result); // Set the image preview
      };
      reader.readAsDataURL(file);
    }
  };

  const formikConfig = (selectedEmployee) => {
    console.log({ selectedEmployee });
    return {
      initialValues: {
        type: selectedEmployee.role,
        Admin_Fname: selectedEmployee.Admin_Fname,
        Admin_Lname: selectedEmployee.Admin_Lname,
        Phone: selectedEmployee.Phone,
        Username: selectedEmployee.Username,
        Password: selectedEmployee.Password,
        BirthDate: selectedEmployee.BirthDate
          ? selectedEmployee.BirthDate.split("T")[0]
          : "", // Format as YYYY-MM-DD
      },
      validationSchema: Yup.object({
        Admin_Fname: Yup.string().required("Required"),
        Admin_Lname: Yup.string().required("Required"),
        Phone: Yup.string()
          .matches(/^\d{11}$/, "Phone number must be exactly 11 digits")
          .required("Phone number is required"),
        Username: Yup.string().required("Required"),
        Password: Yup.string().required("Required"),
      }),
      // validateOnMount: true,
      // validateOnChange: false,
      onSubmit: async (values, { setFieldError, setSubmitting }) => {
        setSubmitting(true);

        try {
          let isDoable = acccountSetttings.find(
            (item) => item.name === "Edit Details"
          )[decoded.role];

          if (!!isDoable) {
            if (profilePhoto) {
              const data = new FormData();

              // console.log({ profilePhoto })
              data.append("profilePic", profilePhoto);
              await axios({
                // headers: {
                //   'content-type': 'multipart/form-data'
                // },
                method: "POST",
                url: "user/uploadProfilePicture",
                data,
              });
            }

            let { type, ...others } = values;
            let res = await axios({
              method: "post",
              url: `user/editEmployee`,
              data: {
                EmployeeID: decoded.EmployeeID,
                ...others,
              },
            });

            toast.success(
              "Updated successfully",

              {
                onclose: () => {},
                position: "top-right",
                autoClose: 500,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
              }
            );
            window.location.reload(); // Reloads the current window
          } else {
            toast.error(
              "Access denied: You do not have permission to update these details.",
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
          }
        } catch (error) {
          console.log({ error });
        } finally {
        }
      },
    };
  };

  return (
    isLoaded && (
      <div>
        <div className="p-2 space-y-4 md:space-y-6 sm:p-4">
          <Formik {...formikConfig(selectedEmployee)}>
            {({
              handleSubmit,
              handleChange,
              handleBlur, // handler for onBlur event of form elements
              values,
              touched,
              errors,
              submitForm,
              setFieldTouched,
              setFieldValue,
              setFieldError,
              setErrors,
              isSubmitting,
            }) => {
              const checkValidateTab = () => {
                // submitForm();
              };
              const errorMessages = () => {
                // you can add alert or console.log or any thing you want
                alert("Please fill in the required fields");
              };

              // console.log({ values })

              return (
                <Form className="">
                  {/* <label
            className={`block mb-2 text-green-400 text-left font-bold`}>
            Child
          </label> */}
                  <div className="flex items-center justify-center">
                    <label className="relative cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                      <img
                        src={
                          profilePhotoPreview ||
                          selectedEmployee.profilePic ||
                          "https://via.placeholder.com/150"
                        }
                        alt="Profile"
                        className="w-32 h-32 rounded-full border-4 border-gray-300 shadow-md"
                      />
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="text-gray-600 text-sm">
                          {selectedEmployee.profilePic || profilePhoto
                            ? ""
                            : "Upload Photo"}
                        </span>
                      </span>
                    </label>
                  </div>
                  <InputText
                    disabled
                    label="Type"
                    name="type"
                    type="text"
                    placeholder=""
                    value={values.type}
                    onBlur={handleBlur} // This apparently updates `touched`?
                  />
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 ">
                    <InputText
                      label="First Name"
                      name="Admin_Fname"
                      type="text"
                      placeholder=""
                      value={values.Admin_Fname}
                      onBlur={handleBlur} // This apparently updates `touched`?
                    />
                    <InputText
                      label="Last Name"
                      name="Admin_Lname"
                      type="text"
                      placeholder=""
                      value={values.Admin_Lname}
                      onBlur={handleBlur} // This apparently updates `touched`?
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2 ">
                    <InputText
                      label="Birth Date"
                      name="BirthDate"
                      type="date"
                      placeholder=""
                      value={values.BirthDate}
                      onBlur={handleBlur} // This apparently updates `touched`?
                    />

                    <InputText
                      label="Phone Number"
                      name="Phone"
                      type="text"
                      placeholder=""
                      value={values.Phone}
                      onBlur={handleBlur} // This apparently updates `touched`?
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 ">
                    <InputText
                      label="Username"
                      name="Username"
                      type="text"
                      placeholder=""
                      value={values.Username}
                      onBlur={handleBlur} // This apparently updates `touched`?
                    />
                    <InputText
                      label="Password"
                      name="Password"
                      type="text"
                      placeholder=""
                      value={values.Password}
                      onBlur={handleBlur} // This apparently updates `touched`?
                    />
                  </div>
                  <button
                    type="submit"
                    className={
                      "btn mt-4 shadow-lg  bg-buttonPrimary font-bold text-white"
                    }
                  >
                    Update
                  </button>
                </Form>
              );
            }}
          </Formik>{" "}
        </div>
      </div>
    )
  );
};
const PricingTab = () => {
  const token = checkAuth();

  const decoded = jwtDecode(token);

  const [isLoaded, setIsLoaded] = useState(false);
  const [loanSettings, setLoanSettings] = useState({}); // Changed variable name here
  const [error, setError] = useState(null); // Add error state for error handling

  const fetchloanSettings = async () => {
    try {
      const res = await axios.get(`settings/read/1`); // Using shorthand for axios.get
      const settings = res.data.data; // Changed variable name here
      setLoanSettings(settings); // Changed function call here
    } catch (err) {
      console.error("Error fetching pricing settings:", err); // Log the error
      setError("Failed to fetch pricing settings"); // Changed error message here
    } finally {
      setIsLoaded(true); // Ensure isLoaded is set to true regardless of success or error
    }
  };

  useEffect(() => {
    fetchloanSettings(); // Changed function call here
  }, []);
  const formikConfig = () => {
    return {
      initialValues: {
        minCreditScore: loanSettings.min_credit_score, // Minimum Credit Score
        minMonthlyIncome: loanSettings.min_monthly_income, // Minimum Monthly Income
        maxLoanToIncomeRatio: loanSettings.loan_to_income_ratio, // Maximum Loan-to-Income Ratio
        minEmploymentYears: loanSettings.employment_years, // Minimum Employment Years
        interestRate: loanSettings.interest_rate,
      },
      validationSchema: Yup.object({
        // Credit Score Validation
        minCreditScore: Yup.number()
          .required("Minimum Credit Score is required")
          .positive("Credit Score must be a positive number"),

        // Employment Validations
        minMonthlyIncome: Yup.number()
          .required("Minimum Monthly Income is required")
          .positive("Monthly Income must be a positive number"),

        maxLoanToIncomeRatio: Yup.number()
          .required("Maximum Loan-to-Income Ratio is required")
          .positive("Loan-to-Income Ratio must be a positive number"),

        minEmploymentYears: Yup.number()
          .required("Minimum Employment Years is required")
          .min(0, "Employment Years cannot be negative")
          .integer("Employment Years must be a whole number"),
      }),
      onSubmit: async (values, { setSubmitting }) => {
        setSubmitting(true);
        try {
          console.log({ values });
          // API request
          const response = await axios.put(`settings/update/1`, values);

          // Success notification
          toast.success("Form updated successfully", {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "light",
          });

          console.log("Response:", response.data);
        } catch (error) {
          console.error("Error submitting form:", error);

          // Error notification
          toast.error("Failed to update settings. Please try again.", {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "light",
          });
        } finally {
          setSubmitting(false);
        }
      },
    };
  };

  return (
    isLoaded && (
      <div>
        <div className="p-2 space-y-4 md:space-y-6 sm:p-4">
          <Formik {...formikConfig()}>
            {({
              handleSubmit,
              handleChange,
              handleBlur, // handler for onBlur event of form elements
              values,
              touched,
              errors,
              submitForm,
              setFieldTouched,
              setFieldValue,
              setFieldError,
              setErrors,
              isSubmitting,
            }) => {
              console.log({ Dex: values });
              const checkValidateTab = () => {
                // submitForm();
              };
              const errorMessages = () => {
                // you can add alert or console.log or any thing you want
                alert("Please fill in the required fields");
              };

              // console.log({ values })

              return (
                <Form className="">
                  {/* <label
            className={`block mb-2 text-green-400 text-left font-bold`}>
            Child
          </label> */}
                  <h1 className="text-2xl font-bold text-orange-300">
                    Credit Score
                  </h1>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3 ">
                    <InputText
                      label="Minimum Credit Score"
                      name="minCreditScore"
                      className="font-medium p-3"
                      type="number"
                      placeholder=""
                      value={values.minCreditScore}
                      onBlur={handleBlur} // This apparently updates `touched`?
                    />
                  </div>
                  <h1 className="text-2xl font-bold text-orange-300 mt-4">
                    Employment
                  </h1>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3 relative w-full">
                    <InputText
                      label="Min Monthly Income"
                      name="minMonthlyIncome"
                      className="font-medium p-3 w-full"
                      type="number"
                      placeholder=""
                      value={values.minMonthlyIncome}
                      onBlur={handleBlur} // This apparently updates `touched`?
                    />

                    <InputText
                      label="Max Loan to Income Ratio"
                      name="maxLoanToIncomeRatio"
                      className="font-medium p-3 w-full"
                      type="number"
                      placeholder=""
                      value={values.maxLoanToIncomeRatio}
                      onBlur={handleBlur} // This apparently updates `touched`?
                    />
                    <InputText
                      label="Min Employment Years"
                      name="minEmploymentYears"
                      className="font-medium p-3 w-full"
                      type="number"
                      placeholder=""
                      value={values.minEmploymentYears}
                      onBlur={handleBlur} // This apparently updates `touched`?
                    />
                  </div>
                  <h1 className="text-2xl font-bold text-orange-300 mt-1">
                    Interest Rate
                  </h1>{" "}
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3 ">
                    <InputText
                      label="Interest Rate (%)"
                      name="interestRate"
                      className="font-medium p-3"
                      type="number"
                      placeholder=""
                      value={values.interestRate}
                      onBlur={handleBlur} // This apparently updates `touched`?
                    />
                  </div>
                  <button
                    type="submit"
                    onClick={handleSubmit}
                    className={
                      "btn mt-4 shadow-lg  bg-buttonPrimary font-bold text-white"
                    }
                  >
                    Update
                  </button>
                </Form>
              );
            }}
          </Formik>{" "}
        </div>
      </div>
    )
  );
};

const SMSTab = () => {
  const [smsTemplates, setSmsTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formValues, setFormValues] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [selectedTemplateContent, setSelectedTemplateContent] = useState("");
  const [selectedTemplateType, setSelectedTemplateType] = useState("");
  const quillRef = useRef(null);
  const tokensByTemplate = {
    loan_creation: ["{firstName}", "{lastName}", "{loanAmount}", "{loanId}"],
    loan_approval: ["{firstName}", "{lastName}", "{loanAmount}", "{loanId}"],
    loan_rejected: ["{firstName}", "{lastName}", "{loanId}"],
    loan_acceptance: [
      "{firstName}",
      "{lastName}",
      "{paymentAmount}",
      "{paymentDate}",
    ],
    loan_payment_rejection: [
      "{firstName}",
      "{lastName}",
      "{paymentAmount}",
      "{reason}",
    ],
    payment_submission: [
      "{firstName}",
      "{paymentAmount}",
      "{referenceNumber}",
      "{paymentMethod}",
    ],
  };

  useEffect(() => {
    if (selectedTemplateContent) {
      document.getElementById("modifyTemplateModal").showModal();
    }
  }, [selectedTemplateContent]);

  useEffect(() => {
    const fetchSmsTemplates = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get("settings/sms-templates");
        setSmsTemplates(res.data.data || []);
        // Initialize form values
        const initialValues = {};
        (res.data.data || []).forEach((template) => {
          initialValues[template.id] = template.message || "";
        });
        setFormValues(initialValues);
      } catch (err) {
        setError("Failed to fetch SMS templates");
        toast.error("Failed to fetch SMS templates");
      } finally {
        setLoading(false);
      }
    };
    fetchSmsTemplates();
  }, []);

  // Separate templates by type
  const reminderTemplates = smsTemplates.filter(
    (template) => template.type === "confirmation"
  );
  const overdueTemplates = smsTemplates.filter(
    (template) => template.type === "due_notification"
  );
  const loanCreationTemplates = smsTemplates.filter(
    (template) => template.type === "loan_creation"
  );

  const loanApprovalTemplates = smsTemplates.filter(
    (template) => template.type === "loan_approval"
  );

  const loanRejectedTemplates = smsTemplates.filter(
    (template) => template.type === "loan_rejected"
  );

  const loanAcceptanceTemplates = smsTemplates.filter(
    (template) => template.type === "loan_acceptance"
  );

  const loanPaymentRejectionTemplates = smsTemplates.filter(
    (template) => template.type === "loan_payment_rejection"
  );

  const paymentSubmissionTemplates = smsTemplates.filter(
    (template) => template.type === "payment_submission"
  );

  const getEditorContentWithTokens = (quill) => {
    const delta = quill.getContents();
    let result = "";

    delta.ops.forEach((op) => {
      if (typeof op.insert === "string") {
        result += op.insert;
      } else if (op.insert.token) {
        result += `{{${op.insert.token}}}`;
      }
    });

    return result;
  };

  const handleSaveTemplate = () => {
    if (quillRef.current && quillRef.current.__quill) {
      const quill = quillRef.current.__quill;
      const content = getEditorContentWithTokens(quill);

      const updatedTemplate = smsTemplates.find(
        (t) => t.type === selectedTemplateType
      );
      if (updatedTemplate) {
        setFormValues((prev) => ({
          ...prev,
          [updatedTemplate.id]: content.trim(),
        }));
      }

      document.getElementById("modifyTemplateModal").close();
      setSelectedTemplateContent("");
      setSelectedTemplateType("");
    }
  };

  const validate = async () => {
    const schemaShape = {};
    smsTemplates.forEach((template) => {
      schemaShape[template.id] = Yup.string()
        .trim()
        .required("Template message cannot be empty");
    });

    const schema = Yup.object().shape(schemaShape);

    try {
      await schema.validate(formValues, { abortEarly: false });
      setFormErrors({});
      return true;
    } catch (err) {
      if (err.inner) {
        const errors = {};
        err.inner.forEach((e) => {
          errors[e.path] = e.message;
        });
        setFormErrors(errors);
      }
      return false;
    }
  };

  const messageSchema = Yup.string()
    .trim()
    .required("Template message cannot be empty");

  const handleChange = async (id, value) => {
    setFormValues((prev) => ({
      ...prev,
      [id]: value,
    }));

    try {
      await messageSchema.validate(value);
      setFormErrors((prev) => ({
        ...prev,
        [id]: undefined,
      }));
    } catch (err) {
      setFormErrors((prev) => ({
        ...prev,
        [id]: err.message,
      }));
    }
  };

  function loadTemplateWithTokens(quill, template) {
    quill.deleteText(0, quill.getLength()); // clear current content

    const tokenRegex = /{{\s*([^}]+)\s*}}/g;
    let lastIndex = 0;
    let match;

    while ((match = tokenRegex.exec(template)) !== null) {
      const index = match.index;
      const token = match[0]; // e.g. "{{firstName}}"
      const tokenName = match[1]; // e.g. "firstName"

      // Insert the text before the token as normal text
      if (index > lastIndex) {
        quill.insertText(
          quill.getLength() - 1,
          template.substring(lastIndex, index)
        );
      }

      // Insert the token as an embed chip
      quill.insertEmbed(quill.getLength() - 1, "token", tokenName);

      lastIndex = index + token.length;
    }

    // Insert remaining text after last token
    if (lastIndex < template.length) {
      quill.insertText(quill.getLength() - 1, template.substring(lastIndex));
    }
  }

  const ModifyTemplateModal = () => {
    useEffect(() => {
      if (quillRef.current && !quillRef.current.__quill) {
        const quill = new Quill(quillRef.current, {
          theme: "snow",
          modules: {
            toolbar: false,
          },
        });
        quillRef.current.__quill = quill;
      }
    }, []);

    useEffect(() => {
      if (quillRef.current && quillRef.current.__quill) {
        const quill = quillRef.current.__quill;
        if (selectedTemplateContent) {
          loadTemplateWithTokens(quill, selectedTemplateContent);
        } else {
          quill.setText("");
        }
      }
    }, [selectedTemplateContent]);

    return (
      <dialog
        id="modifyTemplateModal"
        className="modal modal-bottom sm:modal-middle"
      >
        <div className="modal-box w-11/12 max-w-5xl">
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={() => {
              document.getElementById("modifyTemplateModal").close();
            }}
          >
            ✕
          </button>

          <h1 className="font-bold text-lg z-10 mb-4 bg-white rounded-lg">
            Modify Template
          </h1>

          <div
            className="flex w-full h-full justify-between relative"
            style={{ height: "100%" }}
          >
            <div
              ref={quillRef}
              className="w-full outline-none border rounded p-2 text-gray-700 font-medium bg-slate-100 h-full"
              style={{ minHeight: "200px" }}
            />
            <div className="w-auto px-3 border-1">
              <p className="font-medium text-sm z-10 mb-2 bg-white rounded-lg">
                Customization Tokens
              </p>
              <p className="text-sm font-normal mb-4">
                Click on these tokens to insert them into your sms template.
              </p>
              <div className="flex flex-wrap gap-2">
                {(tokensByTemplate[selectedTemplateType] || []).map((token) => (
                  <span
                    key={token}
                    className="cursor-pointer bg-orange-200 text-orange-800 rounded-full px-3 py-1 text-xs font-semibold mb-1 hover:bg-orange-300 transition"
                    onClick={() => {
                      if (quillRef.current && quillRef.current.__quill) {
                        const quill = quillRef.current.__quill;
                        const range = quill.getSelection(true);
                        const index = range ? range.index : 0;

                        const cleanedToken = token.replace(/[{}]/g, "");
                        quill.insertEmbed(index, "token", cleanedToken);
                        quill.setSelection(index + cleanedToken.length);
                      }
                    }}
                  >
                    {token}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <button
            className="btn bg-orange-300 text-white font-bold float-right mt-7"
            onClick={handleSaveTemplate}
          >
            Save template
          </button>
        </div>
      </dialog>
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = await validate();
    if (!isValid) {
      toast.error("Please fill in all template messages.");
      return;
    }

    setSubmitting(true);
    try {
      // Prepare payload: array of {id, message}
      const updatedTemplates = smsTemplates.map((template) => ({
        id: template.id,
        message: formValues[template.id],
        type: template.type,
      }));
      await axios.post("settings/sms-templates/update", {
        templates: updatedTemplates,
      });
      toast.success("Templates updated successfully!");
    } catch (err) {
      toast.error("Failed to update templates.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full bg-white shadow-md rounded-lg p-4">
        Loading SMS templates...
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-white shadow-md rounded-lg p-4">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div>
      <form
        className="w-full bg-white shadow-md rounded-lg p-4 h-[80vh] overflow-auto"
        onSubmit={handleSubmit}
      >
        <h2 className="text-2xl font-bold text-orange-300 mb-3">
          SMS Templates
        </h2>
        <div className="mb-6">
          <label className="block font-bold mb-2 text-gray-700">
            Confirmation Template
          </label>
          {reminderTemplates.length > 0 ? (
            reminderTemplates.map((template) => (
              <div key={template.id} className="mb-2">
                <textarea
                  className={`w-full border rounded p-2 text-gray-700 font-medium ${
                    formErrors[template.id] ? "border-red-500" : ""
                  }`}
                  value={formValues[template.id] || ""}
                  rows={3}
                  name="message"
                  onChange={(e) => handleChange(template.id, e.target.value)}
                />
                {formErrors[template.id] && (
                  <div className="text-red-500 text-sm">
                    {formErrors[template.id]}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-gray-400">No reminder templates found.</div>
          )}
        </div>
        <div className="mb-6">
          <label className="block font-bold mb-2 text-gray-700">
            Overdue Template
          </label>
          {overdueTemplates.length > 0 ? (
            overdueTemplates.map((template) => (
              <div key={template.id} className="mb-2">
                <textarea
                  className={`w-full border rounded p-2 text-gray-700 font-medium ${
                    formErrors[template.id] ? "border-red-500" : ""
                  }`}
                  value={formValues[template.id] || ""}
                  rows={3}
                  name="message"
                  onChange={(e) => handleChange(template.id, e.target.value)}
                />
                {formErrors[template.id] && (
                  <div className="text-red-500 text-sm">
                    {formErrors[template.id]}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-gray-400">No overdue templates found.</div>
          )}
        </div>
        <div className="mb-6">
          <div className="flex items-center mb-4 justify-between">
            <label className="block font-bold text-gray-700">
              Loan Creation Template
            </label>
            <button
              className="btn bg-orange-300 text-white font-bold"
              type="button"
              onClick={() => {
                setSelectedTemplateContent(
                  loanCreationTemplates[0]?.message || ""
                );
                setSelectedTemplateType("loan_creation");
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="size-6"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                />
              </svg>
              Modify Template
            </button>
          </div>
          {loanCreationTemplates.length > 0 ? (
            loanCreationTemplates.map((template) => (
              <div key={template.id} className="mb-2">
                <textarea
                  className={`w-full border rounded p-2 text-gray-700 font-medium bg-slate-100 ${
                    formErrors[template.id] ? "border-red-500" : ""
                  }`}
                  value={formValues[template.id] || ""}
                  rows={8}
                  name="message"
                  readOnly
                  onChange={(e) => handleChange(template.id, e.target.value)}
                />
                {formErrors[template.id] && (
                  <div className="text-red-500 text-sm">
                    {formErrors[template.id]}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-gray-400">
              No loan creation templates found.
            </div>
          )}
        </div>
        <div className="mb-6">
          <div className="flex items-center mb-4 justify-between">
            <label className="block font-bold text-gray-700">
              Loan Approval Template
            </label>
            <button
              className="btn bg-orange-300 text-white font-bold"
              type="button"
              onClick={() => {
                setSelectedTemplateContent(
                  loanApprovalTemplates[0]?.message || ""
                );
                setSelectedTemplateType("loan_approval");
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="size-6"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                />
              </svg>
              Modify Template
            </button>
          </div>
          {loanApprovalTemplates.length > 0 ? (
            loanApprovalTemplates.map((template) => (
              <div key={template.id} className="mb-2">
                <textarea
                  className={`w-full border rounded p-2 text-gray-700 font-medium bg-slate-100 ${
                    formErrors[template.id] ? "border-red-500" : ""
                  }`}
                  value={formValues[template.id] || ""}
                  rows={8}
                  name="message"
                  readOnly
                  onChange={(e) => handleChange(template.id, e.target.value)}
                />
                {formErrors[template.id] && (
                  <div className="text-red-500 text-sm">
                    {formErrors[template.id]}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-gray-400">
              No loan creation templates found.
            </div>
          )}
        </div>
        <div className="mb-6">
          <div className="flex items-center mb-4 justify-between">
            <label className="block font-bold text-gray-700">
              Loan Rejection Template
            </label>
            <button
              className="btn bg-orange-300 text-white font-bold"
              type="button"
              onClick={() => {
                setSelectedTemplateContent(
                  loanRejectedTemplates[0]?.message || ""
                );
                setSelectedTemplateType("loan_rejected");
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="size-6"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                />
              </svg>
              Modify Template
            </button>
          </div>
          {loanRejectedTemplates.length > 0 ? (
            loanRejectedTemplates.map((template) => (
              <div key={template.id} className="mb-2">
                <textarea
                  className={`w-full border rounded p-2 text-gray-700 font-medium bg-slate-100 ${
                    formErrors[template.id] ? "border-red-500" : ""
                  }`}
                  value={formValues[template.id] || ""}
                  rows={8}
                  name="message"
                  readOnly
                  onChange={(e) => handleChange(template.id, e.target.value)}
                />
                {formErrors[template.id] && (
                  <div className="text-red-500 text-sm">
                    {formErrors[template.id]}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-gray-400">
              No loan creation templates found.
            </div>
          )}
        </div>
        <div className="mb-6">
          <div className="flex items-center mb-4 justify-between">
            <label className="block font-bold text-gray-700">
              Loan Acceptance Template
            </label>
            <button
              className="btn bg-orange-300 text-white font-bold"
              type="button"
              onClick={() => {
                setSelectedTemplateContent(
                  loanAcceptanceTemplates[0]?.message || ""
                );
                setSelectedTemplateType("loan_acceptance");
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="size-6"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                />
              </svg>
              Modify Template
            </button>
          </div>
          {loanAcceptanceTemplates.length > 0 ? (
            loanAcceptanceTemplates.map((template) => (
              <div key={template.id} className="mb-2">
                <textarea
                  className={`w-full border rounded p-2 text-gray-700 font-medium bg-slate-100 ${
                    formErrors[template.id] ? "border-red-500" : ""
                  }`}
                  value={formValues[template.id] || ""}
                  rows={8}
                  name="message"
                  readOnly
                  onChange={(e) => handleChange(template.id, e.target.value)}
                />
                {formErrors[template.id] && (
                  <div className="text-red-500 text-sm">
                    {formErrors[template.id]}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-gray-400">
              No loan creation templates found.
            </div>
          )}
        </div>
        <div className="mb-6">
          <div className="flex items-center mb-4 justify-between">
            <label className="block font-bold text-gray-700">
              Loan Payment Rejection Template
            </label>
            <button
              className="btn bg-orange-300 text-white font-bold"
              type="button"
              onClick={() => {
                setSelectedTemplateContent(
                  loanPaymentRejectionTemplates[0]?.message || ""
                );
                setSelectedTemplateType("loan_payment_rejection");
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="size-6"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                />
              </svg>
              Modify Template
            </button>
          </div>
          {loanPaymentRejectionTemplates.length > 0 ? (
            loanPaymentRejectionTemplates.map((template) => (
              <div key={template.id} className="mb-2">
                <textarea
                  className={`w-full border rounded p-2 text-gray-700 font-medium bg-slate-100 ${
                    formErrors[template.id] ? "border-red-500" : ""
                  }`}
                  value={formValues[template.id] || ""}
                  rows={8}
                  name="message"
                  readOnly
                  onChange={(e) => handleChange(template.id, e.target.value)}
                />
                {formErrors[template.id] && (
                  <div className="text-red-500 text-sm">
                    {formErrors[template.id]}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-gray-400">
              No loan creation templates found.
            </div>
          )}
        </div>
        <div className="mb-6">
          <div className="flex items-center mb-4 justify-between">
            <label className="block font-bold text-gray-700">
              Loan Payment Rejection Template
            </label>
            <button
              className="btn bg-orange-300 text-white font-bold"
              type="button"
              onClick={() => {
                setSelectedTemplateContent(
                  paymentSubmissionTemplates[0]?.message || ""
                );
                setSelectedTemplateType("payment_submission");
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="size-6"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                />
              </svg>
              Modify Template
            </button>
          </div>
          {paymentSubmissionTemplates.length > 0 ? (
            paymentSubmissionTemplates.map((template) => (
              <div key={template.id} className="mb-2">
                <textarea
                  className={`w-full border rounded p-2 text-gray-700 font-medium bg-slate-100 ${
                    formErrors[template.id] ? "border-red-500" : ""
                  }`}
                  value={formValues[template.id] || ""}
                  rows={8}
                  name="message"
                  readOnly
                  onChange={(e) => handleChange(template.id, e.target.value)}
                />
                {formErrors[template.id] && (
                  <div className="text-red-500 text-sm">
                    {formErrors[template.id]}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-gray-400">
              No loan creation templates found.
            </div>
          )}
        </div>
        <button
          type="submit"
          className="btn mt-4 shadow-lg bg-buttonPrimary font-bold text-white"
          disabled={submitting || Object.values(formErrors).some(Boolean)}
        >
          {submitting ? "Updating..." : "Update Templates"}
        </button>
      </form>
      <ModifyTemplateModal selectedTemplateContent={selectedTemplateContent} />
    </div>
  );
};

// const NotificationsTab = () => {
//   const [notifications, setNotifications] = useState([]);
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [currentPage, setCurrentPage] = useState(1);
//   const notificationsPerPage = 5;
//   const [isVisible, setIsVisible] = useState(false); // State to manage visibility
//   useEffect(() => {
//     const fetchNotifications = async () => {
//       setError(null); // Reset error before fetching
//       setLoading(true); // Set loading true when fetching
//       try {
//         const response = await axios.get("/notification/list", {
//           params: { page: currentPage, limit: notificationsPerPage },
//         });
//         setNotifications((prevNotifications) => [
//           ...prevNotifications,
//           ...response.data.data,
//         ]);
//       } catch (err) {
//         setError("Failed to fetch notifications");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchNotifications();
//   }, [currentPage]);

//   const markAllAsRead = () => {
//     const updatedNotifications = notifications.map((notification) => ({
//       ...notification,
//       is_read: true,
//     }));
//     setNotifications(updatedNotifications);
//   };

//   const LayawayReminder = forwardRef(
//     ({ id, customerId, customerName, dueDate, remainingBalance }, ref) => {
//       return (
//         <dialog
//           id="createCodeModal"
//           className="modal modal-bottom sm:modal-middle"
//         >
//           <div
//             ref={ref}
//             id={`layaway-reminder-${id}`}
//             className={`max-w-lg mx-auto p-6 bg-white shadow-lg rounded-lg`}
//           >
//             <header className="text-center mb-6">
//               <h1 className="text-2xl font-bold text-gray-700">
//                 A.V. De Asis Jewelry
//               </h1>
//             </header>

//             <div className="text-left space-y-2">
//               <p className="text-gray-700">
//                 <strong>Customer ID:</strong> {customerId}
//               </p>
//               <p className="text-gray-700">
//                 <strong>Customer Name:</strong> {customerName}
//               </p>
//               <p className="text-gray-700">
//                 <strong>Due Date:</strong> {dueDate}
//               </p>
//               <p className="text-gray-700">
//                 <strong>Remaining Balance:</strong> ₱{remainingBalance}
//               </p>
//             </div>

//             <div className="mt-4 text-gray-700">
//               <p>
//                 We kindly remind you to make your scheduled payments to avoid
//                 any inconvenience.
//               </p>
//               <p>
//                 If you have any questions or need assistance regarding your
//                 layaway plan, feel free to contact our team.
//               </p>
//             </div>

//             <footer className="mt-6 text-right">
//               <p className="text-gray-700">Best regards,</p>
//               <p className="text-gray-700 font-bold">A.V. De Asis Jewelry</p>
//             </footer>
//           </div>
//         </dialog>
//       );
//     }
//   );

//   const exportNotifications = (notification) => {
//     setIsVisible(true);

//     const reminderDiv = document.getElementById(
//       `layaway-reminder-${notification.id}`
//     );
//     if (reminderDiv) {
//       reminderDiv.style.display = "block";

//       domtoimage
//         .toPng(reminderDiv, {
//           filter: (node) => {
//             // Ignore link elements that load external styles
//             return !(
//               node.tagName === "LINK" &&
//               node.href &&
//               node.href.includes("fonts.googleapis.com")
//             );
//           },
//         })
//         .then((dataUrl) => {
//           reminderDiv.style.display = "";
//           const link = document.createElement("a");
//           link.href = dataUrl;
//           link.download = "exported_image.png";
//           document.body.appendChild(link);
//           link.click();
//           document.body.removeChild(link);
//         })
//         .catch((error) => {
//           console.error("Failed to export image:", error);
//         });
//     }
//   };

//   const handleCheckboxChange = (id) => {
//     const updatedNotifications = notifications.map((notification) =>
//       notification.id === id
//         ? { ...notification, selected: !notification.selected }
//         : notification
//     );
//     setNotifications(updatedNotifications);
//   };

//   const handleSeeMore = () => {
//     setCurrentPage((prevPage) => prevPage + 1); // Increment the page number
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center">
//         <span className="loader">Loading...</span>
//       </div>
//     );
//   }

//   return (
//     <div className="w-full bg-white shadow-md rounded-lg p-4">
//       <div className="flex justify-between items-center mb-4">
//         <h2 className="text-lg font-semibold">Notifications</h2>
//         <div>
//           <button
//             onClick={markAllAsRead}
//             className="text-orange-300 hover:text-orange-400 transition-colors mr-2"
//           >
//             Mark All as Read
//           </button>
//         </div>
//       </div>
//       <ul className="divide-y divide-gray-200">
//         {notifications.map((notification) => {
//           const briefMessage = notification.message.split(".")[0];
//           return (
//             <li
//               key={notification.id}
//               className={`flex justify-between p-2 ${
//                 notification.is_read === 0 ? "bg-gray-100" : "bg-white"
//               }`}
//             >
//               <input
//                 type="checkbox"
//                 checked={notification.selected}
//                 onChange={() => handleCheckboxChange(notification.id)}
//                 className="mr-2"
//                 aria-label={`Select notification for ${notification.message}`}
//               />
//               <p
//                 className={`font-semibold text-sm ${
//                   notification.is_read ? "text-gray-500" : "text-gray-800"
//                 }`}
//               >
//                 {briefMessage}
//               </p>
//               <LayawayReminder
//                 id={notification.id}
//                 ref={createRef()}
//                 {...JSON.parse(notification.messageData)}
//               />
//               <button
//                 onClick={() => exportNotifications(notification)}
//                 className="ml-2 bg-orange-500 text-white py-1 px-2 rounded hover:bg-orange-600 transition-colors"
//               >
//                 <i class="fa-solid fa-file-export"></i>
//               </button>
//             </li>
//           );
//         })}
//       </ul>
//       <button
//         onClick={handleSeeMore}
//         className="text-center mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
//       >
//         See More
//       </button>
//       {error && <p className="text-red-500 mt-2">{error}</p>}
//     </div>
//   );
// };
// const AccountSettingsTab = () => {
//   // Sample data for demonstration purposes
//   const [acccountSetttings, setAccountSettings] = useState([]);

//   const [actions, setActions] = useState([]);

//   const fetchAccountSettings = async () => {
//     let res = await axios({
//       method: "GET",
//       url: `settings/accounts/get`,
//     });
//     let result = res.data.data;

//     console.log({ result });

//     setActions(
//       result.filter(
//         (item) => item.name === "Edit Details" || item.name === "Password Reset"
//       )
//     );

//     // setSelectedEmployee(user[0]);
//     // setIsLoaded(true);
//   };

//   useEffect(() => {
//     // fetchAccountSettings()
//   }, []);

//   // Handle checkbox change
//   const handleCheckboxChange = (index, role) => {
//     setActions((prevActions) => {
//       const updatedActions = [...prevActions];
//       updatedActions[index][role] = !updatedActions[index][role];
//       return updatedActions;
//     });
//   };

//   // Handle form submission
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       let res = await axios({
//         method: "post",
//         url: `settings/accounts`,
//         data: actions,
//       });

//       toast.success("Updated Successfully", {
//         position: "top-right",
//         autoClose: 2000,
//         hideProgressBar: false,
//         closeOnClick: true,
//         pauseOnHover: true,
//         draggable: true,
//         progress: undefined,
//         theme: "light",
//       });
//     } catch (error) {
//       console.log({ error });
//     } finally {
//     }

//     // You can replace this alert with your submission logic (e.g., API call)
//     //alert('Data submitted: ' + JSON.stringify(actions));
//   };

//   console.log({ actions });
//   return (
//     <div className="overflow-x-auto shadow-lg">
//       <header className="text-center mb-6">
//         <h1 className="text-2xl font-bold text-gray-700">Accounts</h1>
//       </header>
//       <form onSubmit={handleSubmit}>
//         <table className="min-w-full bg-white border border-gray-300">
//           <thead>
//             <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
//               <th className="py-3 px-6 text-left">Action</th>
//               <th className="py-3 px-6 text-left">Super Admin</th>
//               <th className="py-3 px-6 text-left">Admin</th>
//             </tr>
//           </thead>
//           <tbody className="text-gray-700 text-sm font-light">
//             {actions.map((action, index) => (
//               <tr
//                 key={index}
//                 className="border-b border-gray-200 hover:bg-gray-100"
//               >
//                 <td className="py-3 px-6 text-left">{action.name}</td>
//                 <td className="py-3 px-6 text-left">
//                   <div className="flex items-center space-x-2">
//                     <input
//                       type="checkbox"
//                       checked={action.super_admin}
//                       onChange={() =>
//                         handleCheckboxChange(index, "super_admin")
//                       }
//                       className="form-checkbox"
//                       aria-label={`Toggle ${action.name} for Super Admin`}
//                     />
//                   </div>
//                 </td>
//                 <td className="py-3 px-6 text-left">
//                   <div className="flex items-center space-x-2">
//                     <input
//                       type="checkbox"
//                       checked={action.admin}
//                       onChange={() => handleCheckboxChange(index, "admin")}
//                       className="form-checkbox"
//                       aria-label={`Toggle ${action.name} for Admin`}
//                     />
//                   </div>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//         <div className="mt-4 text-right p-4">
//           <button
//             type="submit"
//             className="m-2 px-2 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 transition duration-200"
//           >
//             Update
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// const RecordManagementTab = () => {
//   // Sample data for demonstration purposes
//   const [actions, setActions] = useState([]);

//   const fetchAccountSettings = async () => {
//     let res = await axios({
//       method: "GET",
//       url: `settings/accounts/get`,
//     });
//     let result = res.data.data;

//     console.log({ result });
//     const token = checkAuth();
//     const decoded = jwtDecode(token);
//     let details = result.filter(
//       (item) => item.name !== "Edit Details" && item.name !== "Password Reset"
//     );

//     console.log({ details });
//     setActions(details);

//     // setSelectedEmployee(user[0]);
//     // setIsLoaded(true);
//   };

//   useEffect(() => {
//     fetchAccountSettings();
//   }, []);

//   // Handle checkbox change
//   const handleCheckboxChange = (index, role) => {
//     setActions((prevActions) => {
//       const updatedActions = [...prevActions];
//       updatedActions[index][role] = !updatedActions[index][role];
//       return updatedActions;
//     });
//   };

//   // Handle form submission
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       let res = await axios({
//         method: "post",
//         url: `settings/accounts`,
//         data: actions,
//       });

//       toast.success("Updated Successfully", {
//         position: "top-right",
//         autoClose: 2000,
//         hideProgressBar: false,
//         closeOnClick: true,
//         pauseOnHover: true,
//         draggable: true,
//         progress: undefined,
//         theme: "light",
//       });
//     } catch (error) {
//       console.log({ error });
//     } finally {
//     }

//     // You can replace this alert with your submission logic (e.g., API call)
//     //alert('Data submitted: ' + JSON.stringify(actions));
//   };

//   return (
//     <div className="overflow-x-auto shadow-lg">
//       <header className="text-center mb-6">
//         <h1 className="text-2xl font-bold text-gray-700">Accounts</h1>
//       </header>
//       <form onSubmit={handleSubmit}>
//         <table className="min-w-full bg-white border border-gray-300">
//           <thead>
//             <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
//               <th className="py-3 px-6 text-left">Action</th>
//               <th className="py-3 px-6 text-left">Super Admin</th>
//               <th className="py-3 px-6 text-left">Admin</th>
//             </tr>
//           </thead>
//           <tbody className="text-gray-700 text-sm font-light">
//             {actions.map((action, index) => (
//               <tr
//                 key={index}
//                 className="border-b border-gray-200 hover:bg-gray-100"
//               >
//                 <td className="py-3 px-6 text-left">{action.name}</td>
//                 <td className="py-3 px-6 text-left">
//                   <div className="flex items-center space-x-2">
//                     <input
//                       type="checkbox"
//                       checked={action.super_admin}
//                       onChange={() =>
//                         handleCheckboxChange(index, "super_admin")
//                       }
//                       className="form-checkbox"
//                       aria-label={`Toggle ${action.name} for Super Admin`}
//                     />
//                   </div>
//                 </td>
//                 <td className="py-3 px-6 text-left">
//                   <div className="flex items-center space-x-2">
//                     <input
//                       type="checkbox"
//                       checked={action.admin}
//                       onChange={() => handleCheckboxChange(index, "admin")}
//                       className="form-checkbox"
//                       aria-label={`Toggle ${action.name} for Admin`}
//                     />
//                   </div>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//         <div className="mt-4 text-right p-4">
//           <button
//             type="submit"
//             className="m-2 px-2 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 transition duration-200"
//           >
//             Update
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// const AuditTrailTab = () => {
//   const [auditTrailList, setAuditTrail] = useState([]);
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [currentPage, setCurrentPage] = useState(1);
//   const notificationsPerPage = 5;
//   const [isVisible, setIsVisible] = useState(false); // State to manage visibility
//   useEffect(() => {
//     const fetchAuditTrail = async () => {
//       setError(null); // Reset error before fetching
//       setLoading(true); // Set loading true when fetching
//       try {
//         const response = await axios.get("/settings/auditTrail/list");
//         setAuditTrail(response.data.data);
//       } catch (err) {
//         setError("Failed to fetch notifications");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchAuditTrail();
//   }, []);

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center">
//         <span className="loader">Loading...</span>
//       </div>
//     );
//   }

//   const columns = [
//     {
//       Header: "Employee ID",
//       accessor: "employeeId",
//       Cell: ({ row, value }) => {
//         return <span className="text-gray-600">{value}</span>;
//       },
//     },

//     {
//       Header: "First Name",
//       accessor: "Admin_Fname",
//       Cell: ({ row, value }) => {
//         return <span className="text-gray-600">{value}</span>;
//       },
//     },
//     {
//       Header: "Last Name",
//       accessor: "Admin_Lname",
//       Cell: ({ row, value }) => {
//         return <span className="text-gray-600">{value}</span>;
//       },
//     },
//     {
//       Header: "Date Time",
//       accessor: "dateTime",
//       Cell: ({ row, value }) => {
//         return (
//           <span className="text-gray-600">
//             {format(value, "MMM dd, yyyy hh:mm:ss a")}
//           </span>
//         );
//       },
//     },
//     {
//       Header: "Action",
//       accessor: "action",
//       Cell: ({ row, value }) => {
//         return <span className="text-yellow-500">{value}</span>;
//       },
//     },
//   ];

//   return (
//     <div className="w-full bg-white shadow-md rounded-lg p-4">
//       <div className="flex justify-between items-center mb-4">
//         <h2 className="text-lg font-semibold">Audit Trail</h2>
//       </div>
//       <div>
//         <Table
//           style={{ overflow: "wrap" }}
//           className="table-sm"
//           columns={columns}
//           data={auditTrailList || []}
//         />
//       </div>

//       {error && <p className="text-red-500 mt-2">{error}</p>}
//     </div>
//   );
// };

function InternalPage() {
  const dispatch = useDispatch();
  const [selectedTab, setSelectedTab] = useState("Settings");
  const categories = {
    General: ["Settings", "SMS Editor"],
  };

  const content = {
    Tab1: "Accounts",
    Tab2: "Record Management",
  };

  // Map selectedTab to the corresponding component
  const tabComponents = {
    // Account: <Tab1Content />,
    Settings: <PricingTab />,
    "Loan Interest": <PricingTab />,
    // Notifications: <NotificationsTab />,
    // Accounts: <AccountSettingsTab />,
    // "Record Management": <RecordManagementTab />,
    // "Audit Trail": <AuditTrailTab />,
    "SMS Editor": <SMSTab />,
  };

  useEffect(() => {
    dispatch(setPageTitle({ title: "Settings" }));
  }, []);

  return (
    <div className="flex h-screen">
      {/* Sidebar for vertical tabs */}
      <div className="w-1/4 p-4 bg-gray-50">
        <div className="space-y-4">
          {Object.entries(categories).map(([category, tabs]) => (
            <div key={category}>
              <h2 className="mb-2 font-bold text-gray-700 text-xl ">
                {category}
              </h2>
              <div className="flex flex-col space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    className={`p-2 text-left ${
                      selectedTab === tab
                        ? "bg-orange-300 text-white"
                        : "bg-white text-gray-800"
                    } rounded-md`}
                    onClick={() => setSelectedTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main content area */}
      <div className="w-3/4 p-4 bg-gray-50">
        <div className="text-xl font-bold"> {tabComponents[selectedTab]}</div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default InternalPage;
