import axios from 'axios';

const checkAuth = () => {
  /*  Getting token value stored in localstorage, if token is not present we will open login page 
    for all internal dashboard routes  */
  const TOKEN = localStorage.getItem('token');

  const PUBLIC_ROUTES = [
    '', // Add empty string for root path
    '/', // Add slash for root path
    'home',
    'login',
    'forgot-password',
    'register',
    'documentation',
    'myprofile',
    'reset-password',
    'register',
    'verify-email',
    'reset-password',
    'verify-email'
  ];

  // Get the current path
  const currentPath = window.location.pathname;

  // Check if current path is public
  const isPublicPage = PUBLIC_ROUTES.some(
    route =>
      currentPath === '/' + route ||
      currentPath === route ||
      currentPath === '/'
  );

  // Only redirect to login if:
  // 1. There's no token AND
  // 2. It's not a public page
  // if (!TOKEN && !isPublicPage) {
  //   window.location.href = '/login';
  //   return;
  // }

  // Set up axios defaults and interceptors only if token exists
  if (TOKEN) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${TOKEN}`;

    axios.interceptors.request.use(
      function (config) {
        // UPDATE: Add this code to show global loading indicator
        document.body.classList.add('loading-indicator');
        return config;
      },
      function (error) {
        return Promise.reject(error);
      }
    );

    axios.interceptors.response.use(
      function (response) {
        // UPDATE: Add this code to hide global loading indicator
        document.body.classList.remove('loading-indicator');
        return response;
      },
      function (error) {
        document.body.classList.remove('loading-indicator');
        return Promise.reject(error);
      }
    );
  }

  return TOKEN;
};

export default checkAuth;
