import * as XLSX from "xlsx";
import { months } from "./staticDataUtis";
import { hr } from "date-fns/locale";
import { log } from "console";


export const monthMap: any = {
    January: "01",
    February: "02",
    March: "03",
    April: "04",
    May: "05",
    June: "06",
    July: "07",
    August: "08",
    September: "09",
    October: "10",
    November: "11",
    December: "12",
  };
  export const allMonths = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];




export const parseExcelFile = async (
    buffer: ArrayBuffer,
    division: string,
    month: string,
    year: string,
    data: any[]
  ) => {
    try {
      // load workbook & pick the sheets
      const workbook: any = XLSX.read(new Uint8Array(buffer), { type: "array" });
      console.log("gggg",workbook.Sheets);
  
      // Define the expected sheet names
      const sheetNames: { [key: string]: string } = {
        workingExpenditure: "Working Expenditure",
        planHead: "Plan Head",
        manufacturingSuspense: "Manufacturing Suspense",
        wmsBalance: "WMS Balance",
        wmsClosingBalance: "WMS Closing Balance",
        wmsBalanceAnalysis: "WMS Balance Analysis",
        wmsStoreCharges: "Stores Charges to WMS",
        positionofDirectPurchase: "Position of Direct Purchase",
        comparativePositionofOutturn: "Comparative position of Outturn",
        pohUnitCost: "POH Unit Cost for the Month",
        postingandReconciliation: "Posting and Reconciliation",
        itemPositioninSuspenseRegister: "Position of Items in Susp. Reg.",
        unsanctionedExpenditure: "Unsanctioned Expenditure",
        inspectionPara: "Railway Board Inspection Para",
        outstandingAuditObjection: "Oustanding Audit Objections",
        analysisOfAuditReference: "Analysis of Audit Reference",
        positionOfAccountInspection: "Position Of Account Inspections",
        accountInspectionofOffices: "Account Inspection of Offices",
        accountInspectionReport: "PositionofAccInspectionReports",
        ageWiseAnalysisAccountsInspection: "AgeWise Analysis AccInspection",
        savingsThroughInternalCheck: "Savings through Internal Check",
        positionOfReplyToHQDOLetter: "PositionofReply to HQ DO Letter",
        hqRefPendingWithWorkshop: "HQ Ref. Pending with workshop",
        ncsrpAndPensionPosition: "NCSRP & Pension Position",
        posOfTransferOfServicecard: "Pos. of transfer of servicecard",
        positionOfStockSheet: "Position of StockSheet",
        ageWisePositionOfStockSheet: "AgeWise Position of StockSheet",
        deptWisePositionStocksheet: "DeptWise Position Stocksheet",
        staffReferencesOrCases: "Staff References or Cases",
        clearanceAndAdjustmentOfMA: "Clearence and adjustment of MA",
        progressOfSalaryPayment: "Progress of Salary Payment",
        progressOfEPayment: "Progress Of E-Payment",
        progressOfSalaryThroughBank: "Progress of Salary through bank",
        progressOfSalaryThroughECS: "Progress of Salary through ECS",
        plannedImplementationECS: "Planned Implementation ECS",
        reportOnFacilityAugmentation: "Report on facility augmentation",
        testChecksBySS: "Test checks by SS",
        testChecksBySrISA: "Test checks by Sr.ISA",
        quaterlyTestChecksByJAG: "Quaterly test checks by JAG",
        rotationOfStaff: "Rotation of Staff",
        miscellaneousItems: "Miscellaneous Items",
        completionReports: "Completion Reports",
        drAndBr: "DR & BR",
        positionOfImpRecoverableItems: "Pos. of Imp Recoverable Items",
        deptWiseRecoverableItems: "Dept. wise recoverable items",
        positionOfSpotChecking: "Position of Spot Checking",
        statusOfRevisionOfPension: "Status of Rivision of Pension",
        assistanceRequiredFromHO: "Assistance required from HQ",


       
      };

    // const sheetNames: { [key: string]: string} = {

    // }
      console.log("sheet names start")
      // Create a new object with sheets that are found in workbook.Sheets using includes
      const sheets: { [key: string]: any } = Object.keys(sheetNames).reduce(
        (acc: { [key: string]: any }, key: string) => {
          const sheetName = sheetNames[key].trim(); // Trim the sheet name
          const sheetKeys = Object.keys(workbook.Sheets);
  
          const matchedSheetKey =
            sheetKeys.find(
              (sheetKey) =>
                sheetKey.trim().toLowerCase() === sheetName.toLowerCase()
            ) ||
            sheetKeys.find((sheetKey) =>
              sheetKey.trim().toLowerCase().includes(sheetName.toLowerCase())
            );
  
          if (matchedSheetKey && workbook.Sheets[matchedSheetKey]) {
            acc[key] = workbook.Sheets[matchedSheetKey];
          }
  
          return acc;
        },
        {}
      );
      console.log("sheets",sheets)
      console.log("Available sheet keys:", Object.keys(workbook.Sheets))
      console.log("Expected sheet names:", Object.values(sheetNames))
      
      // date strings
      const formattedDate = getMonthYear(month, year);
      const selectedMonthYear = formattedDate;
  
      // detect “Thousand” or “Crore”
      const detectFigureUnit = (sheet: XLSX.WorkSheet): string | null => {
        for (const addr of Object.keys(sheet)) {
          if (addr.startsWith("!")) continue;
          const v = sheet[addr].v;
          if (typeof v === "string") {
            const lc = v.toLowerCase();
            if (lc.includes("thousand")) return "Thousand";
            if (lc.includes("crore")) return "Crore";
          }
        }
        return null;
      };
      
  
      // unified parser: alpha-keys + drop “total” rows and below
      const parseSheetWithAlphaKeys = (sheet: XLSX.WorkSheet | undefined): any[] => {
        if (!sheet) return [];
        const ref = sheet["!ref"] || "";
        if (!ref) return [];
  
        const { s, e } = XLSX.utils.decode_range(ref);
  
        // find first numeric row
        let startRow: number | null = null;
        for (let r = s.r; r <= e.r; r++) {
          for (let c = s.c; c <= e.c; c++) {
            const cell = sheet[XLSX.utils.encode_cell({ r, c })];
            if (cell && typeof cell.v === "number") {
              startRow = r;
              break;
            }
          }
          if (startRow !== null) break;
        }
  
        if (startRow === null) return [];
  
        const rows: any[] = [];
  
        for (let r = startRow; r <= e.r; r++) {
          const rowData: Record<string, any> = {};
          let isEmpty = true;
  
          for (let c = s.c; c <= e.c; c++) {
            const addr = XLSX.utils.encode_cell({ r, c });
            const cellValue = sheet[addr]?.v;
            if (cellValue != null && cellValue !== "") isEmpty = false;
            rowData[String.fromCharCode(97 + (c - s.c))] = cellValue ?? null;
          }
  
          // Only skip if the row is empty
          if (isEmpty) break;
  
          rows.push(rowData);
        }
  
        return rows;
      };

    //   const finalData = {}
    console.log("parseSheetWithAlphaKeys(sheets.completionReports)",parseSheetWithAlphaKeys(sheets.completionReports))
  
      // assemble finalData
      const finalData = {
        workingExpenditure: sheets.workingExpenditure
            ? parseSheetWithAlphaKeys(sheets.workingExpenditure).map((row) => ({
                division,
                date: formattedDate,
                figure: detectFigureUnit(sheets.workingExpenditure),
                index: row.a,
                DemandNo: row.b,
                Actual: row.c,
                RBG: row.d,
                BPfortheMonth: row.e,
                ActualfortheMonthLastYear: row.f,
                ActualfortheMonthCurrentYear: row.g,
                BPtoendofMonth: row.h,
                ActualtoendofMonthLastYear: row.i,
                ActualtotheEndofMonthCurrentYear: row.j,

            })): [],
        planHead: sheets.planHead
            ? parseSheetWithAlphaKeys(sheets.planHead).map((row) => ({
                division,
                date: formattedDate,
                figure: detectFigureUnit(sheets.planHead),
                index: row.a,
                PlanHead: row.b,
                Actual: row.c,
                RBG: row.d,
                ActualfortheMonthLastYear: row.e,
                ActualfortheMonthCurrentYear: row.f,

            })): [],
            
        manufacturingSuspense: sheets.manufacturingSuspense
            ? parseSheetWithAlphaKeys(sheets.manufacturingSuspense).map((row) => ({
                division,
                date: formattedDate,
                figure: detectFigureUnit(sheets.manufacturingSuspense),
                index: row.a,
                OpeningBalance: row.b,
                RBGDebit: row.c,
                RBGCredit: row.d,
                RBGNet: row.e,
                ExpendituretotheEndofMonthDebit: row.f,
                ExpendituretotheEndofMonthCredit: row.g,
                ExpendituretotheEndofMonthNet: row.h,
                BalancetotheEndofMonthDebit: row.i,
                BalancetotheEndofMonthCredit: row.j,
                BalancetotheEndofMonthNet: row.k,

            })): [],
        wmsBalance: sheets.wmsBalance
            ? parseSheetWithAlphaKeys(sheets.wmsBalance).map((row) => ({
                division,
                date: formattedDate,
                figure: detectFigureUnit(sheets.wmsBalance),
                index: row.a,
                Particulars: row.b,
                ActualLY: row.c,
                ActualLLY: row.d,
                RGB: row.e,
                BPuptoMonth: row.f,
                ActualfortheMonth: row.g,
                ActualtotheEndofMonth: row.h,
                

            })): [],
        wmsClosingBalance: sheets.wmsClosingBalance
            ? parseSheetWithAlphaKeys(sheets.wmsClosingBalance).map((row) => ({
                division,
                date: formattedDate,
                figure: detectFigureUnit(sheets.wmsClosingBalance),
                index: row.a,
                breakUp: row.b,
                Amount: row.c,
                
            })): [],
         wmsBalanceAnalysis: sheets.wmsBalanceAnalysis
            ? parseSheetWithAlphaKeys(sheets.wmsBalanceAnalysis).map((row) => ({
                division,
                date: formattedDate,
                figure: detectFigureUnit(sheets.wmsBalanceAnalysis),
                index: row.a,
                previousYearNonth: row.b,
                previousYearOpeningBalance: row.c,
                previousYearDebit: row.d,
                previousYearCredit: row.e,
                previousYearClosingBalance: row.f,
                currentYearNonth: row.g,
                currentYearOpeningBalance: row.h,
                currentYearDebit: row.i,
                currentYearCredit: row.j,
                currentYearClosingBalance: row.k,

                
            })): [],
        wmsStoreCharges: sheets.wmsStoreCharges
            ? parseSheetWithAlphaKeys(sheets.wmsStoreCharges).map((row) => ({
                division,
                date: formattedDate,
                figure: detectFigureUnit(sheets.wmsStoreCharges),
                index: row.a,
                actualLLYMonth: row.b,
                actualLLYAmount: row.c,
                actualLYMonth: row.d,
                actualLYAmount: row.e,
                actualMonth: row.f,
                actualAmount: row.g,
                

                
            })): [],
        positionofDirectPurchase: sheets.positionofDirectPurchase
            ? parseSheetWithAlphaKeys(sheets.positionofDirectPurchase).map((row) => ({
                division,
                date: formattedDate,
                figure: detectFigureUnit(sheets.positionofDirectPurchase),
                index: row.a,
                actualLLYMonth: row.b,
                actualLLYAmount: row.c,
                actualLYMonth: row.d,
                actualLYAmount: row.e,
                actualMonth: row.f,
                actualAmount: row.g,
                

                
            })): [],
        comparativePositionofOutturn: sheets.comparativePositionofOutturn
            ? parseSheetWithAlphaKeys(sheets.comparativePositionofOutturn).map((row) => ({
                division,
                date: formattedDate,
                figure: detectFigureUnit(sheets.comparativePositionofOutturn),
                index: row.a,
                nameOfActivity: row.c,
                targetAnnual: row.d,
                targetUptotheMonth: row.e,
                outturnfortheMonth: row.f,
                outturnUptotheMonth: row.g,
                outturnUptotheMonthofCorrospondingPeriod: row.h,
                difference: row.i,
                remarks: row.j,
                
            })): [],
        pohUnitCost: sheets.pohUnitCost
            ? parseSheetWithAlphaKeys(sheets.pohUnitCost).map((row) => ({
                division,
                date: formattedDate,
                figure: detectFigureUnit(sheets.pohUnitCost),
                index: row.a,
                SNo: row.b,
                nameOfActivity: row.c,
                labour: row.d,
                material: row.e,
                onCostLabour: row.f,
                onCostStore: row.g,
                unitCostfortheMonth: row.h,
                remarks: row.i,
                
            })): [],
        postingandReconciliation: sheets.postingandReconciliation
            ? parseSheetWithAlphaKeys(sheets.postingandReconciliation).map((row) => ({
                division,
                date: formattedDate,
                figure: detectFigureUnit(sheets.postingandReconciliation),
                index: row.a,
                SNo: row.b,
                suspenseHeads: row.c,
                positionasperLHAR: row.d,
                openingBalance: row.e,
                accretion: row.f,
                clearance: row.g,
                closingBalance: row.h,
                remarks: row.i,
                
            })): [],
        itemPositioninSuspenseRegister: sheets.itemPositioninSuspenseRegister
            ? parseSheetWithAlphaKeys(sheets.itemPositioninSuspenseRegister).map((row) => ({
                division,
                date: formattedDate,
                figure: detectFigureUnit(sheets.itemPositioninSuspenseRegister),
                index: row.a,
                SNo: row.b,
                suspenseHeads: row.c,
                positionasperLHARitem: row.d,
                positionasperLHARamount: row.e,
                openingBalanceitem: row.f,
                openingBalanceamount: row.g,
                accretionitem: row.h,
                accretionamount: row.i,
                clearanceitem: row.j,
                clearanceamount: row.k,
                closingBalanceitem: row.l,
                closingBalanceamount: row.m,
                oldestBalance: row.n,
                
            })): [],
        unsanctionedExpenditure: sheets.unsanctionedExpenditure
            ? parseSheetWithAlphaKeys(sheets.unsanctionedExpenditure).map((row) => ({
                division,
                date: formattedDate,
                figure: detectFigureUnit(sheets.unsanctionedExpenditure),
                index: row.a,
                SNo: row.b,
                suspenseHeads: row.c,
                positionasperLHARitem: row.d,
                positionasperLHARamount: row.e,
                openingBalanceitem: row.f,
                openingBalanceamount: row.g,
                accretionitem: row.h,
                accretionamount: row.i,
                clearanceitem: row.j,
                clearanceamount: row.k,
                closingBalanceitem: row.l,
                closingBalanceamount: row.m,
                oldestBalance: row.n,
                
            })): [],
        inspectionPara: sheets.inspectionPara
            ? parseSheetWithAlphaKeys(sheets.inspectionPara).map((row) => ({
                division,
                date: formattedDate,
                figure: detectFigureUnit(sheets.inspectionPara),
                index: row.a,
                SNo: row.b,
                yearofReport: row.c,
                typeOfPara: row.d,
                totalNoOfParas: row.e,
                noOfParasOutstandingatStart: row.f,
                noOfParasClosed: row.g,
                noOfParasOutstandingatEnd: row.h,
                remarks: row.i,
                
            })): [],
        outstandingAuditObjection: sheets.outstandingAuditObjection
            ? parseSheetWithAlphaKeys(sheets.outstandingAuditObjection).map((row) => ({
                division,
                date: formattedDate,
                figure: detectFigureUnit(sheets.outstandingAuditObjection),
                index: row.a,
                SNo: row.b,
                typeOfAuditObjection: row.c,
                positionasperLHY: row.d,
                openingBalance: row.e,
                accretion: row.f,
                clearenceOverOneYearOld: row.g,
                clearenceLessthanOneYearOld: row.h,
                totalClearence: row.i,
                closingBalance: row.j,
                
            })): [],
        analysisOfAuditReference: sheets.analysisOfAuditReference
            ? parseSheetWithAlphaKeys(sheets.analysisOfAuditReference).map((row) => ({
                division,
                date: formattedDate,
                figure: detectFigureUnit(sheets.analysisOfAuditReference),
                index: row.a,
                SNo: row.b,
                typeOfAuditObjection: row.c,
                closingBalance: row.d,
                overSixMonthOld: row.e,
                overOneYearOld: row.f,
                overThreeYearOld: row.g,
                lessThanSixMonthOld: row.h,
                
            })): [],
        positionOfAccountInspection: sheets.positionOfAccountInspection
            ? parseSheetWithAlphaKeys(sheets.positionOfAccountInspection).map((row) => ({
                division,
                date: formattedDate,
                figure: detectFigureUnit(sheets.positionOfAccountInspection),
                index: row.a,
                particular: row.b,
                noOfInspectionsDue: row.c,
                noOfOfficesInspected: row.d,
                moneyValueInvolvedinInspections: row.e,
                recoveries: row.f,
                noOfInspectionsOutstanding: row.g,
                reasonsForArrears: row.h,
                
            })): [],
        accountInspectionofOffices: sheets.accountInspectionofOffices
            ? parseSheetWithAlphaKeys(sheets.accountInspectionofOffices).map((row) => ({
                division,
                date: formattedDate,
                figure: detectFigureUnit(sheets.accountInspectionofOffices),
                index: row.a,
                SNo: row.b,
                doneBy: row.c,
                targetfortheYear: row.d,
                duefortheMonth: row.e,
                dueUptotheMonth: row.f,
                donefortheMonth: row.g,
                doneUptotheMonth: row.h,
                arrearsfortheMonth: row.i,
                arrearsUptotheMonth: row.j,
                officeInspected: row.k,
                
            })): [],
            
        accountInspectionReport: sheets.accountInspectionReport
            ? parseSheetWithAlphaKeys(sheets.accountInspectionReport).map((row) => ({
                division,
                date: formattedDate,
                index: row.a,
                SNo: row.b,
                typeOfReport: row.c, // Type of report
                positionLhr: row.d, // Position as per LHR
                openingBalance: row.e,
                accretion: row.f,
                clearanceOverOneYear: row.g,
                clearanceLessThanOneYear: row.h,
                totalClearance: row.i,
                closingBalance: row.j,
            }))
            : [],
        ageWiseAnalysisAccountsInspection: sheets.ageWiseAnalysisAccountsInspection
            ? parseSheetWithAlphaKeys(sheets.ageWiseAnalysisAccountsInspection).map((row) => ({
                division,
                date: formattedDate,
                index: row.a,
                SNo: row.b,
                typeOfReport: row.c, // Type of report
                closingBalance: row.d, // Closing Balance
                over6MonthOld: row.e, // Over 6 month old
                overOneYearOld: row.f, // Over one year old
                overThreeYearsOld: row.g, // Over 3 years old
                remarks: row.h, // Remarks
            }))
            : [],
        savingsThroughInternalCheck: sheets.savingsThroughInternalCheck
            ? parseSheetWithAlphaKeys(sheets.savingsThroughInternalCheck)
                .filter(row => (row.b && typeof row.b === 'string' && row.b.trim().toLowerCase() !== 'total'))
                .map((row) => ({
                    division,
                    date: formattedDate,
                    index: row.a,
                    SNo: row.b,
                    particulars: row.c, // Particulars
                    actualSavingUpToLastMonth: row.d, // Actual Saving up to last month
                    savingDuringMonth: row.e, // Saving during the month
                    savingUpToTheMonth: row.f, // Saving up to the month
                }))
            : [],
        hqRefPendingWithWorkshop: sheets.hqRefPendingWithWorkshop
            ? parseSheetWithAlphaKeys(sheets.hqRefPendingWithWorkshop).map((row) => ({
                division,
                date: formattedDate,
                index: row.a,
                SNo: row.b,
                letterNo: row.c, // Letter No.
                letterDate: row.d, // Date
                subject: row.e, // Subject
                addressedTo: row.f, // Addressed to
                remarks: row.g, // Remarks
            }))
            : [],
        positionOfReplyToHQDOLetter: sheets.positionOfReplyToHQDOLetter
            ? parseSheetWithAlphaKeys(sheets.positionOfReplyToHQDOLetter).map((row) => ({
                division,
                date: formattedDate,
                index: row.a,
                SNo: row.b,
                openingBalance: row.c, // Opening Balance
                accretion: row.d, // Accretion
                clearance: row.e, // Clearance
                closingBalance: row.f, // Closing Balance
                remarks: row.g, // Remarks
            }))
            : [],
        ncsrpAndPensionPosition: sheets.ncsrpAndPensionPosition
            ? parseSheetWithAlphaKeys(sheets.ncsrpAndPensionPosition).map((row) => ({
                division,
                date: formattedDate,
                index: row.a,
                SNo: row.b,
                natureOfWork: row.c, // Nature of Work
                positionAsPerLHYArrearReport: row.d, // Position as per LHY Arrear Report
                extentOfArrearsLastMonth: row.e, // Extent of arrears shown in the last month report
                accretion: row.f, // Accretion
                clearance: row.g, // Clearance
                closingBalance: row.h, // Closing Balance
                increaseOrDecrease: row.i, // Increase (+) / Decrease (-)
                remarks: row.j, // Remarks
            }))
            : [],
        posOfTransferOfServicecard: sheets.posOfTransferOfServicecard
            ? parseSheetWithAlphaKeys(sheets.posOfTransferOfServicecard).map((row) => ({
                division,
                date: formattedDate,
                index: row.a,
                Sno: row.b,
                description: row.c, // Description
                openingBalance: row.d, // Opening Balance
                accretion: row.e, // Accretion
                clearance: row.f, // Clearance
                closingBalance: row.g, // Closing Balance
                remarks: row.h, // Remarks
            }))
            : [],
        positionOfStockSheet: sheets.positionOfStockSheet
            ? parseSheetWithAlphaKeys(sheets.positionOfStockSheet).map((row) => ({
                division,
                date: formattedDate,
                index: row.a,
                item: row.b, // Item
                openingBalance: row.c, // Opening Balance 1st April 24
                accretionUpToMonth: row.d, // Accretion up to Month
                clearanceUpToMonth: row.e, // Clearance Up to Month
                closingBalance: row.f, // Closing Balance
            }))
            : [],
        ageWisePositionOfStockSheet: sheets.ageWisePositionOfStockSheet
            ? parseSheetWithAlphaKeys(sheets.ageWisePositionOfStockSheet).map((row) => ({
                division,
                date: formattedDate,
                index: row.a,
                item: row.b, // Item
                closingBalance: row.c, // Closing Balance
                over3MonthsOld: row.d, // Over 3 months old
                over6MonthsOld: row.e, // Over 6 month old
                over1YearOld: row.f, // Over 1 year old
                over3YearsOld: row.g, // Over 3 years old
            }))
            : [],
        deptWisePositionStocksheet: sheets.deptWisePositionStocksheet
            ? parseSheetWithAlphaKeys(sheets.deptWisePositionStocksheet).map((row) => ({
                division,
                date: formattedDate,
                index: row.a,
                SNo: row.b,
                department: row.c, // Department
                openingBalance: row.d, // Opening Balance 1st, April-2024
                accretionUpToMonth: row.e, // Accretion up to Month
                clearanceUpToMonth: row.f, // Clearance up to Month
                closingBalance: row.g, // Closing Balance
                remarks: row.h, // Remarks
            }))
            : [],
        staffReferencesOrCases: sheets.staffReferencesOrCases
            ? parseSheetWithAlphaKeys(sheets.staffReferencesOrCases).map((row) => ({
                division,
                date: formattedDate,
                index: row.a,
                SNo: row.b, // Sr.No.
                description: row.c, // Description of item
                openingBalance: row.d, // Opening Balance
                accretion: row.e, // Accretion
                clearance: row.f, // Clearance
                closingBalance: row.g, // Closing Balance
            }))
            : [],
        clearanceAndAdjustmentOfMA: sheets.clearanceAndAdjustmentOfMA
            ? parseSheetWithAlphaKeys(sheets.clearanceAndAdjustmentOfMA).map((row) => ({
                division,
                date: formattedDate,
                index: row.a,
                openingBalance: row.b, // Opening Balance
                accretion: row.c, // Accretion
                clearance: row.d, // Clearance
                closingBalance: row.e, // Closing Balance
                remarks: row.f, // Remarks
            }))
            : [],
        progressOfSalaryPayment: sheets.progressOfSalaryPayment
            ? parseSheetWithAlphaKeys(sheets.progressOfSalaryPayment)
                .filter(row => (row.a && typeof row.a === 'string' && row.a.trim().toLowerCase() !== 'total'))
                .map((row) => ({
                    division,
                    date: formattedDate,
                    index: row.a,
                    item: row.b, // Item
                    totalNoOfEmployees: row.c, // Total No of Employees
                    employeesThroughBank: row.d, // No of Employees taking salaries through Bank/Cheque
                    percentBankCurrentMonth: row.e, // % age bank payment for the current month
                    percentBankPrevMonth: row.f, // % age bank payment during the previous month
                    increaseOrDecrease: row.g, // Increase (+) or Decrease (-) with respect to previous month
                    remarks: row.h, // Remarks
                }))
            : [],
        progressOfEPayment: sheets.progressOfEPayment
            ? parseSheetWithAlphaKeys(sheets.progressOfEPayment).map((row) => ({
                division,
                date: formattedDate,
                index: row.a,
                totalNoOfStaff: row.b, // Total no. of staff
                paidThroughEMode: row.c, // Paid through E-mode
                percentAgeProgressStaff: row.d, // Percent age progress (staff)
                totalBillsPaid: row.e, // Total Bills paid
                paidThroughEModeBills: row.f, // Paid through E-Mode (bills)
                percentAgeProgressBills: row.g, // Percent age progress (bills)
            }))
            : [],
        progressOfSalaryThroughBank: sheets.progressOfSalaryThroughBank
            ? parseSheetWithAlphaKeys(sheets.progressOfSalaryThroughBank).map((row) => ({
                division,
                date: formattedDate,
                index: row.a,
                type: row.b, // Type
                noOfStaffAB: row.c, // No of Staff A&B
                noOfStaffCD: row.d, // No of Staff C&D
                coverageAB: row.e, // Coverage A&B
                coverageCD: row.f, // Coverage C&D
                percentAB: row.g, // % A&B
                percentCD: row.h, // % C&D
            }))
            : [],
        progressOfSalaryThroughECS: sheets.progressOfSalaryThroughECS
            ? parseSheetWithAlphaKeys(sheets.progressOfSalaryThroughECS).map((row) => ({
                division,
                date: formattedDate,
                index: row.a,
                type: row.b, // Type
                numberOfCities: row.c, // Number of cities
            }))
            : [],
        plannedImplementationECS: sheets.plannedImplementationECS
            ? parseSheetWithAlphaKeys(sheets.plannedImplementationECS).map((row) => ({
                division,
                date: formattedDate,
                index: row.a,
                description: row.b, // Description
                numberOfCities: row.c, // Number of cities
            }))
            : [],
        reportOnFacilityAugmentation: sheets.reportOnFacilityAugmentation
            ? parseSheetWithAlphaKeys(sheets.reportOnFacilityAugmentation).map((row) => ({
                division,
                date: formattedDate,
                index: row.a,
                description: row.b, // Description
                existingAtStart: row.c, // Existing at the start of
                additionsDuringMonth: row.d, // Additions during Month
            }))
            : [],
        testChecksBySS: sheets.testChecksBySS
            ? parseSheetWithAlphaKeys(sheets.testChecksBySSJSSSOSO).map((row) => ({
                division,
                date: formattedDate,
                index: row.a,
                doneBy: row.b, // Done By
                annualTarget: row.c, // Annual Target
                dueForTheMonth: row.d, // Due For the month
                dueUpToTheMonth: row.e, // Due Up to the month
                doneForTheMonth: row.f, // Done For the month
                doneUpToTheMonth: row.g, // Done Up to the month
                arrearsForTheMonth: row.h, // Arrears For the month
                arrearsUpToTheMonth: row.i, // Arrears Up to the month
                subject: row.j, // Subject
            }))
            : [],
        testChecksBySrISA: sheets.testChecksBySrISA
            ? parseSheetWithAlphaKeys(sheets.testChecksBySrISA).map((row) => ({
                division,
                date: formattedDate,
                index: row.a,
                doneBy: row.b, // Done By
                annualTarget: row.c, // Annual Target
                dueForTheMonth: row.d, // Due For the month
                dueUpToTheMonth: row.e, // Due Up to the month
                doneForTheMonth: row.f, // Done For the month
                doneUpToTheMonth: row.g, // Done Up to the month
                arrearsForTheMonth: row.h, // Arrears For the month
                arrearsUpToTheMonth: row.i, // Arrears Up to the month
                subject: row.j, // Subject
            }))
            : [],
        quaterlyTestChecksByJAG: sheets.quaterlyTestChecksByJAG
            ? parseSheetWithAlphaKeys(sheets.quaterlyTestChecksByJAG).map((row) => ({
                division,
                date: formattedDate,
                index: row.a,
                doneBy: row.b, // Done By
                annualTarget: row.c, // Annual Target
                dueForTheMonth: row.d, // Due For the month
                dueUpToTheMonth: row.e, // Due Up to the month
                doneForTheMonth: row.f, // Done For the month
                doneUpToTheMonth: row.g, // Done Up to the month
                arrearsForTheMonth: row.h, // Arrears For the month
                arrearsUpToTheMonth: row.i, // Arrears Up to the month
                subject: row.j, // Subject
            }))
            : [],
        rotationOfStaff: sheets.rotationOfStaff
            ? parseSheetWithAlphaKeys(sheets.rotationOfStaff).map((row) => ({
                division,
                date: formattedDate,
                index: row.a,
                SNo: row.b, // S No
                item: row.c, // Item
                statusAndRemarks: row.d, // Status & remarks
            }))
            : [],
        miscellaneousItems: sheets.miscellaneousItems
            ? parseSheetWithAlphaKeys(sheets.miscellaneousItems).map((row) => ({
                division,
                date: formattedDate,
                index: row.a,
                sNo: row.b, // S No
                itemOfWork: row.c, // Item of work
                positionAsPerLHR: row.d, // Position as per LHR
                ob: row.e, // OB
                accretion: row.f, // Accretion
                clearance: row.g, // Clearance
                cb: row.h, // CB
                remarks: row.i, // Remarks
            }))
            : [],
        completionReports: sheets.completionReports
            ? parseSheetWithAlphaKeys(sheets.completionReports).map((row) => ({
                division,
                date: formattedDate,
                index: row.a,
                positionAsPerLHR: row.b, // Position as per LHR
                openingBalanceOn1stApril: row.c, // Opening Balance on 1st April of current FY
                accretionUpToMonth: row.d, // Accretion up to Month
                clearanceUpToMonthDuringYear: row.e, // Clearance up to Month During year
                closingBalanceAsOn: row.f, // Closing Balance as on
                remarks: row.g, // Remarks
            }))
            : [],
        drAndBr: sheets.drAndBr
            ? parseSheetWithAlphaKeys(sheets.drAndBr).map((row) => ({
                division,
                date: formattedDate,
                figure: detectFigureUnit(sheets.drAndBr),
                index: row.a,
                srNo: row.b, // Sr. No.
                category: row.c, // Category
                openingBalanceNoOfItems: row.d, // Opening Balance - No of items
                openingBalanceAmount: row.e, // Opening Balance - Amount
                accretionNoOfItems: row.f, // Accretion - No of items
                accretionAmount: row.g, // Accretion - Amount
                clearanceNoOfItems: row.h, // Clearance - No of items
                clearanceAmount: row.i, // Clearance - Amount
                closingBalanceNoOfItems: row.j, // Closing Balance - No of items
                closingBalanceAmount: row.k, // Closing Balance - Amount
                billsOughtToHaveBeenPreferred: row.l, // Bills ought to have been preferred during the year
                billsActuallyIssued: row.m, // Bills actually issued up to the month
            }))
            : [],
        positionOfImpRecoverableItems: sheets.positionOfImpRecoverableItems
            ? parseSheetWithAlphaKeys(sheets.positionOfImpRecoverableItems).map((row) => ({
                division,
                date: formattedDate,
                figure: detectFigureUnit(sheets.positionOfImpRecoverableItems),
                index: row.a,
                sn: row.b, // SN (Serial Number)
                nameOfParty: row.c, // Name of party
                itemsCategory: row.d, // Item's category
                itemsDescription: row.e, // Item's description
                period: row.g, // Period
                amount: row.h, // Amount
                remarks: row.i, // Remarks
            }))
            : [],
        deptWiseRecoverableItems: sheets.deptWiseRecoverableItems
            ? parseSheetWithAlphaKeys(sheets.deptWiseRecoverableItems).map((row) => ({
                division,
                date: formattedDate,
                figure: detectFigureUnit(sheets.deptWiseRecoverableItems),
                index: row.a,
                srNo: row.b, // Sr. No.
                department: row.c, // Department
                openingBalanceItem: row.d, // Opening Balance - Item
                openingBalanceAmount: row.e, // Opening Balance - Amount
                accretionItem: row.f, // Accretion - Item
                accretionAmount: row.g, // Accretion - Amount
                clearanceItem: row.h, // Clearance - Item
                clearanceAmount: row.i, // Clearance - Amount
                closingBalanceItem: row.j, // Closing Balance - Item
                closingBalanceAmount: row.k, // Closing Balance - Amount
            }))
            : [],
        positionOfSpotChecking: sheets.positionOfSpotChecking
            ? parseSheetWithAlphaKeys(sheets.positionOfSpotChecking).map((row) => ({
                division,
                date: formattedDate,
                figure: detectFigureUnit(sheets.positionOfSpotChecking),
                index: row.a,
                spotCheckDuringMonth: row.b, // No. of Spot Check - During the month
                spotCheckUpToMonth: row.c, // No. of Spot Check - Up to the month
                recoveryDetectedDuringMonth: row.d, // Recovery detected - During the month
                recoveryDetectedUpToMonth: row.e, // Recovery detected - Up to the month (in unit of Rs.)
            }))
            : [],
        statusOfRevisionOfPension: sheets.statusOfRevisionOfPension
            ? parseSheetWithAlphaKeys(sheets.statusOfRevisionOfPension).map((row) => ({
                division,
                date: formattedDate,
                figure: detectFigureUnit(sheets.statusOfRevisionOfPension),
                index: row.a,
                category: row.b, // Category
                totalNoOfCasesRequiringRevision: row.c, // Total No. of cases requiring Revision
                noOfCasesReceivedInAccounts: row.d, // No. of cases received in A/cs
                noOfCasesRevisedUpToMonth: row.e, // No. of cases revised up to the Jan-2025
                noOfCasesReturnedUpToMonth: row.f, // No. of cases returned up to the monthJan-2025
                balanceNoOfCasesUnderProcessInAccounts: row.g, // Balance No. of cases under process in Accounts
                remarks: row.h, // Remarks
            }))
            : [],
        assistanceRequiredFromHO: sheets.assistanceRequiredFromHO
            ? parseSheetWithAlphaKeys(sheets.assistanceRequiredFromHO).map((row) => ({
                division,
                date: formattedDate,
                figure: detectFigureUnit(sheets.assistanceRequiredFromHO),
                index: row.a,
                sr: row.b, // Sr
                suspenseHead: row.c, // Suspense Head
                item: row.d, // Item
                amount: row.e, // Amount
                year: row.f, // Year
                totalForHead: row.g, // Total for Head
            }))
            : [],
  
        selectedMonthYear,
        division,
      };
      console.log("workingExpenditure",finalData.workingExpenditure)
  
      const enrichedData = data.map((item) => ({
        ...item,
        date: selectedMonthYear,
        division,
      }));
  
      return { finalData };
    } catch (error: any) {
      console.error("Error parsing Excel file:", error.message);
      return { finalData: {}, enrichedData: [] };
    }
  };









  // Convert month to "MM/YYYY" format
