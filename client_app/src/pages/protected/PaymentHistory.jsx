import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setPageTitle } from "../../features/common/headerSlice";

import PaymentHistory from "../../features/paymentHistory";

function InternalPage() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(setPageTitle({ title: "Payment History" }));
  }, [dispatch]);

  return <PaymentHistory />;
}

export default InternalPage;
