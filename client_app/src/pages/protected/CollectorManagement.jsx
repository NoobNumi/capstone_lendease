import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../features/common/headerSlice';

import CollectorManagement from "../../features/collectorManagement";




function InternalPage() {
  const dispatch = useDispatch();
  let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
  useEffect(() => {
    dispatch(setPageTitle({
      title: 'Collectors'
    }));
  }, []);

  return <CollectorManagement/>;
}

export default InternalPage;
