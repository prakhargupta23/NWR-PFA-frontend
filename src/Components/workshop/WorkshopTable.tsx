import React, { useEffect, useState } from "react";
import {
  Grid,
  Paper,
  Typography,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  CircularProgress,
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import { formatHeader, getMonthYear } from "../../utils/otherUtils";
import { workshopDivisions, months, years } from "../../utils/staticDataUtis";
import { transactionService } from "../../services/transaction.service";
import { WorkshopService }  from "../../services/workshop.service";
import { Label } from "recharts";

interface SheetResponse {
  sheetName: string;
  data: Record<string, any>[];
  comment: { [key: string]: any } | null;
}

const workshopTableConfigs = {
  manufacturingSuspense: {
    columns: [
      'OpeningBalance', 'RBGDebit', 'RBGCredit', 'RBGNet',
      'ExpendituretotheEndofMonthDebit', 'ExpendituretotheEndofMonthCredit', 'ExpendituretotheEndofMonthNet',
      'BalancetotheEndofMonthDebit', 'BalancetotheEndofMonthCredit', 'BalancetotheEndofMonthNet'
    ],
    labels: [
      'Opening Balance', 'RBG Debit', 'RBG Credit', 'RBG Net',
      'Expenditure to End of Month Debit', 'Expenditure to End of Month Credit', 'Expenditure to End of Month Net',
      'Balance to End of Month Debit', 'Balance to End of Month Credit', 'Balance to End of Month Net'
    ]
  },
  wmsBalance: {
    columns: [
      'Particulars', 'ActualLY', 'ActualLLY', 'RGB',
      'BPuptoMonth', 'ActualfortheMonth', 'ActualtotheEndofMonth'
    ],
    labels: [
      'Particulars', 'Actual LY', 'Actual LLY', 'RGB',
      'BP up to Month', 'Actual for the Month', 'Actual to the End of Month'
    ]
  },
  wmsClosingBalance: {
    columns: ['breakUp', 'Amount'],
    labels: ['Break Up', 'Amount']
  },
  wmsBalanceAnalysis: {
    columns: [
      'previousYearNonth', 'previousYearOpeningBalance',
      'previousYearDebit', 'previousYearCredit', 'previousYearClosingBalance',
      'currentYearNonth', 'currentYearOpeningBalance', 'currentYearDebit',
      'currentYearCredit', 'currentYearClosingBalance'
    ],
    labels: [
      'Previous Year Month', 'Previous Year Opening Balance',
      'Previous Year Debit', 'Previous Year Credit', 'Previous Year Closing Balance',
      'Current Year Month', 'Current Year Opening Balance', 'Current Year Debit',
      'Current Year Credit', 'Current Year Closing Balance'
    ]
  },
  wmsStoreCharges: {
    columns: [
      'actualLLYMonth', 'actualLLYAmount',
      'actualLYMonth', 'actualLYAmount', 'actualMonth', 'actualAmount'
    ],
    labels: [
      'Actual LLY Month', 'Actual LLY Amount',
      'Actual LY Month', 'Actual LY Amount', 'Actual Month', 'Actual Amount'
    ]
  },
  positionofDirectPurchase: {
    columns: [
      'actualLLYMonth', 'actualLLYAmount',
      'actualLYMonth', 'actualLYAmount', 'actualMonth', 'actualAmount'
    ],
    labels: [
      'Actual LLY Month', 'Actual LLY Amount',
      'Actual LY Month', 'Actual LY Amount', 'Actual Month', 'Actual Amount'
    ]
  },
  comparativePositionofOutturn: {
    columns: [
      'nameOfActivity', 'targetAnnual', 'targetUptotheMonth',
      'outturnfortheMonth', 'outturnUptotheMonth', 'outturnUptotheMonthofCorrospondingPeriod',
      'difference', 'remarks'
    ],
    labels: [
      'Name of Activity', 'Target Annual', 'Target Up to the Month',
      'Outturn for the Month', 'Outturn Up to the Month', 'Outturn Up to the Month of Corresponding Period',
      'Difference', 'Remarks'
    ]
  },
  pohUnitCost: {
    columns: [
      'nameOfActivity', 'labour', 'material',
      'onCostLabour', 'onCostStore', 'unitCostfortheMonth', 'remarks'
    ],
    labels: [
      'Name of Activity', 'Labour', 'Material',
      'On Cost Labour', 'On Cost Store', 'Unit Cost for the Month', 'Remarks'
    ]
  },
  postingandReconciliation: {
    columns: [
      'suspenseHeads', 'positionasperLHAR',
      'openingBalance', 'accretion', 'clearance', 'closingBalance', 'remarks'
    ],
    labels: [
      'Suspense Heads', 'Position as per LHAR',
      'Opening Balance', 'Accretion', 'Clearance', 'Closing Balance', 'Remarks'
    ]
  },
  itemPositioninSuspenseRegister: {
    columns: [
      'SNo', 'suspenseHeads', 'positionasperLHARitem',
      'positionasperLHARamount', 'openingBalanceitem', 'openingBalanceamount',
      'accretionitem', 'accretionamount', 'clearanceitem', 'clearanceamount',
      'closingBalanceitem', 'closingBalanceamount', 'oldestBalance'
    ],
    labels: [
      'SNo', 'Suspense Heads', 'Position as per LHAR Item',
      'Position as per LHAR Amount', 'Opening Balance Item', 'Opening Balance Amount',
      'Accretion Item', 'Accretion Amount', 'Clearance Item', 'Clearance Amount',
      'Closing Balance Item', 'Closing Balance Amount', 'Oldest Balance'
    ]
  },
  unsanctionedExpenditure: {
    columns: [
      'SNo', 'suspenseHeads', 'positionasperLHARitem',
      'positionasperLHARamount', 'openingBalanceitem', 'openingBalanceamount',
      'accretionitem', 'accretionamount', 'clearanceitem', 'clearanceamount',
      'closingBalanceitem', 'closingBalanceamount', 'oldestBalance'
    ],
    labels: [
      'S.No', 'Suspense Heads', 'Position as per LHAR Item',
      'Position as per LHAR Amount', 'Opening Balance Item', 'Opening Balance Amount',
      'Accretion Item', 'Accretion Amount', 'Clearance Item', 'Clearance Amount',
      'Closing Balance Item', 'Closing Balance Amount', 'Oldest Balance'
    ]
  },
  inspectionPara: {
    columns: [
      'accretionitem', 'typeOfPara', 'totalNoOfParas',
      'noOfParasOutstandingatStart', 'noOfParasClosed', 'noOfParasOutstandingatEnd',
      'remarks'
    ],
    labels: [
      'Year of Report', 'Type of Para', 'Total No of Paras',
      'No of Paras Outstanding at Start', 'No of Paras Closed', 'No of Paras Outstanding at End',
       'Remarks'
    ]
  },
  outstandingAuditObjection: {
    columns: [
      'SNo', 'typeOfAuditObjection', 'positionasperLHY',
      'openingBalance', 'accretion', 'clearenceOverOneYearOld', 'clearenceLessthanOneYearOld',
      'totalClearence', 'closingBalance'
    ],
    labels: [
      'S.No', 'Type of Audit Objection', 'Position as per LHY',
      'Opening Balance', 'Accretion', 'Clearance Over One Year Old', 'Clearance Less than One Year Old',
      'Total Clearance', 'Closing Balance'
    ]
  },
  analysisOfAuditReference: {
    columns: [
      'SNo', 'typeOfAuditObjection', 'closingBalance',
      'overSixMonthOld', 'overOneYearOld', 'overThreeYearOld', 'lessThanSixMonthOld'
    ],
    labels: [
      'S.No', 'Type of Audit Objection', 'Closing Balance',
      'Over Six Month Old', 'Over One Year Old', 'Over Three Year Old', 'Less Than Six Month Old'
    ]
  },
  positionOfAccountInspection: {
    columns: [
      'particular', 'noOfInspectionsDue',
      'noOfOfficesInspected', 'moneyValueInvolvedinInspections', 'recoveries',
      'noOfInspectionsOutstanding', 'reasonsForArrears'
    ],
    labels: [
      'Particular', 'No of Inspections Due',
      'No of Offices Inspected', 'Money Value Involved in Inspections', 'Recoveries',
      'No of Inspections Outstanding', 'Reasons for Arrears'
    ]
  },
  accountInspectionOfOffices: {
    columns: [
      'SNo', 'doneBy', 'targetfortheYear',
      'duefortheMonth', 'dueUptotheMonth', 'donefortheMonth', 'doneUptotheMonth',
      'arrearsfortheMonth', 'arrearsUptotheMonth', 'officeInspected'
    ],
    labels: [
      'S.No', 'Done By', 'Target for the Year',
      'Due for the Month', 'Due Up to the Month', 'Done for the Month', 'Done Up to the Month',
      'Arrears for the Month', 'Arrears Up to the Month', 'Office Inspected'
    ]
  },
  accountInspectionReport: {
    columns: [
      'SNo', 'typeOfReport', 'positionLhr', 'openingBalance',
      'accretion', 'clearanceOverOneYear', 'clearanceLessThanOneYear', 'totalClearance', 'closingBalance'
    ],
    labels: [
      'S.No', 'Type of Report', 'Position LHR', 'Opening Balance',
      'Accretion', 'Clearance Over One Year', 'Clearance Less Than One Year', 'Total Clearance', 'Closing Balance'
    ]
  },
  ageWiseAnalysisAccountsInspection: {
    columns: [
      'SNo', 'typeOfReport', 'closingBalance',
      'over6MonthOld', 'overOneYearOld', 'overThreeYearsOld', 'remarks'
    ],
    labels: [
      'S.No', 'Type of Report', 'Closing Balance',
      'Over 6 Month Old', 'Over One Year Old', 'Over Three Years Old', 'Remarks'
    ]
  },
  savingsThroughInternalCheck: {
    columns: [
      'SNo', 'particulars', 'actualSavingUpToLastMonth',
      'savingDuringMonth', 'savingUpToTheMonth'
    ],
    labels: [
      'S.No', 'Particulars', 'Actual Saving Up To Last Month',
      'Saving During Month', 'Saving Up To The Month'
    ]
  },
  hqRefPendingWithWorkshop: {
    columns: [
      'SNo', 'letterNo', 'letterDate', 'subject',
      'addressedTo', 'remarks'
    ],
    labels: [
      'S.No', 'Letter No', 'Letter Date', 'Subject',
      'Addressed To', 'Remarks'
    ]
  },
  positionOfReplyToHQDOLetter: {
    columns: [
      'SNo', 'openingBalance', 'accretion', 'clearance', 'closingBalance', 'remarks'
    ],
    labels: [
      'S.No', 'Opening Balance', 'Accretion', 'Clearance', 'Closing Balance', 'Remarks'
    ]
  },
  ncsrpAndPensionPosition: {
    columns: [
      'SNo', 'natureOfWork', 'positionAsPerLHYArrearReport',
      'extentOfArrearsLastMonth', 'accretion', 'clearance', 'closingBalance',
      'increaseOrDecrease', 'remarks'
    ],
    labels: [
      'S.No', 'Nature of Work', 'Position As Per LHY Arrear Report',
      'Extent of Arrears Last Month', 'Accretion', 'Clearance', 'Closing Balance',
      'Increase or Decrease', 'Remarks'
    ]
  },
  posOfTransferOfServicecard: {
    columns: [
      'Sno', 'description', 'openingBalance',
      'accretion', 'clearance', 'closingBalance', 'remarks'
    ],
    labels: [
      'S.No', 'Description', 'Opening Balance',
      'Accretion', 'Clearance', 'Closing Balance', 'Remarks'
    ]
  },
  positionOfStockSheet: {
    columns: [
      'item', 'openingBalance', 'accretionUpToMonth',
      'clearanceUpToMonth', 'closingBalance'
    ],
    labels: [
      'Item', 'Opening Balance', 'Accretion Up To Month',
      'Clearance Up To Month', 'Closing Balance'
    ]
  },
  ageWisePositionOfStockSheet: {
    columns: [
      'item', 'closingBalance', 'over3MonthsOld',
      'over6MonthsOld', 'over1YearOld', 'over3YearsOld'
    ],
    labels: [
      'Item', 'Closing Balance', 'Over 3 Months Old',
      'Over 6 Months Old', 'Over 1 Year Old', 'Over 3 Years Old'
    ]
  },
  deptWisePositionStocksheet: {
    columns: [
      'SNo', 'department', 'openingBalance',
      'accretionUpToMonth', 'clearanceUpToMonth', 'closingBalance', 'remarks'
    ],
    labels: [
      'S.No', 'Department', 'Opening Balance',
      'Accretion Up To Month', 'Clearance Up To Month', 'Closing Balance', 'Remarks'
    ]
  },
  staffReferencesOrCases: {
    columns: [
      'SNo', 'description', 'openingBalance',
      'accretion', 'clearance', 'closingBalance'
    ],
    labels: [
      'S.No', 'Description', 'Opening Balance',
      'Accretion', 'Clearance', 'Closing Balance'
    ]
  },
  clearanceAndAdjustmentOfMA: {
    columns: [
      'openingBalance', 'accretion', 'clearance', 'closingBalance', 'remarks'
    ],
    labels: [
      'Opening Balance', 'Accretion', 'Clearance', 'Closing Balance', 'Remarks'
    ]
  },
  progressOfSalaryPayment: {
    columns: [
      'item', 'totalNoOfEmployees', 'employeesThroughBank',
      'percentBankCurrentMonth', 'percentBankPrevMonth', 'increaseOrDecrease', 'remarks'
    ],
    labels: [
      'Item', 'Total No of Employees', 'Employees Through Bank',
      'Percent Bank Current Month', 'Percent Bank Prev Month', 'Increase or Decrease', 'Remarks'
    ]
  },
  progressOfEPayment: {
    columns: [
      'totalNoOfStaff', 'paidThroughEMode', 'percentAgeProgressStaff',
      'totalBillsPaid', 'paidThroughEModeBills', 'percentAgeProgressBills'
    ],
    labels: [
      'Total No of Staff', 'Paid Through E-Mode', 'Percent Age Progress Staff',
      'Total Bills Paid', 'Paid Through E-Mode Bills', 'Percent Age Progress Bills'
    ]
  },
  progressOfSalaryThroughBank: {
    columns: [
      'type', 'noOfStaffAB', 'noOfStaffCD', 'coverageAB',
      'coverageCD', 'percentAB', 'percentCD'
    ],
    labels: [
      'Type', 'No of Staff AB', 'No of Staff CD', 'Coverage AB',
      'Coverage CD', 'Percent AB', 'Percent CD'
    ]
  },
  progressOfSalaryThroughECS: {
    columns: ['type', 'numberOfCities'],
    labels: ['Type', 'Number of Cities']
  },
  plannedImplementationECS: {
    columns: ['description', 'numberOfCities'],
    labels: ['Description', 'Number of Cities']
  },
  reportOnFacilityAugmentation: {
    columns: ['description', 'existingAtStart', 'additionsDuringMonth'],
    labels: ['Description', 'Existing at Start', 'Additions During Month']
  },
  testChecksBySS: {
    columns: [
      'doneBy', 'annualTarget', 'dueForTheMonth', 'dueUpToTheMonth',
      'doneForTheMonth', 'doneUpToTheMonth', 'arrearsForTheMonth', 'arrearsUpToTheMonth', 'subject'
    ],
    labels: [
      'Done By', 'Annual Target', 'Due For The Month', 'Due Up To The Month',
      'Done For The Month', 'Done Up To The Month', 'Arrears For The Month', 'Arrears Up To The Month', 'Subject'
    ]
  },
  testChecksBySrISA: {
    columns: [
      'doneBy', 'annualTarget', 'dueForTheMonth', 'dueUpToTheMonth',
      'doneForTheMonth', 'doneUpToTheMonth', 'arrearsForTheMonth', 'arrearsUpToTheMonth', 'subject'
    ],
    labels: [
      'Done By', 'Annual Target', 'Due For The Month', 'Due Up To The Month',
      'Done For The Month', 'Done Up To The Month', 'Arrears For The Month', 'Arrears Up To The Month', 'Subject'
    ]
  },
  quaterlyTestChecksByJAG: {
    columns: [
     'doneBy', 'annualTarget', 'dueForTheMonth', 'dueUpToTheMonth',
      'doneForTheMonth', 'doneUpToTheMonth', 'arrearsForTheMonth', 'arrearsUpToTheMonth', 'subject'
    ],
    labels: [
      'Done By', 'Annual Target', 'Due For The Month', 'Due Up To The Month',
      'Done For The Month', 'Done Up To The Month', 'Arrears For The Month', 'Arrears Up To The Month', 'Subject'
    ]
  },
  rotationOfStaff: {
    columns: ['SNo', 'item', 'statusAndRemarks'],
    labels: ['S.No', 'Item', 'Status and Remarks']
  },
  miscellaneousItems: {
    columns: [
     'sNo', 'itemOfWork', 'positionAsPerLHR', 'ob',
      'accretion', 'clearance', 'cb', 'remarks'
    ],
    labels: [
      'S.No', 'Item of Work', 'Position As Per LHR', 'OB',
      'Accretion', 'Clearance', 'CB', 'Remarks'
    ]
  },
  completionReports: {
    columns: [
     'positionAsPerLHR', 'openingBalanceOn1stApril',
      'accretionUpToMonth', 'clearanceUpToMonthDuringYear', 'closingBalanceAsOn', 'remarks'
    ],
    labels: [
      'Position As Per LHR', 'Opening Balance On 1st April',
      'Accretion Up To Month', 'Clearance Up To Month During Year', 'Closing Balance As On', 'Remarks'
    ]
  },
  drAndBr: {
    columns: [
      'figure', 'srNo', 'category', 'openingBalanceNoOfItems',
      'openingBalanceAmount', 'accretionNoOfItems', 'accretionAmount', 'clearanceNoOfItems',
      'clearanceAmount', 'closingBalanceNoOfItems', 'closingBalanceAmount',
      'billsOughtToHaveBeenPreferred', 'billsActuallyIssued'
    ],
    labels: [
      'Figure', 'Sr No', 'Category', 'Opening Balance No Of Items',
      'Opening Balance Amount', 'Accretion No Of Items', 'Accretion Amount', 'Clearance No Of Items',
      'Clearance Amount', 'Closing Balance No Of Items', 'Closing Balance Amount',
      'Bills Ought To Have Been Preferred', 'Bills Actually Issued'
    ]
  },
  positionOfImpRecoverableItems: {
    columns: [
      'figure', 'sn', 'nameOfParty', 'itemsCategory',
      'itemsDescription', 'period', 'amount', 'remarks'
    ],
    labels: [
      'Figure', 'S.No', 'Name of Party', 'Items Category',
      'Items Description', 'Period', 'Amount', 'Remarks'
    ]
  },
  deptWiseRecoverableItems: {
    columns: [
     'figure', 'srNo', 'department', 'openingBalanceItem',
      'openingBalanceAmount', 'accretionItem', 'accretionAmount', 'clearanceItem',
      'clearanceAmount', 'closingBalanceItem', 'closingBalanceAmount'
    ],
    labels: [
     'Figure', 'Sr No', 'Department', 'Opening Balance Item',
      'Opening Balance Amount', 'Accretion Item', 'Accretion Amount', 'Clearance Item',
      'Clearance Amount', 'Closing Balance Item', 'Closing Balance Amount'
    ]
  },
  positionOfSpotChecking: {
    columns: [
      'figure', 'spotCheckDuringMonth', 'spotCheckUpToMonth',
      'recoveryDetectedDuringMonth', 'recoveryDetectedUpToMonth'
    ],
    labels: [
     'Figure', 'Spot Check During Month', 'Spot Check Up To Month',
      'Recovery Detected During Month', 'Recovery Detected Up To Month'
    ]
  },
  statusOfRevisionOfPension: {
    columns: [
     'figure', 'category', 'totalNoOfCasesRequiringRevision',
      'noOfCasesReceivedInAccounts', 'noOfCasesRevisedUpToMonth', 'noOfCasesReturnedUpToMonth',
      'balanceNoOfCasesUnderProcessInAccounts', 'remarks'
    ],
    labels: [
      'Figure', 'Category', 'Total No Of Cases Requiring Revision',
      'No Of Cases Received In Accounts', 'No Of Cases Revised Up To Month', 'No Of Cases Returned Up To Month',
      'Balance No Of Cases Under Process In Accounts', 'Remarks'
    ]
  },
  assistanceRequiredFromHO: {
    columns: [
      'figure', 'sr', 'suspenseHead', 'item', 'amount', 'year', 'totalForHead'
    ],
    labels: [
       'Figure', 'Sr', 'Suspense Head', 'Item', 'Amount', 'Year', 'Total For Head'
    ]
  }
};

function WorkshopTable({ selectedTable }: any) {
  console.log("WorkshopTable received selectedTable:", selectedTable);
  
  // state for filters
  const [division, setDivision] = useState<string>("Ajmer");
  const [selectedDate, setSelectedDate] = useState({
    month: "January",
    year: new Date().getFullYear().toString(),
  });

  // state for fetched data
  const [dataLoading, setDataLoading] = useState(false);
  const [sheetData, setSheetData] = useState<SheetResponse[]>([]);

  // handlers
  const handleDivisionChange = (event: any) => {
    const {
      target: { value },
    } = event;
    setDivision(typeof value === "string" ? value.split(",") : value);
  };

  const handleDateChange = (field: "month" | "year") => (e: any) => {
    setSelectedDate((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  // fetch on any filter change
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedTable) {
        console.log("No table selected");
        setSheetData([]);
        return;
      }
      
      setDataLoading(true);
      const newDate = getMonthYear(selectedDate.month, selectedDate.year);
      try {
        console.log("trying to fetch data", selectedTable);
        const response = await WorkshopService.fetchAllDataFromTable(selectedTable);

        if (response.success) {
          let data=response?.data;
          const dataarray = [data];
          console.log("this id",data)
          const filteredData = data.filter((row: any) => row.date == newDate && row.division == division);
          // Sort specific tables by index ascending
          const sortByIndexFor = [
            "analysisOfAuditReference",
            "outstandingAuditObjection",
            "unsanctionedExpenditure",
            "inspectionPara",
            "itemPositioninSuspenseRegister",
            "manufacturingSuspense",

          ];
          const sortedData = sortByIndexFor.includes(selectedTable)
            ? [...filteredData].sort((a: any, b: any) => {
                const aVal = Number(a?.index ?? Infinity);
                const bVal = Number(b?.index ?? Infinity);
                if (isNaN(aVal) && isNaN(bVal)) return 0;
                if (isNaN(aVal)) return 1;
                if (isNaN(bVal)) return -1;
                return aVal - bVal;
              })
            : filteredData;
          console.log("filtered data", sortedData)
          setSheetData(sortedData);
        } else {
          alert("Some error has happened");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setSheetData([]);
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, [division, selectedDate, selectedTable]);


  return (
    <>
      <Box
        sx={{
          width: "95%",
          paddingTop: "2%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* Filters Row */}
        <Grid container spacing={2} alignItems="center">
          {/* Month */}
          <Grid
            item
            xs={12}
            sm={12}
            md={12}
            lg={4}
            sx={{ display: "flex", justifyContent: "center" }}
          >
            <Select
              value={selectedDate.month}
              onChange={(e) =>
                setSelectedDate((prev: any) => ({
                  ...prev,
                  month: e.target.value, // Assuming 'year' is the field to update
                }))
              }
              displayEmpty
              fullWidth
              sx={{
                backgroundColor: "#222633",
                borderRadius: "10px",
                height: "40px",
                maxWidth: "180px",
                minWidth: "150px",

                fontWeight: "600",
                color: "#fff",
                justifyContent: "space-between",
                display: "flex",
                alignItems: "center",

                border: "1px solid rgba(255, 255, 255, 0.2)", // Add subtle border
                fontFamily: "MyCustomFont,SourceSerif4_18pt",
                "& .MuiSelect-icon": {
                  color: "#fff",
                },
              }}
            >
              {months.map((month, index) => (
                <MenuItem key={index} value={month}>
                  {month}
                </MenuItem>
              ))}
            </Select>
          </Grid>

          {/* Year */}
          <Grid
            item
            xs={12}
            sm={12}
            md={12}
            lg={4}
            sx={{ display: "flex", justifyContent: "center" }}
          >
            <Select
              value={selectedDate.year}
              onChange={(e) =>
                setSelectedDate((prev: any) => ({
                  ...prev,
                  year: e.target.value, // Assuming 'year' is the field to update
                }))
              }
              displayEmpty
              fullWidth
              sx={{
                backgroundColor: "#222633",
                borderRadius: "10px",
                height: "40px",
                maxWidth: "180px",
                minWidth: "150px",

                fontWeight: "600",
                color: "#fff",
                justifyContent: "space-between",
                display: "flex",
                alignItems: "center",

                border: "1px solid rgba(255, 255, 255, 0.2)", // Add subtle border
                "& .MuiSelect-icon": {
                  color: "#fff",
                },
              }}
            >
              {years.map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </Grid>

          {/* Division */}
          <Grid item xs={12} sm={6} md={3} lg={4}>
            <Select
              fullWidth
              value={division}
              onChange={handleDivisionChange}
              sx={{
                backgroundColor: "#222633",
                color: "#fff",
                borderRadius: "8px",
              }}
              MenuProps={{
                PaperProps: {
                  sx: { bgcolor: "#282828", color: "#fff" },
                },
              }}
            >
              {workshopDivisions.map((d, index) => (
                <MenuItem key={index} value={d.name}>
                  {d.name}
                </MenuItem>
              ))}
            </Select>
          </Grid>
        </Grid>
      </Box>

      {/* Data Table or Loading */}
      {dataLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress style={{ color: "white" }} />
        </Box>
      ) : sheetData?.length > 0 ? (
        <Box sx={{ mt: 4, width: "95%", mx: "auto" }}>
              <Box
                sx={{
                  width: "100%",
                  overflowX: "auto",
                  overflowY: "auto",
                  maxHeight: 440,
                  backgroundColor: "#2c2c2c",
                  borderRadius: 2,
                  boxShadow: 3,
                }}
              >
                <Table size="small" stickyHeader sx={{ minWidth: 800 }}>
                  <TableHead>
                    <TableRow>
                  {(workshopTableConfigs[selectedTable as keyof typeof workshopTableConfigs]?.labels || []).map((col: string, index: number) => (
                          <TableCell
                      key={index}
                            sx={{
                              color: "#ffffff",
                              backgroundColor: "#333",
                              fontWeight: 600,
                              whiteSpace: "nowrap",
                              borderBottom: "1px solid #555",
                              position: "sticky",
                              top: 0,
                              zIndex: 2,
                            }}
                          >
                      {col}
                          </TableCell>
                  ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                {sheetData.map((row: any, rowIndex: number) => (
                  <TableRow key={rowIndex} hover>
                    {(workshopTableConfigs[selectedTable as keyof typeof workshopTableConfigs]?.columns || []).map((col: string, colIndex: number) => (
                                <TableCell
                        key={colIndex}
                                  sx={{
                                    color: "#e0e0e0",
                                    whiteSpace: "nowrap",
                                    borderBottom: "1px solid #444",
                                  }}
                                >
                        {row[col] != null ? row[col].toString() : '-'}
                          </TableCell>
                    ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </Box>
      ) : !selectedTable ? (
        <Typography align="center" mt={4} sx={{ color: "#e0e0e0" }}>
          Please select a table to view data.
        </Typography>
      ) : (
        <Typography align="center" mt={4} sx={{ color: "#e0e0e0" }}>
          No data available for these parameters.
        </Typography>
      )}
    </>
  );
}

export default WorkshopTable;
