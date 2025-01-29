import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../features/common/headerSlice';

import LoanOfficerManagement from '../../features/loanOfficerManagement';

function InternalPage() {
  const dispatch = useDispatch();
  let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
  useEffect(() => {
    dispatch(setPageTitle({ title: 'Loan Officers' }));
  }, []);

  return <LoanOfficerManagement role={'Loan Officer'} />;
}

export default InternalPage;
