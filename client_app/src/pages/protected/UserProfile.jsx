import { useState, useRef, useEffect } from 'react'
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom'
import UserProfile from '../features/user/UserProfile'
import { setPageTitle } from '../features/common/headerSlice';

function ExternalPage() {
    const dispatch = useDispatch();
    let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    useEffect(() => {
        dispatch(setPageTitle({ title: 'My Profile' }));
    }, []);


    return (
        <div className="">
            <UserProfile />
        </div>
    )
}

export default ExternalPage