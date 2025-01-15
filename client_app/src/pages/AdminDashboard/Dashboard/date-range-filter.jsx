import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import Calendar from 'react-calendar'; // Import Calendar

import Datepicker from "react-tailwindcss-datepicker";
import moment from 'moment-timezone'; // Import moment-timezone

export default function DateRangeFilter({ onFilterChange,
  setDateRange }) {
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();

  const handleRangeChange = (range) => {
    const now = new Date();
    let start = new Date();
    let end = new Date();

    switch (range) {
      case 'week':
        start.setDate(now.getDate() - 7);
        break;
      case 'month':
        start.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        start.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return;
    }

    setStartDate(start);
    setEndDate(end);
    onFilterChange(start, end);
  };

  const handleCustomRange = (date) => {
    if (startDate && !endDate) {
      setEndDate(date);
      onFilterChange(startDate, date);
    } else {
      setStartDate(date);
      setEndDate(undefined);
    }
  };

  const [selectedDate, setValue] = useState({
    start: new Date(), // Set your default date here
    end: new Date(),
  });



  useEffect(() => {

    console.log("change")

    // console.log({
    //   selectedDate,
    //   setDateRange
    // })


    // setDateRange(selectedDate.startDate, selectedDate.endDate);
    const { startDate, endDate } = selectedDate;
    if (startDate && endDate) {
      onFilterChange(startDate, endDate);
    }

    // setStartDate(start);
    // setEndDate(end);
    // onFilterChange(start, end);


  }, [selectedDate.start, selectedDate.end, selectedDate]);



  // setStartDate(start);
  // setEndDate(end);
  // onFilterChange(start, end);


  return (
    <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
      {/* <div className="relative">
        <select
          className="w-full sm:w-[180px] p-2 border border-gray-300 rounded-md p-4"
          onChange={(e) => handleRangeChange(e.target.value)}
        >
          <option value="">Select range</option>
          <option value="week">Last 7 days</option>
          <option value="month">Last 30 days</option>
          <option value="year">Last year</option>
        </select>
      </div> */}

      <div className="relative">
        <div className="px-4 py-2 border border-gray-300 relative">
          <Datepicker
            showShortcuts={true}
            placeholder="Select Date"
            value={selectedDate}
            onChange={(newValue) => {
              setValue(newValue);
              // console.log(moment.tz(new Date(selectedDate.startDate), 'Asia/Manila').toDate())
            }}
            popperProps={{
              modifiers: [
                {
                  name: "zIndex",
                  enabled: true,
                  phase: "beforeWrite",
                  fn: ({ state }) => {
                    state.styles.popper.zIndex = 1050; // Set high z-index
                  },
                },
              ],
            }}
            classNames={{
              popper: "z-[1050] shadow-lg", // Ensure high z-index
            }}
          />
        </div>
        {/* <button
          className={`w-full sm:w-[300px] p-2 text-left border border-gray-300 rounded-md ${!startDate ? 'text-gray-400' : 'text-black'
            }`}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {startDate ? (
            endDate ? (
              <>
                {format(startDate, 'LLL dd, y')} - {format(endDate, 'LLL dd, y')}
              </>
            ) : (
              format(startDate, 'LLL dd, y')
            )
          ) : (
            <span>Pick a date range</span>
          )}
        </button> */}

        {/* Simple calendar popover */}
        {startDate && !endDate && (
          <div className="absolute top-full mt-2 p-4 bg-white border border-gray-300 rounded-md shadow-lg w-64">
            <Calendar
              mode="range"
              selected={{ from: startDate, to: endDate }}
              onChange={(range) => handleCustomRange(range[0])} // Adjusted this to properly handle range
              value={startDate ? [startDate, endDate] : []} // Ensure the selected dates are highlighted
            />
          </div>
        )}
      </div>
    </div>
  );
}
