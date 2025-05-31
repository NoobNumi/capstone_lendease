// All components mapping with path for internal routes

import { lazy } from "react";
import { jwtDecode } from "jwt-decode";
import checkAuth from "../app/auth";

const Dashboard = lazy(() => import("../pages/protected/Dashboard"));

const Welcome = lazy(() => import("../pages/protected/Welcome"));
const Page404 = lazy(() => import("../pages/protected/404"));
const Blank = lazy(() => import("../pages/protected/Blank"));

const Users = lazy(() => import("../pages/protected/Transactions"));
const Employees = lazy(() => import("../pages/protected/Employees"));
const Suppliers = lazy(() => import("../pages/protected/Suppliers"));
const Transactions = lazy(() =>
  import("../pages/protected/Transactions_Sales")
);
const Layaway = lazy(() => import("../pages/protected/Layaway"));
const Settings = lazy(() => import("../pages/protected/Settings"));
const Reports = lazy(() => import("../pages/protected/Reports"));
const DetailedBorrowerAccounts = lazy(() =>
  import("../features/detailedBorrowerAccounts")
);
const Statistics = lazy(() => import("../pages/protected/Statistics"));

const ProfileSettings = lazy(() =>
  import("../pages/protected/ProfileSettings")
);
const UserProfile = lazy(() => import("../pages/UserProfile"));

const PaymentHistory = lazy(() => import("../features/paymentHistory"));

const SMSLogs = lazy(() => import("../pages/SMSLogs"));

const GettingStarted = lazy(() => import("../pages/GettingStarted"));
const DocFeatures = lazy(() => import("../pages/DocFeatures"));
const DocComponents = lazy(() => import("../pages/DocComponents"));
const AddMember = lazy(() => import("../pages/protected/Leads"));

const Inventory = lazy(() => import("../pages/protected/Inventory"));

const FAQ = lazy(() => import("../pages/protected/Faq"));
const LoanApplication = lazy(() =>
  import("../pages/protected/LoanApplication")
);
const LoanManagement = lazy(() => import("../pages/protected/LoanManagement"));
const BorrowersManagement = lazy(() =>
  import("../pages/protected/BorrowersManagement")
);

const LoanOfficerManagement = lazy(() =>
  import("../pages/protected/LoanOfficerManagement")
);

const CollectorManagement = lazy(() =>
  import("../pages/protected/CollectorManagement")
);

const LoanDetails = lazy(() => import("../pages/protected/LoanDetails"));

const Disbursement = lazy(() => import("../pages/protected/Disbursement"));

const Register = lazy(() => import("../pages/Register"));

const FinancialManagement = lazy(() =>
  import("../pages/protected/FinancialManagement")
);

const Collections = lazy(() => import("../pages/protected/Collections"));

const Collection_records = lazy(() =>
  import("../pages/protected/Collection_records")
);

const token = checkAuth();

const decoded = jwtDecode(token);

let routes = [];

routes = [
  {
    path: "/dashboard", // the url
    component: Dashboard, // view rendered
  },
  {
    path: "/dashboard", // the url
    component: Dashboard, // view rendered
  },

  {
    path: "/stats", // the url
    component: Statistics, // view rendered
  },

  {
    path: "/settings-profile",
    component: Settings,
  },
  {
    path: "/settings-profile/:slug",
    component: Settings,
  },

  {
    path: "/404",
    component: Page404,
  },
  {
    path: "/blank",
    component: Blank,
  },
  {
    path: "/users",
    component: Users,
  },
  {
    path: "/addMember",
    component: AddMember,
  },
  {
    path: "/reports", // the url
    component: Reports, // view rendered
  },
  {
    path: "/employees",
    component: Employees,
  },
  {
    path: "/suppliers",
    component: Suppliers,
  },
  {
    path: "/transactions",
    component: Transactions,
  },
  {
    path: "/inventory",
    component: Inventory,
  },
  {
    path: "/layaway",
    component: Layaway,
  },
  {
    path: "/settings",
    component: Settings,
  },
  {
    path: "/userProfile/:userId",
    component: UserProfile,
  },
  {
    path: "/faq",
    component: FAQ,
  },

  {
    path: "/loan_application",
    component: LoanApplication,
  },

  {
    path: "/disbursement",
    component: Disbursement,
  },

  {
    path: "/loan_management",
    component: LoanManagement,
  },
  {
    path: "/loan_details/:loanId",
    component: LoanDetails,
  },
  {
    path: "/loan_details/:loanId/selectedTableRowIndex/:rowIndex",
    component: LoanDetails,
  },
  {
    path: "/sms_logs",
    component: SMSLogs,
  },
  {
    path: "/borrowers",
    component: BorrowersManagement,
  },
  {
    path: "/loan_officers",
    component: LoanOfficerManagement,
  },

  {
    path: "/collectors",
    component: CollectorManagement,
  },

  {
    path: "/register_now",
    component: Register,
  },

  {
    path: "/financial-management",
    component: FinancialManagement,
  },
  {
    path: "/detailed_borrowers",
    component: DetailedBorrowerAccounts,
  },
  {
    path: "/payment_history",
    component: PaymentHistory,
  },
  {
    path: "/collections",
    component: Collections,
  },
  {
    path: "/collection_records",
    component: Collection_records,
  },
];

export default routes;
