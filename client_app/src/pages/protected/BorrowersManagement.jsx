import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../features/common/headerSlice';

import BorrowerManagement from '../../features/borrowerManagement';

function InternalPage() {
  const dispatch = useDispatch();
  let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
  useEffect(() => {
    dispatch(setPageTitle({ title: 'Borrowers' }));
  }, []);

  return <BorrowerManagement />;
}

export default InternalPage;