export const getMonthYear = (month: string, year: any) => {
    const monthMap: { [key: string]: string } = {
      January: "01",
      February: "02",
      March: "03",
      April: "04",
      May: "05",
      June: "06",
      July: "07",
      August: "08",
      September: "09",
      October: "10",
      November: "11",
      December: "12",
    };
    return `${monthMap[month]}/${year}`;
  };









  export const parseSheetWithHeaders = (sheet: any): any[] => {
    const ref = sheet["!ref"];
    if (!ref) return [];
  
    const range = XLSX.utils.decode_range(ref);
    const data: any[] = [];
    let headerRow = range.s.r;
  
    // 1) Find the real header row (>=2 non-empty text cells)
    for (let r = range.s.r; r <= range.e.r; r++) {
      let nonEmptyCount = 0;
      for (let c = range.s.c; c <= range.e.c; c++) {
        const cell = sheet[XLSX.utils.encode_cell({ r, c })];
        if (cell && typeof cell.v === "string" && cell.v.trim() !== "") {
          nonEmptyCount++;
        }
      }
      if (nonEmptyCount >= 2) {
        headerRow = r;
        break;
      }
    }
  
    // 2) Read headers
    const headers: string[] = [];
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cell = sheet[XLSX.utils.encode_cell({ r: headerRow, c: C })];
      headers.push(
        cell && cell.v != null ? cell.v.toString().trim() : `UNKNOWN_${C}`
      );
    }
  
    const stopKeywords = ["total", "gross total"];
  
    // 3) Read data rows
    for (let R = headerRow + 1; R <= range.e.r; ++R) {
      // peek at first column to see if we should stop
      const firstAddr = XLSX.utils.encode_cell({ r: R, c: range.s.c });
      const rawFirst = sheet[firstAddr]?.v;
      const firstVal =
        rawFirst != null ? rawFirst.toString().trim().toLowerCase() : "";
  
      if (stopKeywords.some((k) => firstVal.includes(k))) {
        break;
      }
  
      const rowObj: Record<string, any> = {};
      let isEmpty = true;
  
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const addr = XLSX.utils.encode_cell({ r: R, c: C });
        const raw = sheet[addr]?.v;
        // empty or "-" → null
        const val = raw === undefined || raw === "" || raw === "-" ? null : raw;
        if (val != null) isEmpty = false;
        rowObj[headers[C - range.s.c]] = val;
      }
  
      // if the entire row is blank, stop parsing
      if (isEmpty) break;
  
      data.push(rowObj);
    }
  
    return data;
  }