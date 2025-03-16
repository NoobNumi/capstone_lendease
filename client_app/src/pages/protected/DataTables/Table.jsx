import React from 'react';
import { useEffect, useMemo, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  useTable,
  useFilters,
  useGlobalFilter,
  useAsyncDebounce,
  useSortBy,
  usePagination
} from 'react-table';
import {
  ChevronDoubleLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleRightIcon
} from '@heroicons/react/24/outline';

import { Button, PageButton } from './shared/Button';
import { classNames } from './shared/Utils';
import { SortIcon, SortUpIcon, SortDownIcon } from './shared/Icons';

import QRCode from 'react-qr-code';
import { format, formatDistance, formatRelative, subDays } from 'date-fns';

import { Calendar } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
// Define a default UI for filtering
import { DateRangePicker } from 'react-date-range';

import { CSVLink } from 'react-csv';
export const Filter = ({ column }) => {
  return (
    <div style={{ marginTop: 5 }}>
      {column.canFilter && column.render('Filter')}
    </div>
  );
};

export const DefaultColumnFilter = ({
  column: {
    filterValue,
    setFilter,
    preFilteredRows: { length }
  }
}) => {
  return (
    <input
      value={filterValue || ''}
      onChange={e => {
        setFilter(e.target.value || undefined);
      }}
      className="mt-2 p-2 rounded-md border-slate-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 w-100 border-2 border-slate-300 h-50"
      placeholder={`Search`}></input>
  );
};

