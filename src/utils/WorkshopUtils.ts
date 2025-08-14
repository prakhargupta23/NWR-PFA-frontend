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
        outstandingAuditObjection: "Outstanding Audit Objection",
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
        clearanceAndAdjustmentOfMA: "Clearance and adjustment of MA",
        progressOfSalaryPayment: "Progress of Salary Payment",
        progressOfEPayment: "Progress Of E-Payment",
        progressOfSalaryThroughBank: "Progress of Salary through bank",
        progressOfSalaryThroughECS: "Progress of Salary through ECS",
        plannedImplementationECS: "Planned Implementation ECS",
        reportOnFacilityAugmentation: "Report on facility augmentation",
        testChecksBySS: "Test checks by SS,JS,SSO,SO",
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
        assistanceRequiredFromHO: "Assistance required from HO",


       
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
      const parseSheetWithAlphaKeys = (sheet: XLSX.WorkSheet): any[] => {
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
  
      // assemble finalData
      const finalData = {
        workingExpenditure: sheets.workingExpenditure
            ? parseSheetWithAlphaKeys(sheets.workingExpenditure).map((row) => ({
                division,
                date: formattedDate,
                figure: detectFigureUnit(sheets.workingExpenditure),
                DemandNo: row.a,
                Actual: row.b,
                RBG: row.c,
                BPfortheMonth: row.d,
                ActualfortheMonthLastYear: row.e,
                ActualfortheMonthCurrentYear: row.f,
                BPtoendofMonth: row.g,
                ActualtoendofMonthLastYear: row.h,
                ActualtotheEndofMonthCurrentYear: row.i,

            })): [],
        planHead: sheets.planHead
            ? parseSheetWithAlphaKeys(sheets.planHead).map((row) => ({
                division,
                date: formattedDate,
                figure: detectFigureUnit(sheets.planHead),
                PlanHead: row.a,
                Actual: row.b,
                RBG: row.c,
                ActualfortheMonthLastYear: row.d,
                ActualfortheMonthCurrentYear: row.e,

            })): [],
            
        manufacturingSuspense: sheets.manufacturingSuspense
            ? parseSheetWithAlphaKeys(sheets.manufacturingSuspense).map((row) => ({
                division,
                date: formattedDate,
                figure: detectFigureUnit(sheets.manufacturingSuspense),
                OpeningBalance: row.a,
                RBGDebit: row.b,
                RBGCredit: row.c,
                RBGNet: row.d,
                ExpendituretotheEndofMonthDebit: row.e,
                ExpendituretotheEndofMonthCredit: row.f,
                ExpendituretotheEndofMonthNet: row.g,
                BalancetotheEndofMonthDebit: row.h,
                BalancetotheEndofMonthCredit: row.i,
                BalancetotheEndofMonthNet: row.j,

            })): [],
        wmsBalance: sheets.wmsBalance
            ? parseSheetWithAlphaKeys(sheets.wmsBalance).map((row) => ({
                division,
                date: formattedDate,
                figure: detectFigureUnit(sheets.wmsBalance),
                Particulars: row.a,
                ActualLY: row.b,
                ActualLLY: row.c,
                RGB: row.d,
                BPuptoMonth: row.e,
                ActualfortheMonth: row.f,
                ActualtotheEndofMonth: row.g,
                

            })): [],
        wmsClosingBalance: sheets.wmsClosingBalance
            ? parseSheetWithAlphaKeys(sheets.wmsClosingBalance).map((row) => ({
                division,
                date: formattedDate,
                figure: detectFigureUnit(sheets.wmsClosingBalance),
                breakUp: row.a,
                Amount: row.b,
                
            })): [],
         wmsBalanceAnalysis: sheets.wmsBalanceAnalysis
            ? parseSheetWithAlphaKeys(sheets.wmsBalanceAnalysis).map((row) => ({
                division,
                date: formattedDate,
                figure: detectFigureUnit(sheets.wmsBalanceAnalysis),
                previousYearNonth: row.a,
                previousYearOpeningBalance: row.b,
                previousYearDebit: row.c,
                previousYearCredit: row.d,
                previousYearClosingBalance: row.e,
                currentYearNonth: row.f,
                currentYearOpeningBalance: row.g,
                currentYearDebit: row.h,
                currentYearCredit: row.i,
                currentYearClosingBalance: row.j,

                
            })): [],
        wmsStoreCharges: sheets.wmsStoreCharges
            ? parseSheetWithAlphaKeys(sheets.wmsStoreCharges).map((row) => ({
                division,
                date: formattedDate,
                figure: detectFigureUnit(sheets.wmsStoreCharges),
                actualLLYMonth: row.a,
                actualLLYAmount: row.b,
                actualLYMonth: row.c,
                actualLYAmount: row.d,
                actualMonth: row.e,
                actualAmount: row.f,
                

                
            })): [],
        positionofDirectPurchase: sheets.positionofDirectPurchase
            ? parseSheetWithAlphaKeys(sheets.positionofDirectPurchase).map((row) => ({
                division,
                date: formattedDate,
                figure: detectFigureUnit(sheets.positionofDirectPurchase),
                actualLLYMonth: row.a,
                actualLLYAmount: row.b,
                actualLYMonth: row.c,
                actualLYAmount: row.d,
                actualMonth: row.e,
                actualAmount: row.f,
                

                
            })): [],
        comparativePositionofOutturn: sheets.comparativePositionofOutturn
            ? parseSheetWithAlphaKeys(sheets.comparativePositionofOutturn).map((row) => ({
                division,
                date: formattedDate,
                figure: detectFigureUnit(sheets.comparativePositionofOutturn),
                nameOfActivity: row.b,
                targetAnnual: row.c,
                targetUptotheMonth: row.d,
                outturnfortheMonth: row.e,
                outturnUptotheMonth: row.f,
                outturnUptotheMonthofCorrospondingPeriod: row.g,
                difference: row.h,
                remarks: row.i,
                
            })): [],
        pohUnitCost: sheets.pohUnitCost
            ? parseSheetWithAlphaKeys(sheets.pohUnitCost).map((row) => ({
                division,
                date: formattedDate,
                figure: detectFigureUnit(sheets.pohUnitCost),
                nameOfActivity: row.b,
                labour: row.c,
                material: row.d,
                onCostLabour: row.e,
                onCostStore: row.f,
                unitCostfortheMonth: row.g,
                remarks: row.h,
                
            })): [],
        postingandReconciliation: sheets.postingandReconciliation
            ? parseSheetWithAlphaKeys(sheets.postingandReconciliation).map((row) => ({
                division,
                date: formattedDate,
                figure: detectFigureUnit(sheets.postingandReconciliation),
                suspenseHeads: row.b,
                positionasperLHAR: row.c,
                openingBalance: row.d,
                accretion: row.e,
                clearance: row.f,
                closingBalance: row.g,
                remarks: row.h,
                
            })): [],
        itemPositioninSuspenseRegister: sheets.itemPositioninSuspenseRegister
            ? parseSheetWithAlphaKeys(sheets.itemPositioninSuspenseRegister).map((row) => ({
                division,
                date: formattedDate,
                figure: detectFigureUnit(sheets.itemPositioninSuspenseRegister),
                suspenseHeads: row.b,
                positionasperLHARitem: row.c,
                positionasperLHARamount: row.d,
                openingBalanceitem: row.e,
                openingBalanceamount: row.f,
                accretionitem: row.g,
                accretionamount: row.h,
                clearanceitem: row.i,
                clearanceamount: row.j,
                closingBalanceitem: row.k,
                closingBalanceamount: row.l,
                oldestBalance: row.m,
                
            })): [],
        unsanctionedExpenditure: sheets.unsanctionedExpenditure
            ? parseSheetWithAlphaKeys(sheets.unsanctionedExpenditure).map((row) => ({
                division,
                date: formattedDate,
                figure: detectFigureUnit(sheets.unsanctionedExpenditure),
                SNo: row.a,
                suspenseHeads: row.b,
                positionasperLHARitem: row.c,
                positionasperLHARamount: row.d,
                openingBalanceitem: row.e,
                openingBalanceamount: row.f,
                accretionitem: row.g,
                accretionamount: row.h,
                clearanceitem: row.i,
                clearanceamount: row.j,
                closingBalanceitem: row.k,
                closingBalanceamount: row.l,
                oldestBalance: row.m,
                
            })): [],
        inspectionPara: sheets.inspectionPara
            ? parseSheetWithAlphaKeys(sheets.inspectionPara).map((row) => ({
                division,
                date: formattedDate,
                figure: detectFigureUnit(sheets.inspectionPara),
                typeOfPara: row.b,
                totalNoOfParas: row.c,
                noOfParasOutstandingatStart: row.d,
                noOfParasClosed: row.e,
                noOfParasOutstandingatEnd: row.f,
                accretionitem: row.g,
                remarks: row.h,
                
            })): [],
        outstandingAuditObjection: sheets.outstandingAuditObjection
            ? parseSheetWithAlphaKeys(sheets.outstandingAuditObjection).map((row) => ({
                division,
                date: formattedDate,
                figure: detectFigureUnit(sheets.outstandingAuditObjection),
                SNo: row.a,
                typeOfAuditObjection: row.b,
                positionasperLHY: row.c,
                openingBalance: row.d,
                accretion: row.e,
                clearenceOverOneYearOld: row.f,
                clearenceLessthanOneYearOld: row.g,
                totalClearence: row.h,
                closingBalance: row.i,
                
            })): [],
        analysisOfAuditReference: sheets.analysisOfAuditReference
            ? parseSheetWithAlphaKeys(sheets.analysisOfAuditReference).map((row) => ({
                division,
                date: formattedDate,
                figure: detectFigureUnit(sheets.analysisOfAuditReference),
                SNo: row.a,
                typeOfAuditObjection: row.b,
                closingBalance: row.c,
                overSixMonthOld: row.d,
                overOneYearOld: row.e,
                overThreeYearOld: row.f,
                lessThanSixMonthOld: row.g,
                
            })): [],
        positionOfAccountInspection: sheets.positionOfAccountInspection
            ? parseSheetWithAlphaKeys(sheets.positionOfAccountInspection).map((row) => ({
                division,
                date: formattedDate,
                figure: detectFigureUnit(sheets.positionOfAccountInspection),
                particular: row.a,
                noOfInspectionsDue: row.b,
                noOfOfficesInspected: row.c,
                moneyValueInvolvedinInspections: row.d,
                recoveries: row.e,
                noOfInspectionsOutstanding: row.f,
                reasonsForArrears: row.g,
                
            })): [],
        accountInspectionofOffices: sheets.accountInspectionofOffices
            ? parseSheetWithAlphaKeys(sheets.accountInspectionofOffices).map((row) => ({
                division,
                date: formattedDate,
                figure: detectFigureUnit(sheets.accountInspectionofOffices),
                SNo: row.a,
                doneBy: row.b,
                targetfortheYear: row.c,
                duefortheMonth: row.d,
                dueUptotheMonth: row.e,
                donefortheMonth: row.f,
                doneUptotheMonth: row.g,
                arrearsfortheMonth: row.h,
                arrearsUptotheMonth: row.i,
                officeInspected: row.j,
                
            })): [],
            
        accountInspectionReport: sheets.accountInspectionReport
            ? parseSheetWithAlphaKeys(sheets.accountInspectionReport).map((row) => ({
                division,
                date: formattedDate,
                SNo: row.a,
                typeOfReport: row.b, // Type of report
                positionLhr: row.c, // Position as per LHR
                openingBalance: row.d,
                accretion: row.e,
                clearanceOverOneYear: row.f,
                clearanceLessThanOneYear: row.g,
                totalClearance: row.h,
                closingBalance: row.i,
            }))
            : [],
            ageWiseAnalysisAccountsInspection: sheets.ageWiseAnalysisAccountsInspection
            ? parseSheetWithAlphaKeys(sheets.ageWiseAnalysisAccountsInspection).map((row) => ({
                division,
                date: formattedDate,
                SNo: row.a,
                typeOfReport: row.b, // Type of report
                closingBalance: row.c, // Closing Balance
                over6MonthOld: row.d, // Over 6 month old
                overOneYearOld: row.e, // Over one year old
                overThreeYearsOld: row.f, // Over 3 years old
                remarks: row.g, // Remarks
            }))
            : [],
        savingsThroughInternalCheck: sheets.savingsThroughInternalCheck
            ? parseSheetWithAlphaKeys(sheets.savingsThroughInternalCheck)
                .filter(row => (row.b && typeof row.b === 'string' && row.b.trim().toLowerCase() !== 'total'))
                .map((row) => ({
                    division,
                    date: formattedDate,
                    SNo: row.a,
                    particulars: row.b, // Particulars
                    actualSavingUpToLastMonth: row.c, // Actual Saving up to last month
                    savingDuringMonth: row.d, // Saving during the month
                    savingUpToTheMonth: row.e, // Saving up to the month
                }))
            : [],
        hqRefPendingWithWorkshop: sheets.hqRefPendingWithWorkshop
            ? parseSheetWithAlphaKeys(sheets.hqRefPendingWithWorkshop).map((row) => ({
                division,
                date: formattedDate,
                SNo: row.a,
                letterNo: row.b, // Letter No.
                letterDate: row.c, // Date
                subject: row.d, // Subject
                addressedTo: row.e, // Addressed to
                remarks: row.f, // Remarks
            }))
            : [],
        positionOfReplyToHQDOLetter: sheets.positionOfReplyToHQDOLetter
            ? parseSheetWithAlphaKeys(sheets.positionOfReplyToHQDOLetter).map((row) => ({
                division,
                date: formattedDate,
                SNo: row.a,
                openingBalance: row.b, // Opening Balance
                accretion: row.c, // Accretion
                clearance: row.d, // Clearance
                closingBalance: row.e, // Closing Balance
                remarks: row.f, // Remarks
            }))
            : [],
        ncsrpAndPensionPosition: sheets.ncsrpAndPensionPosition
            ? parseSheetWithAlphaKeys(sheets.ncsrpAndPensionPosition).map((row) => ({
                division,
                date: formattedDate,
                SNo: row.a,
                natureOfWork: row.b, // Nature of Work
                positionAsPerLHYArrearReport: row.c, // Position as per LHY Arrear Report
                extentOfArrearsLastMonth: row.d, // Extent of arrears shown in the last month report
                accretion: row.e, // Accretion
                clearance: row.f, // Clearance
                closingBalance: row.g, // Closing Balance
                increaseOrDecrease: row.h, // Increase (+) / Decrease (-)
                remarks: row.i, // Remarks
            }))
            : [],
        posOfTransferOfServicecard: sheets.posOfTransferOfServicecard
            ? parseSheetWithAlphaKeys(sheets.posOfTransferOfServicecard).map((row) => ({
                division,
                date: formattedDate,
                Sno: row.a,
                description: row.b, // Description
                openingBalance: row.c, // Opening Balance
                accretion: row.d, // Accretion
                clearance: row.e, // Clearance
                closingBalance: row.f, // Closing Balance
                remarks: row.g, // Remarks
            }))
            : [],
        positionOfStockSheet: sheets.positionOfStockSheet
            ? parseSheetWithAlphaKeys(sheets.positionOfStockSheet).map((row) => ({
                division,
                date: formattedDate,
                item: row.a, // Item
                openingBalance: row.b, // Opening Balance 1st April 24
                accretionUpToMonth: row.c, // Accretion up to Month
                clearanceUpToMonth: row.d, // Clearance Up to Month
                closingBalance: row.e, // Closing Balance
            }))
            : [],
        ageWisePositionOfStockSheet: sheets.ageWisePositionOfStockSheet
            ? parseSheetWithAlphaKeys(sheets.ageWisePositionOfStockSheet).map((row) => ({
                division,
                date: formattedDate,
                item: row.a, // Item
                closingBalance: row.b, // Closing Balance
                over3MonthsOld: row.c, // Over 3 months old
                over6MonthsOld: row.d, // Over 6 month old
                over1YearOld: row.e, // Over 1 year old
                over3YearsOld: row.f, // Over 3 years old
            }))
            : [],
        deptWisePositionStocksheet: sheets.deptWisePositionStocksheet
            ? parseSheetWithAlphaKeys(sheets.deptWisePositionStocksheet).map((row) => ({
                division,
                date: formattedDate,
                SNo: row.a,
                department: row.b, // Department
                openingBalance: row.c, // Opening Balance 1st, April-2024
                accretionUpToMonth: row.d, // Accretion up to Month
                clearanceUpToMonth: row.e, // Clearance up to Month
                closingBalance: row.f, // Closing Balance
                remarks: row.g, // Remarks
            }))
            : [],
        staffReferencesOrCases: sheets.staffReferencesOrCases
            ? parseSheetWithAlphaKeys(sheets.staffReferencesOrCases).map((row) => ({
                division,
                date: formattedDate,
                SNo: row.a, // Sr.No.
                description: row.b, // Description of item
                openingBalance: row.c, // Opening Balance
                accretion: row.d, // Accretion
                clearance: row.e, // Clearance
                closingBalance: row.f, // Closing Balance
            }))
            : [],
        clearanceAndAdjustmentOfMA: sheets.clearanceAndAdjustmentOfMA
            ? parseSheetWithAlphaKeys(sheets.clearanceAndAdjustmentOfMA).map((row) => ({
                division,
                date: formattedDate,
                openingBalance: row.a, // Opening Balance
                accretion: row.b, // Accretion
                clearance: row.c, // Clearance
                closingBalance: row.d, // Closing Balance
                remarks: row.e, // Remarks
            }))
            : [],
        progressOfSalaryPayment: sheets.progressOfSalaryPayment
            ? parseSheetWithAlphaKeys(sheets.progressOfSalaryPayment)
                .filter(row => (row.a && typeof row.a === 'string' && row.a.trim().toLowerCase() !== 'total'))
                .map((row) => ({
                    division,
                    date: formattedDate,
                    item: row.a, // Item
                    totalNoOfEmployees: row.b, // Total No of Employees
                    employeesThroughBank: row.c, // No of Employees taking salaries through Bank/Cheque
                    percentBankCurrentMonth: row.d, // % age bank payment for the current month
                    percentBankPrevMonth: row.e, // % age bank payment during the previous month
                    increaseOrDecrease: row.f, // Increase (+) or Decrease (-) with respect to previous month
                    remarks: row.g, // Remarks
                }))
            : [],
        progressOfEPayment: sheets.progressOfEPayment
            ? parseSheetWithAlphaKeys(sheets.progressOfEPayment).map((row) => ({
                division,
                date: formattedDate,
                totalNoOfStaff: row.a, // Total no. of staff
                paidThroughEMode: row.b, // Paid through E-mode
                percentAgeProgressStaff: row.c, // Percent age progress (staff)
                totalBillsPaid: row.d, // Total Bills paid
                paidThroughEModeBills: row.e, // Paid through E-Mode (bills)
                percentAgeProgressBills: row.f, // Percent age progress (bills)
            }))
            : [],
        progressOfSalaryThroughBank: sheets.progressOfSalaryThroughBank
            ? parseSheetWithAlphaKeys(sheets.progressOfSalaryThroughBank).map((row) => ({
                division,
                date: formattedDate,
                type: row.a, // Type
                noOfStaffAB: row.b, // No of Staff A&B
                noOfStaffCD: row.c, // No of Staff C&D
                coverageAB: row.d, // Coverage A&B
                coverageCD: row.e, // Coverage C&D
                percentAB: row.f, // % A&B
                percentCD: row.g, // % C&D
            }))
            : [],
        progressOfSalaryThroughECS: sheets.progressOfSalaryThroughECS
            ? parseSheetWithAlphaKeys(sheets.progressOfSalaryThroughECS).map((row) => ({
                division,
                date: formattedDate,
                type: row.a, // Type
                numberOfCities: row.b, // Number of cities
            }))
            : [],
        plannedImplementationECS: sheets.plannedImplementationECS
            ? parseSheetWithAlphaKeys(sheets.plannedImplementationECS).map((row) => ({
                division,
                date: formattedDate,
                description: row.a, // Description
                numberOfCities: row.b, // Number of cities
            }))
            : [],
        reportOnFacilityAugmentation: sheets.reportOnFacilityAugmentation
            ? parseSheetWithAlphaKeys(sheets.reportOnFacilityAugmentation).map((row) => ({
                division,
                date: formattedDate,
                description: row.a, // Description
                existingAtStart: row.b, // Existing at the start of
                additionsDuringMonth: row.c, // Additions during Month
            }))
            : [],
        testChecksBySS: sheets.testChecksBySS
            ? parseSheetWithAlphaKeys(sheets.testChecksBySSJSSSOSO).map((row) => ({
                division,
                date: formattedDate,
                doneBy: row.a, // Done By
                annualTarget: row.b, // Annual Target
                dueForTheMonth: row.c, // Due For the month
                dueUpToTheMonth: row.d, // Due Up to the month
                doneForTheMonth: row.e, // Done For the month
                doneUpToTheMonth: row.f, // Done Up to the month
                arrearsForTheMonth: row.g, // Arrears For the month
                arrearsUpToTheMonth: row.h, // Arrears Up to the month
                subject: row.i, // Subject
            }))
            : [],
        testChecksBySrISA: sheets.testChecksBySrISA
            ? parseSheetWithAlphaKeys(sheets.testChecksBySrISA).map((row) => ({
                division,
                date: formattedDate,
                doneBy: row.a, // Done By
                annualTarget: row.b, // Annual Target
                dueForTheMonth: row.c, // Due For the month
                dueUpToTheMonth: row.d, // Due Up to the month
                doneForTheMonth: row.e, // Done For the month
                doneUpToTheMonth: row.f, // Done Up to the month
                arrearsForTheMonth: row.g, // Arrears For the month
                arrearsUpToTheMonth: row.h, // Arrears Up to the month
                subject: row.i, // Subject
            }))
            : [],
        quaterlyTestChecksByJAG: sheets.quaterlyTestChecksByJAG
            ? parseSheetWithAlphaKeys(sheets.quaterlyTestChecksByJAG).map((row) => ({
                division,
                date: formattedDate,
                doneBy: row.a, // Done By
                annualTarget: row.b, // Annual Target
                dueForTheMonth: row.c, // Due For the month
                dueUpToTheMonth: row.d, // Due Up to the month
                doneForTheMonth: row.e, // Done For the month
                doneUpToTheMonth: row.f, // Done Up to the month
                arrearsForTheMonth: row.g, // Arrears For the month
                arrearsUpToTheMonth: row.h, // Arrears Up to the month
                subject: row.i, // Subject
            }))
            : [],
        rotationOfStaff: sheets.rotationOfStaff
            ? parseSheetWithAlphaKeys(sheets.rotationOfStaff).map((row) => ({
                division,
                date: formattedDate,
                SNo: row.a, // S No
                item: row.b, // Item
                statusAndRemarks: row.c, // Status & remarks
            }))
            : [],
        miscellaneousItems: sheets.miscellaneousItems
            ? parseSheetWithAlphaKeys(sheets.miscellaneousItems).map((row) => ({
                division,
                date: formattedDate,
                sNo: row.a, // S No
                itemOfWork: row.b, // Item of work
                positionAsPerLHR: row.c, // Position as per LHR
                ob: row.d, // OB
                accretion: row.e, // Accretion
                clearance: row.f, // Clearance
                cb: row.g, // CB
                remarks: row.h, // Remarks
            }))
            : [],
        completionReports: sheets.completionReports
            ? parseSheetWithAlphaKeys(sheets.completionReports).map((row) => ({
                division,
                date: formattedDate,
                positionAsPerLHR: row.a, // Position as per LHR
                openingBalanceOn1stApril: row.b, // Opening Balance on 1st April of current FY
                accretionUpToMonth: row.c, // Accretion up to Month
                clearanceUpToMonthDuringYear: row.d, // Clearance up to Month During year
                closingBalanceAsOn: row.e, // Closing Balance as on
                remarks: row.f, // Remarks
            }))
            : [],
        drAndBr: sheets.drAndBr
            ? parseSheetWithAlphaKeys(sheets.drAndBr).map((row) => ({
                division,
                date: formattedDate,
                figure: detectFigureUnit(sheets.drAndBr),
                srNo: row.a, // Sr. No.
                category: row.b, // Category
                openingBalanceNoOfItems: row.c, // Opening Balance - No of items
                openingBalanceAmount: row.d, // Opening Balance - Amount
                accretionNoOfItems: row.e, // Accretion - No of items
                accretionAmount: row.f, // Accretion - Amount
                clearanceNoOfItems: row.g, // Clearance - No of items
                clearanceAmount: row.h, // Clearance - Amount
                closingBalanceNoOfItems: row.i, // Closing Balance - No of items
                closingBalanceAmount: row.j, // Closing Balance - Amount
                billsOughtToHaveBeenPreferred: row.k, // Bills ought to have been preferred during the year
                billsActuallyIssued: row.l, // Bills actually issued up to the month
            }))
            : [],
        positionOfImpRecoverableItems: sheets.positionOfImpRecoverableItems
            ? parseSheetWithAlphaKeys(sheets.positionOfImpRecoverableItems).map((row) => ({
                division,
                date: formattedDate,
                figure: detectFigureUnit(sheets.positionOfImpRecoverableItems),
                sn: row.a, // SN (Serial Number)
                nameOfParty: row.b, // Name of party
                itemsCategory: row.c, // Item's category
                itemsDescription: row.d, // Item's description
                period: row.f, // Period
                amount: row.g, // Amount
                remarks: row.h, // Remarks
            }))
            : [],
        deptWiseRecoverableItems: sheets.deptWiseRecoverableItems
            ? parseSheetWithAlphaKeys(sheets.deptWiseRecoverableItems).map((row) => ({
                division,
                date: formattedDate,
                figure: detectFigureUnit(sheets.deptWiseRecoverableItems),
                srNo: row.a, // Sr. No.
                department: row.b, // Department
                openingBalanceItem: row.c, // Opening Balance - Item
                openingBalanceAmount: row.d, // Opening Balance - Amount
                accretionItem: row.e, // Accretion - Item
                accretionAmount: row.f, // Accretion - Amount
                clearanceItem: row.g, // Clearance - Item
                clearanceAmount: row.h, // Clearance - Amount
                closingBalanceItem: row.i, // Closing Balance - Item
                closingBalanceAmount: row.j, // Closing Balance - Amount
            }))
            : [],
        positionOfSpotChecking: sheets.positionOfSpotChecking
            ? parseSheetWithAlphaKeys(sheets.positionOfSpotChecking).map((row) => ({
                division,
                date: formattedDate,
                figure: detectFigureUnit(sheets.positionOfSpotChecking),
                spotCheckDuringMonth: row.a, // No. of Spot Check - During the month
                spotCheckUpToMonth: row.b, // No. of Spot Check - Up to the month
                recoveryDetectedDuringMonth: row.c, // Recovery detected - During the month
                recoveryDetectedUpToMonth: row.d, // Recovery detected - Up to the month (in unit of Rs.)
            }))
            : [],
        statusOfRevisionOfPension: sheets.statusOfRevisionOfPension
            ? parseSheetWithAlphaKeys(sheets.statusOfRevisionOfPension).map((row) => ({
                division,
                date: formattedDate,
                figure: detectFigureUnit(sheets.statusOfRevisionOfPension),
                category: row.a, // Category
                totalNoOfCasesRequiringRevision: row.b, // Total No. of cases requiring Revision
                noOfCasesReceivedInAccounts: row.c, // No. of cases received in A/cs
                noOfCasesRevisedUpToMonth: row.d, // No. of cases revised up to the Jan-2025
                noOfCasesReturnedUpToMonth: row.e, // No. of cases returned up to the monthJan-2025
                balanceNoOfCasesUnderProcessInAccounts: row.f, // Balance No. of cases under process in Accounts
                remarks: row.g, // Remarks
            }))
            : [],
        assistanceRequiredFromHO: sheets.assistanceRequiredFromHO
            ? parseSheetWithAlphaKeys(sheets.assistanceRequiredFromHO).map((row) => ({
                division,
                date: formattedDate,
                figure: detectFigureUnit(sheets.assistanceRequiredFromHO),
                sr: row.a, // Sr
                suspenseHead: row.b, // Suspense Head
                item: row.c, // Item
                amount: row.d, // Amount
                year: row.e, // Year
                totalForHead: row.f, // Total for Head
            }))
            : [],
        
        
            
            
            
        


        // expenditure: sheets.expenditure
        //   ? parseSheetWithAlphaKeys(sheets.expenditure).map((row) => ({
        //       division,
        //       date: formattedDate,
        //       figure: detectFigureUnit(sheets.expenditure),
        //       subCategory: row.a,
        //       actualLastFinancialYear: row.b != null ? +row.b : null,
        //       targetCurrentFinancialYear: row.c != null ? +row.c : null,
        //       targetThisMonth: row.d != null ? +row.d : null,
        //       actualThisMonthLastYear: row.f != null ? +row.f : null,
        //       actualThisMonth: row.e != null ? +row.e : null,
        //       targetYTDThisMonth: row.g != null ? +row.g : null,
        //       actualYTDThisMonthLastYear: row.i != null ? +row.i : null,
        //       actualYTDThisMonth: row.h != null ? +row.h : null,
        //     }))
        //   : [],
  
        // phExpenditure: sheets.phExpenditure
        //   ? parseSheetWithAlphaKeys(sheets.phExpenditure).map((row) => ({
        //       division,
        //       date: formattedDate,
        //       figure: detectFigureUnit(sheets.phExpenditure),
        //       planHead: row.a,
        //       actualLastYear: row.b != null ? +row.b : null,
        //       targetLastYear: row.c != null ? +row.c : null,
        //       actualUpToTheMonth: row.e != null ? +row.e : null,
        //       actualUpToTheMonthLastYear: row.f != null ? +row.f : null,
        //       actualForTheMonth: row.d != null ? +row.d : null,
        //     }))
        //   : [],
  
        // earning: sheets.earning
        //   ? parseSheetWithAlphaKeys(sheets.earning).map((row) => ({
        //       division,
        //       date: formattedDate,
        //       figure: detectFigureUnit(sheets.earning),
        //       subCategory: row.a,
        //       actualLastFinancialYear: row.b != null ? +row.b : null,
        //       targetThisMonth: row.c != null ? +row.c : null,
        //       actualThisMonthLastYear: row.e != null ? +row.e : null,
        //       actualThisMonth: row.d != null ? +row.d : null,
        //       targetYTDThisMonth: row.f != null ? +row.f : null,
        //       actualYTDThisMonthLastYear: row.h != null ? +row.h : null,
        //       actualYTDThisMonth: row.g != null ? +row.g : null,
        //     }))
        //   : [],
  
        // recoverable: sheets.recoverable
        //   ? parseSheetWithAlphaKeys(sheets.recoverable).map((row) => {
        //       return {
        //         division,
        //         date: formattedDate,
        //         figure: detectFigureUnit(sheets.recoverable),
        //         type: row.a,
        //         category: row.b,
        //         openingBalance: row.d != null ? +row.d : 0,
        //         accretionUptoTheMonth: row.f != null ? +row.f : 0,
        //         clearanceUptoMonth: row.h != null ? +row.h : 0,
        //         closingBalance: row.j != null ? +row.j : 0,
        //       };
        //     })
        //   : [],
  
        // dwRecoverable: sheets.dwRecoverable
        //   ? parseSheetWithAlphaKeys(sheets.dwRecoverable).map((row) => ({
        //       division,
        //       department: row.b,
        //       date: formattedDate,
        //       figure: detectFigureUnit(sheets.dwRecoverable),
        //       openingBalance: row.d != null ? +row.d : 0,
        //       openingBalanceItem: row.c != null ? +row.c : 0,
        //       accretionUptoTheMonth: row.f != null ? +row.f : 0,
        //       accretionUptoTheMonthItem: row.e != null ? +row.e : 0,
        //       clearanceUptoMonth: row.h != null ? +row.h : 0,
        //       clearanceUptoMonthItem: row.g != null ? +row.g : 0,
        //       closingBalance: row.j != null ? +row.j : 0,
        //       closingBalanceItem: row.i != null ? +row.i : 0,
        //     }))
        //   : [],
  
        // suspenseBalance: sheets.suspenseBalances
        //   ? parseSheetWithAlphaKeys(sheets.suspenseBalances).map((row) => ({
        //       division,
        //       date: formattedDate,
        //       figure: detectFigureUnit(sheets.suspenseBalances),
  
        //       // treat missing or "-" as null
        //       suspenseHeads: row.b != null && row.b !== "-" ? row.b : null,
  
        //       position: row.d != null && row.d !== "-" ? +row.d : null,
  
        //       positionItem: row.c != null && row.c !== "-" ? +row.c : null,
  
        //       positionLhr: row.f != null && row.f !== "-" ? +row.f : null,
  
        //       positionLhrItem: row.e != null && row.e !== "-" ? +row.e : null,
  
        //       closingBalance: row.h != null && row.h !== "-" ? +row.h : null,
  
        //       closingBalanceItem: row.g != null && row.g !== "-" ? +row.g : null,
  
        //       reconciliationMonth: row.i != null && row.i !== "-" ? row.i : null,
        //     }))
        //   : [],
  
        // auditObjection: sheets.auditObjections
        //   ? parseSheetWithAlphaKeys(sheets.auditObjections).map((row) => ({
        //       division,
        //       date: formattedDate,
        //       figure: detectFigureUnit(sheets.auditObjections),
        //       auditObjection: row.a,
        //       positionLhr: row.b != null ? +row.b : 0,
        //       openingBalance: row.c != null ? +row.c : 0,
        //       accretion: row.d != null ? +row.d : 0,
        //       closingBalance: row.h != null ? +row.h : 0,
        //       clearenceOverOneYear: row.e != null ? +row.e : 0,
        //       clearenceLessOneYear: row.f != null ? +row.f : 0,
        //     }))
        //   : [],
  
        // accountInspection: sheets.accountInspections
        //   ? parseSheetWithAlphaKeys(sheets.accountInspections).map((row) => ({
        //       division,
        //       date: formattedDate,
        //       figure: detectFigureUnit(sheets.accountInspections),
        //       typeOfReport: row.b,
        //       positionLhr: row.c != null ? +row.c : 0,
        //       openingBalance: row.d != null ? +row.d : 0,
        //       accretion: row.e != null ? +row.e : 0,
        //       clearanceOverOneYear: row.f != null ? +row.f : 0,
        //       clearanceLessThanOneYear: row.g != null ? +row.g : 0,
        //       totalClearance: row.h != null ? +row.h : 0,
        //       closingBalance: row.i != null ? +row.i : 0,
        //     }))
        //   : [],
  
        // completionReports: sheets.completionReports
        //   ? parseSheetWithHeaders(sheets.completionReports).map((row: any) => {
        //       const positionKey = Object.keys(row).find((key) =>
        //         key.trim().toLowerCase().startsWith("position")
        //       );
  
        //       return {
        //         department: row["Department"] ?? null,
        //         positionAsLastYearMonth: row[positionKey ?? "Position"] ?? 0,
        //         accretionUpToMonth: row["Accretion up to month"] ?? 0,
        //         clearanceUpToMonth: row["Clearance up to month"] ?? 0,
        //         closingBalance: row["Closing Balance"] ?? 0,
        //         oldestCrPending: row["Oldest C.R. pending"] ?? null,
        //         division,
        //         date: formattedDate,
        //       };
        //     })
        //   : [],
  
        // stocksheets: sheets.stocksheets
        //   ? parseSheetWithHeaders(sheets.stocksheets).map((row) => ({
        //       department: row["Department"] ?? null,
        //       openingBalanceAsLastYearMonth: row["Opening Balance"] ?? 0,
        //       accretionUpToMonth: row["Accretion up to month"] ?? 0,
        //       clearanceUpToMonth: row["Clearance up to month"] ?? 0,
        //       closingBalance: row["Closing Balance"] ?? 0,
        //       remarks: row["Remarks"] ?? null,
        //       division,
        //       date: formattedDate,
        //     }))
        //   : [],
  
        // settlementcases: sheets.settlementcases
        //   ? parseSheetWithHeaders(sheets.settlementcases).map((row) => ({
        //       item: row["Item"] ?? null,
        //       openingBalanceMonth: row["Opening balance of the month"] ?? 0,
        //       accretionDuringMonth: row["Accretion during the month"] ?? 0,
        //       clearedDuringMonth: row["Cleared during the month"] ?? 0,
        //       closingOutstanding: row["Closing outstanding"] ?? 0,
        //       division,
        //       date: formattedDate,
        //     }))
        //   : [],
  
        // savingthroughic: sheets.savingthroughic
        //   ? parseSheetWithHeaders(sheets.savingthroughic).map((row) => ({
        //       actualUpToLastMonth: row["Actual up to last month"] ?? 0,
        //       figure: detectFigureUnit(sheets.savingthroughic),
        //       forTheMonth: row["For the month"] ?? 0,
        //       totalToEndOfMonth: row["Total to end of the month"] ?? 0,
        //       remarks: row["Remarks"],
        //       division,
        //       date: formattedDate,
        //     }))
        //   : [],
        // rbinspection: sheets.rbinspection
        //   ? parseSheetWithHeaders(sheets.rbinspection).map((row) => ({
        //       yearOfReport: row["Year of Report"] ?? null,
        //       typeOfPara: row["Type of para"] ?? null,
        //       totalParas: row["Total no. of Paras"] ?? 0,
        //       parasAtStartOfMonth: row["Paras o/s at the start of month"] ?? 0,
        //       closedDuringMonth: row["Closed during the month"] ?? 0,
        //       parasOutstanding: row["No. of paras Outstanding"] ?? 0,
        //       remarks: row["Remarks"] ?? null,
        //       division,
        //       date: formattedDate,
        //     }))
        //   : [],
  
        selectedMonthYear,
        division,
      };
  
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