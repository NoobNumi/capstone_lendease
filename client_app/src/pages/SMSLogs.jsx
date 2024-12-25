import { useState, useRef, useEffect } from 'react'
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom'
import SMS from '../features/sms'
import { setPageTitle } from '../features/common/headerSlice';

function ExternalPage() {
    const dispatch = useDispatch();
    let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    useEffect(() => {
        dispatch(setPageTitle({ title: 'SMS Logs' }));
    }, []);


    return (
        <div className="">
            <SMS />
        </div>
    )
}

export default ExternalPage