import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import checkAuth from '../app/auth';
import { NavLink, useLocation } from 'react-router-dom';
import SidebarSubmenu from '../containers/SidebarSubmenu';
import {
  Squares2X2Icon, UsersIcon, PresentationChartLineIcon,
  BanknotesIcon, DocumentChartBarIcon, CogIcon, IdentificationIcon
} from '@heroicons/react/24/outline';

const AppRoutes = () => {
  const [routes, setRoutes] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const location = useLocation(); // for active route styling

  const fetchAccountSettings = async () => {
    try {
      const token = checkAuth();
      const decoded = jwtDecode(token);
      const role = decoded.role;

      setSelectedUserId(decoded.user_id);
      setIsLoaded(true);

      let newRoutes = [];

      // Icon map based on route name
      const iconMap = {
        'My Loans': <PresentationChartLineIcon className="h-6 w-6" />,
        'My Profile': <IdentificationIcon className="h-6 w-6" />,
        'Loan Management': <BanknotesIcon className="h-6 w-6" />,
        'Disbursement': <DocumentChartBarIcon className="h-6 w-6" />,
        'SMS Logs': <UsersIcon className="h-6 w-6" />,
        'Dashboard': <Squares2X2Icon className="h-6 w-6" />,
        'Borrowers': <UsersIcon className="h-6 w-6" />,
        'Loan Officers': <IdentificationIcon className="h-6 w-6" />,
        'Collectors': <BanknotesIcon className="h-6 w-6" />,
        'Settings': <CogIcon className="h-6 w-6" />
      };

      // Dynamic route generation based on user role
      if (role === 'Borrower') {
        newRoutes = [
          { path: '/app/loan_application', name: 'My Loans' },
          { path: `/app/userProfile/${selectedUserId}`, name: 'My Profile' },
        ];
      }

      if (role === 'Collector') {
        newRoutes = [
          { path: '/app/loan_management', name: 'Loan Management' },
        ];
      }

      if (role === 'Loan Officer') {
        newRoutes = [
          { path: '/app/loan_management', name: 'Loan Management' },
          { path: '/app/disbursement', name: 'Disbursement' },
        ];
      }

      if (role === 'Admin') {
        newRoutes = [
          { path: '/app/dashboard', name: 'Dashboard' },
          { path: '/app/loan_management', name: 'Loan Management' },
          { path: '/app/disbursement', name: 'Disbursement' },
          { path: '/app/borrowers', name: 'Borrowers' },
          { path: '/app/loan_officers', name: 'Loan Officers' },
          { path: '/app/collectors', name: 'Collectors' },
          { path: '/app/sms_logs', name: 'SMS Logs' },
          { path: '/app/settings', name: 'Settings' },
        ];
      }

      // Assign icons dynamically based on route name
      newRoutes = newRoutes.map(route => ({
        ...route,
        icon: iconMap[route.name] || <Squares2X2Icon className="h-6 w-6" />
      }));

      setRoutes(newRoutes);
    } catch (error) {
      console.error('Error fetching account settings:', error);
      // Optionally, set some error state here
    }
  };

  useEffect(() => {
    fetchAccountSettings();
  }, [selectedUserId]);

  return isLoaded ? (
    <div>
      {routes.map((route, index) => (
        <li className="p-4 text-center" key={index}>
          {route.submenu ? (
            <SidebarSubmenu {...route} />
          ) : (
            <NavLink
              end
              to={route.path}
              className={({ isActive }) => isActive ? 'font-bold text-white bg-blue-900 shadow-2xl' : ''}>
              {route.icon} {route.name}
              {location.pathname === route.path && (
                <span className="absolute inset-y-0 left-0 w-2 rounded-tr-md rounded-br-md" aria-hidden="true"></span>
              )}
            </NavLink>
          )}
        </li>
      ))}
    </div>
  ) : (
    <div>Loading...</div> // Optionally add a loading spinner or message
  );
};

export default AppRoutes;
