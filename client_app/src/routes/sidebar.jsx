import axios from 'axios';
import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import checkAuth from '../app/auth';
import {
  Squares2X2Icon,
  UsersIcon,
  PresentationChartLineIcon,
  BanknotesIcon,
  DocumentChartBarIcon,
  CogIcon,
  IdentificationIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';

const iconClasses = 'h-6 w-6';
import { NavLink, Routes, Link, useLocation } from 'react-router-dom';
import SidebarSubmenu from '../containers/SidebarSubmenu';
const AppRoutes = () => {
  const [accountSettings, setAccountSettings] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [isLoaded, setIsLoaded] = useState([]);

  const [selectedUserId, setSelectedUserId] = useState('');

  const fetchAccountSettings = async () => {
    try {

      const token = checkAuth();
      const decoded = jwtDecode(token);
      let role = decoded.role;



      // console.log({ decoded })

      setSelectedUserId(decoded.user_id)

      setIsLoaded(true)



      const newRoutes = [];
      let result = []




      if (role === 'borrower') {
        newRoutes.push({
          path: '/app/dashboard',
          icon: <Squares2X2Icon className={iconClasses} />,
          name: 'Dashboard',
        });



      }



      if (role === 'Borrower') {

        //  console.log({ selectedUserId })
        newRoutes.push({
          path: '/app/dashboard',
          icon: <Squares2X2Icon className={iconClasses} />,
          name: 'Dashboard',
        });
        newRoutes.push({
          path: `/app/userProfile/${selectedUserId}`,
          icon: <Squares2X2Icon className={iconClasses} />,
          name: 'Profile',
        });


        newRoutes.push({
          path: '/app/loan_application',
          icon: <Squares2X2Icon className={iconClasses} />,
          name: 'My Loans',
        });
        newRoutes.push({
          path: '/app/payments',
          icon: <Squares2X2Icon className={iconClasses} />,
          name: 'Payments',
        });

        newRoutes.push({
          path: '/app/docs',
          icon: <Squares2X2Icon className={iconClasses} />,
          name: 'Documents and Resources',
        });
      }

      if (role === 'Loan Officer') {


        newRoutes.push({
          path: '/app/dashboard',
          icon: <Squares2X2Icon className={iconClasses} />,
          name: 'Dashboard',
        });

        newRoutes.push({
          path: '/app/loan_management',
          icon: <Squares2X2Icon className={iconClasses} />,
          name: 'Loan Management',
        });

        newRoutes.push({
          path: '/app/payments',
          icon: <Squares2X2Icon className={iconClasses} />,
          name: 'Payments',
        });

        newRoutes.push({
          path: '/app/borrowers',
          icon: <Squares2X2Icon className={iconClasses} />,
          name: 'Borrowers',
        });

        newRoutes.push({
          path: '/app/sms_logs',
          icon: <Squares2X2Icon className={iconClasses} />,
          name: 'SMS Logs',
        });


        newRoutes.push({
          path: '/app/online_forms',
          icon: <Squares2X2Icon className={iconClasses} />,
          name: 'Online Forms',
        });

        // newRoutes.push({
        //   path: '/app/loan_details/:loanId',
        //   icon: <Squares2X2Icon className={iconClasses} />,
        //   name: 'Loan Details',
        // });


      }





      newRoutes.push({
        path: '/app/settings',
        icon: <CogIcon className={iconClasses} />,
        name: 'Settings',
      });


      setRoutes(newRoutes);
    } catch (error) {
      console.error('Error fetching account settings:', error);
    }
  };

  useEffect(() => {
    fetchAccountSettings();
  }, [selectedUserId]);




  return isLoaded && <div>
    {
      routes.map((route, k) => {


        return (
          <li className="p-4 text-center" key={k}>
            {route.submenu ? (
              <SidebarSubmenu {...route} />
            ) : (
              <NavLink
                end
                to={route.path}
                className={({ isActive }) =>
                  `${isActive ? 'font-bold text-white bg-blue-900 shadow-2xl' : ''}`
                }>
                {route.icon} {route.name}
                {location.pathname === route.path ? (
                  <span
                    className="absolute inset-y-0 left-0 w-2 rounded-tr-md rounded-br-md"
                    aria-hidden="true"></span>
                ) : null}
              </NavLink>
            )}
          </li>
        );
      })
    }

  </div>




};

export default AppRoutes;