export const DateColumnFilter = ({
  column: { filterValue = [], preFilteredRows, setFilter, id }
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);
  const [selectionRange, setSelectionRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: 'selection'
  });

  const handleClickOutside = event => {
    if (ref.current && !ref.current.contains(event.target)) {
      setIsOpen(false);
    }
  };
  useEffect(() => {
    document.addEventListener('click', handleClickOutside, true);
    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, []);

  return (
    <>
      <span
        className="fa-solid fa-filter mt-2 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}></span>
      {isOpen && (
        <div ref={ref} className="">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
            <DateRangePicker
              className="shadow-lg left"
              ranges={[selectionRange]}
              onChange={ranges => {
                let { startDate, endDate, selection } = ranges.selection;

                let dateStart = startDate;

                setFilter((old = []) => [
                  dateStart ? new Date(startDate) : undefined,
                  endDate ? new Date(endDate) : undefined
                ]);

                let selected = {
                  startDate: new Date(startDate),
                  endDate: new Date(endDate),
                  key: 'selection'
                };
                setSelectionRange(selected);

                if (startDate !== endDate) {
                  setIsOpen(false);
                }
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};

// export const SelectColumnFilter = ({
//   column: { filterValue, setFilter, preFilteredRows, id }
// }) => {
//   const options = React.useMemo(() => {
//     const options = new Set();
//     preFilteredRows.forEach(row => {
//       options.add(row.values[id]);
//     });
//     return [...options.values()];
//   }, [id, preFilteredRows]);

//   return (
//     <select
//       id="custom-select"
//       type="select"
//       value={filterValue}
//       onChange={e => {
//         setFilter(e.target.value || undefined);
//       }}>
//       <option value="">Todos</option>
//       {options.map(option => (
//         <option key={option} value={option}>
//           {option}
//         </option>
//       ))}
//     </select>
//   );
// };

export function dateBetweenFilterFn(rows, id, dateFilterValues) {
  let filterValues = dateFilterValues.sort(function (a, b) {
    // Turn your strings into dates, and then subtract them
    // to get a value that is either negative, positive, or zero.
    return new Date(a) - new Date(b);
  });

  console.log({ filterValues });
  let sd = filterValues[0] ? Date.parse(filterValues[0]) : undefined;
  let ed = filterValues[1] ? Date.parse(filterValues[1]) : undefined;

  if (sd === ed) {
    ed = filterValues[0].setDate(filterValues[0].getDate() + 1);

    console.log({ ed });
  }

  console.log({ sd, ed });

  if (ed || sd) {
    return rows.filter(r => {
      const cellDate = r.values[id];

      // console.log({ cellDate });

      return sd <= cellDate && ed >= cellDate;
    });
    return rows;
  } else {
    return rows;
  }
}

export function DateRangeColumnFilter({
  column: { filterValue = [], preFilteredRows, setFilter, id }
}) {
  const [min, max] = React.useMemo(() => {
    let min = preFilteredRows.length
      ? new Date(preFilteredRows[0].values[id])
      : new Date(0);
    let max = preFilteredRows.length
      ? new Date(preFilteredRows[0].values[id])
      : new Date(0);

    preFilteredRows.forEach(row => {
      const rowDate = new Date(row.values[id]);

      min = rowDate <= min ? rowDate : min;
      max = rowDate >= max ? rowDate : max;
    });

    return [min, max];
  }, [id, preFilteredRows]);

  return (
    <div>
      <input
        //min={min.toISOString().slice(0, 10)}
        onChange={e => {
          const val = e.target.value;
          setFilter((old = []) => [val ? val : undefined, old[1]]);
        }}
        type="date"
        value={filterValue[0] || ''}
      />
      {' to '}
      <input
        //max={max.toISOString().slice(0, 10)}
        onChange={e => {
          const val = e.target.value;
          setFilter((old = []) => [
            old[0],
            val ? val.concat('T23:59:59.999Z') : undefined
          ]);
        }}
        type="date"
        value={filterValue[1]?.slice(0, 10) || ''}
      />
    </div>
  );
}

function GlobalFilter({ preGlobalFilteredRows, globalFilter, setGlobalFilter, searchField = '' }) {
  return (
    <div className="flex hidden-print">
      <label className="flex gap-x-2 items-baseline p-2">
        <span className="text-gray-700">Search: </span>
        <input
          type="text"
          className="p-2 rounded-md border-slate-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 w-100 border-2 border-slate-300 h-90"
          value={globalFilter || ''}
          onChange={e => setGlobalFilter(e.target.value)}
          name={searchField || `Code name`}
        />
      </label>
    </div>
  );
}


// This is a custom filter UI for selecting
// a unique option from a list
export function SelectColumnFilter({
  column: { filterValue, setFilter, preFilteredRows, id, render }
}) {
  // Calculate the options for filtering
  // using the preFilteredRows
  const options = React.useMemo(() => {
    const options = new Set();
    preFilteredRows.forEach(row => {
      options.add(row.values[id]);
    });
    return [...options.values()];
  }, [id, preFilteredRows]);

  // // Render a multi-select box
  // const appSettings = useSelector(state => state.appSettings);
  // let { codeTypeList, packageList } = appSettings;

  return (
    <div className="flex w-full">
      {/* <span className="text-gray-700">{render('Header')}: </span> */}
      <select
        className="w-full p-2 mt-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 border-2 border-slate-300 text-sm"
        name={id}
        id={id}
        value={filterValue}
        onChange={e => {
          setFilter(e.target.value || undefined);
        }}>
        <option value="">All</option>
        {[].map((option, i) => {
          let pt = [].find(p => {
            return p.name === option;
          });

          let value = option;
          return (
            <option key={i} value={option}>
              {(pt && pt.displayName) || option}
            </option>
          );
        })}
      </select>
    </div>
  );
}

export function StatusPill({ value }) {
  const status = value ? value.toLowerCase() : 'unknown';

  return (
    <span
      className={classNames(
        'px-3 py-1 uppercase leading-wide font-bold text-xs rounded-full shadow-sm',
        status.startsWith('available') ? 'bg-green-100 text-green-800' : null,
        status.startsWith('inactive') ? 'bg-yellow-100 text-yellow-800' : null,
        status.startsWith('used') ? 'bg-red-100 text-red-800' : null,
        status.startsWith('available') ? 'bg-green-100 text-green-800' : null,
        status.startsWith('pending') ? 'bg-yellow-100 text-yellow-800' : null,
        status.startsWith('approve') ? 'bg-green-100 text-green-800' : null,
        status.startsWith('hold') ? 'bg-red-100 text-red-800' : null,
        status.startsWith('complete') ? 'bg-lime-100 text-lime-800' : null,
        status.startsWith('unhold') ? 'bg-lime-100 text-lime-800' : null,
        status.startsWith('free_slot') ? 'bg-yellow-100 text-yellow-800' : null,
        status.startsWith('partially_paid') ? 'bg-yellow-100 text-yellow-800' : null,
        status.startsWith('paid') ? 'bg-green-100 text-green-800' : null,
        status.startsWith('overdue') ? 'bg-red-100 text-red-800' : null,
        status.startsWith('rejected') ? 'bg-red-100 text-red-800' : null,
        status.startsWith('in_progress') ? 'bg-orange-100 text-orange-800' : null,
        status.startsWith('payment_for_approval') ? 'bg-yellow-100 text-yellow-800' : null,
        status.startsWith('soon') ? 'bg-yellow-100 text-yellow-800' : null,
      )}>
      {status}
    </span>
  );
}

export function DateCell({ value }) {
  let date = value ? format(value, 'MMM dd, yyyy hh:mm:ss a') : 'N/A';

  return <span className="text-sm text-gray-500">{date}</span>;
}

export function AvatarCell({ value, column, row }) {
  return (
    <div className="flex items-center">
      <div className="flex-shrink-0 h-10 w-10">
        {value && (
          <QRCode
            value={value}
            style={{
              height: 'auto',
              maxWidth: '100%',
              width: '100%'
            }}
          />
        )}
      </div>
      <div className="ml-4">
        <div className="text-sm font-medium text-gray-900">{value}</div>
        <div className="text-sm text-gray-500">
          {row.original[column.emailAccessor]}
        </div>
      </div>
    </div>
  );
}

function Table({ columns, data, searchField }) {
  // Use the state and functions returned from useTable to build your UI

  const {
    rows,
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page, // Instead of using 'rows', we'll use page,
    // which has only the rows for the active page

    // The rest of these things are super handy, too ;)
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,

    state,
    preGlobalFilteredRows,
    setGlobalFilter,
    state: { pageIndex, pageSize, globalFilter },
    footerGroups
  } = useTable(
    {
      columns,
      data,
      searchField
    },

    useFilters, // useFilters!
    useGlobalFilter,
    useSortBy,
    usePagination // new,
  );

  // Render the UI for your table

  function getHeader(column) {
    if (column.totalHeaderCount === 1 || !column.totalHeaderCount) {
      return [
        {
          value: column.Header,
          type: 'string'
        }
      ];
    } else {
      const span = [...Array(column.totalHeaderCount - 1)].map(x => ({
        value: '',
        type: 'string'
      }));
      return [
        {
          value: column.Header,
          type: 'string'
        },
        ...span
      ];
    }
  }

  // let csvData = rows.map(current => {
  //   let entry = current.values;

  //   return Object.keys(entry).reduce((acc, key) => {
  //     let finalValue = entry[key];

  //     let mydate = new Date(finalValue).getTime();

  //     var startTime = new Date('1/1/1970').getTime() * -1;

  //     if (mydate > startTime) {
  //       finalValue = format(finalValue, 'MMM dd, yyyy hh:mm:ss a');
  //     }

  //     if (!finalValue) {
  //       return {
  //         ...acc
  //       };
  //     } else {
  //       return {
  //         ...acc,
  //         [key]: finalValue
  //       };
  //     }
  //   }, []);
  // });

  let csvData = rows.map(current => {
    let entry = current.values;

    return Object.keys(entry).reduce((acc, key) => {
      return {
        ...acc,
        [key]: entry[key]
      };
    }, []);
  });

  // console.log({ rows });

  let dataSet = [];

  headerGroups.forEach(headerGroup => {
    const headerRow = [];
    if (headerGroup.headers) {
      headerGroup.headers.forEach(column => {
        headerRow.push(
          ...getHeader(column)
            // .filter(d => {
            //   return d.value !== 'Action' || d.value !== 'Actions';
            // })
            .map(h => {
              return h.value;
            })
        );
      });
    }

    dataSet.push(
      headerRow.filter(v => !['Action', 'Actions', 'Income Type'].includes(v))
    );
  });

  // FILTERED ROWS

  if (rows.length > 0) {
    rows.forEach(row => {
      const dataRow = [];

      Object.values(row.values).forEach(value => {
        // check value type

        let finalValue = value;

        try {
          let mydate = new Date(finalValue).getTime();

          var startTime = new Date('1/1/1970').getTime() * -1;

          if (mydate > startTime) {
            dataRow.push(format(finalValue, 'MMM dd, yyyy hh:mm:ss a'));
          } else {
            dataRow.push(finalValue);
          }
        } catch (error) {
          // dataRow.push(finalValue);
        }

        // if (!isDate(parseISO(mydate)) || !isValid(parseISO(mydate))) {
        //   console.log({ finalValue });
        //   // dataRow.push(format(validDate, 'MMM dd, yyyy hh:mm:ss a'));
        // } else {
        //   dataRow.push(finalValue);
        // }
      });

      dataSet.push(dataRow.filter(v => !!v));
    });
  } else {
    dataSet.push([
      {
        value: 'No data'
      }
    ]);
  }

  return (
    <>
      <div className="sm:flex sm:gap-x-2 d-flex flex-row justify-between hidden-print">
        {/* <div
          tabIndex={0}
          role="button"
          className="btn m-1 bg-yellow-500 text-white btn-sm">
          {' '}
          <i class="fa-solid fa-file-export"></i>
          <CSVLink className="downloadbtn" filename="report.csv" data={dataSet}>
            Export
          </CSVLink>
        </div> */}
        <div></div>
        <GlobalFilter
          preGlobalFilteredRows={preGlobalFilteredRows}
          globalFilter={state.globalFilter}
          setGlobalFilter={setGlobalFilter}
          searchField={searchField}
        />
        {/* {headerGroups.map(headerGroup =>
          headerGroup.headers.map(column =>
            column.Filter ? (
              <div className="mt-2 sm:mt-0" key={column.id}>
                {column.render('Filter')}
              </div>
            ) : null
          )
        )} */}
      </div>
      {/* table */}
      <div className="mt-2 flex flex-col p-0">
        <div className="-my-2 overflow-x-auto -mx-4 sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow-lg rounded-xl border border-gray-200 bg-white overflow-hidden">
              <table {...getTableProps()} className="min-w-full divide-y divide-gray-200 table-sm">
                <thead>
                  {headerGroups.map(headerGroup => (
                    <tr {...headerGroup.getHeaderGroupProps()} className="bg-gradient-to-r from-gray-50 to-gray-100">
                      {headerGroup.headers.map(column => (
                        <th
                          scope="col"
                          className="group px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                        >
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2">
                              {column.render('Header')}
                              {column.isSorted && (
                                <span className={`transition-colors duration-200 ${column.isSorted ? 'text-blue-500' : 'text-gray-400'
                                  }`}>
                                  {column.isSortedDesc ? (
                                    <SortDownIcon className="w-4 h-4" />
                                  ) : (
                                    <SortUpIcon className="w-4 h-4" />
                                  )}
                                </span>
                              )}
                            </span>
                          </div>
                          {column.canFilter && column.Filter && (
                            <div className="mt-2">{column.render('Filter')}</div>
                          )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>

                <tbody {...getTableBodyProps()} className="divide-y divide-gray-200 bg-white">
                  {page.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-6 py-8 text-center text-gray-500 bg-gray-50"
                      >
                        <div className="flex flex-col items-center justify-center gap-2">
                          <svg
                            className="w-12 h-12 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1}
                              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                            />
                          </svg>
                          <span className="font-medium">No data available</span>
                          <span className="text-sm">Try adjusting your search or filters</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    page.map((row, i) => {
                      prepareRow(row);
                      return (
                        <tr
                          {...row.getRowProps()}
                          className="odd:bg-white even:bg-gray-50 hover:bg-blue-50/50 transition-colors duration-150"
                        >
                          {row.cells.map(cell => (
                            <td
                              {...cell.getCellProps()}
                              className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap"
                            >
                              <div className="flex items-center">
                                {cell.column.Cell.name === 'defaultRenderer' ? (
                                  <span className="font-medium">{cell.render('Cell')}</span>
                                ) : (
                                  cell.render('Cell')
                                )}
                              </div>
                            </td>
                          ))}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {/* Pagination */}
      <div className="py-4 flex items-center justify-between bg-white border-t border-gray-200">
        <div className="flex-1 flex justify-between items-center px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">
              Showing <span className="font-medium">{page.length}</span> of{' '}
              <span className="font-medium">{data.length}</span> results
            </span>
            <select
              className="ml-2 px-3 py-1 text-sm border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              value={state.pageSize}
              onChange={e => setPageSize(Number(e.target.value))}
            >
              {[5, 10, 20, 30, 40, 50].map(pageSize => (
                <option key={pageSize} value={pageSize}>
                  Show {pageSize}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => previousPage()}
              disabled={!canPreviousPage}
              className={`px-3 py-1 text-sm font-medium rounded-md ${!canPreviousPage
                  ? 'text-gray-400 bg-gray-100'
                  : 'text-gray-700 bg-white hover:bg-gray-50 border border-gray-300'
                }`}
            >
              Previous
            </button>
            <button
              onClick={() => nextPage()}
              disabled={!canNextPage}
              className={`px-3 py-1 text-sm font-medium rounded-md ${!canNextPage
                  ? 'text-gray-400 bg-gray-100'
                  : 'text-gray-700 bg-white hover:bg-gray-50 border border-gray-300'
                }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Table;
