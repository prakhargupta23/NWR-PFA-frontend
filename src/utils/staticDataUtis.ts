///// Static data of the month ---------------------------------------/
export const divisions = [
  {
    name: "Ajmer",
    shades: ["#d4f5db", "#b0efc1", "#8be9a7", "#88b04b", "#6e943c", "#55772e"], // Base: #88b04b
  },
  {
    name: "Bikaner",
    shades: ["#dadbee", "#b2b5d6", "#8b8fbe", "#6b5b95", "#55497a", "#3f375f"], // Base: #6b5b95
  },
  {
    name: "Jaipur",
    shades: ["#ffe1dd", "#ffb3a7", "#ff8675", "#ff6f61", "#cc594e", "#993f36"], // Base: #ff6f61
  },

  {
    name: "Jodhpur",
    shades: ["#fff2cc", "#ffe199", "#ffd066", "#ffa500", "#cc8400", "#996300"], // Base: #ffa500
  },
];
export const workshopDivisions = [
  {
    name: "Ajmer",
    shades: ["#d4f5db", "#b0efc1", "#8be9a7", "#88b04b", "#6e943c", "#55772e"], // Base: #88b04b
  },
  {
    name: "Bikaner",
    shades: ["#dadbee", "#b2b5d6", "#8b8fbe", "#6b5b95", "#55497a", "#3f375f"], // Base: #6b5b95
  },
  // {
  //   name: "Jaipur",
  //   shades: ["#ffe1dd", "#ffb3a7", "#ff8675", "#ff6f61", "#cc594e", "#993f36"], // Base: #ff6f61
  // },

  {
    name: "Jodhpur",
    shades: ["#fff2cc", "#ffe199", "#ffd066", "#ffa500", "#cc8400", "#996300"], // Base: #ffa500
  },
];
export const desiredKeyOrderForExpenditureAndEarning = [
  "targetThisMonth",
  "actualThisMonth",
  "targetYTDThisMonth",
  "actualYTDThisMonth",
  "targetCurrentFinancialYear",
  "actualThisMonthLastYear",
  "actualYTDThisMonthLastYear",
];
export const desiredKeyOrderForComparisonForExpenditureEarning = [
  "targetThisMonth",
  "actualThisMonth",
  "targetCurrentFinancialYear",
  "actualLastFinancialYear",
];
export function getDivisionColor(name: string): string | undefined {
  const division = divisions.find((div) => div.name === name);
  return division?.shades[0];
}

export const divisionsName = ["Ajmer", "Bikaner", "Jaipur", "Jodhpur"];
export const months = [
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
const currentYear = new Date().getFullYear();
export const years = Array.from({ length: currentYear - 2000 +1 }, (_, i) => 2000 + i);
export const sectionsForWorkshopComment = [
    "Working Expenditure",
    "Plan Head",
    "Manufacturing Suspense",
    "WMS Balance",
    "WMS Closing Balance",
    "WMS Balance Analysis",
    "WMS Store Charges",
    "Position of Direct Purchase",
    "Comparative Position of Outturn",
    "POH Unit Cost",
    "Posting and Reconciliation",
    "ItemPosition in Suspense Register",
    "Unsanctioned Expenditure",
    "Inspection Para",
    "Outstanding Audit Objection",
    "Analysis Of Audit Reference",
    "Position Of Account Inspection",
    "Account Inspection Of Offices",
    "Account Inspection Report",
    "AgeWise Analysis Accounts Inspection",
    "Savings Through Internal Check",
    "HQRef Pending With Workshop",
    "Position Of Reply To HQDO Letter",
    "NCSRP And Pension Position",
    "Position Of Transfer Of Servicecard",
    "Position Of StockSheet",
    "AgeWise Position Of StockSheet",
    "DeptWise Position Stocksheet",
    "Staff References Or Cases",
    "Clearance And Adjustment Of MA",
    "Progress Of Salary Payment",
    "Progress Of E Payment",
    "Progress Of Salary Through Bank",
    "Progress Of Salary Through ECS",
    "Planned Implementation ECS",
    "Report On Facility Augmentation",
    "Test Checks By SS",
    "Test Checks By Sr ISA",
    "Quaterly Test Checks By JAG",
    "Rotation Of Staff",
    "Miscellaneous Items",
    "Completion Reports",
    "Dr And Br",
    "Position Of Imp Recoverable Items",
    "DeptWise Recoverable Items",
    "Position Of Spot Checking",
    "Status Of Revision Of Pension",
    "Assistance Required From HO",
    "Incentive Payment",
    "Turn Over Ratio",
    "Online Bill Submission Status",
    "It Implementation Status",
    "Scrap Sale",
    "Workshop Manufacturing Suspense",
]
export const sectionsForComment = [
  "Expenditure",
  "Earning",
  "Recoverable",
  "Savings_Through_IC",
  "Settlement_Cases",
  "Accounts_inspection",
  "Stock_Sheets",
  "Audit_Objections",
  "RB_HQ_Inspection",
  "Completion_Reports",
  "Suspense_Balances",
  "Dw_Recoverables",
  "Ph_Expenditure",
];
export function getLabel(metric: string): string {
  // If it contains spaces or dashes, handle accordingly
  if (/[ -]/.test(metric)) {
    return metric
      .split(/[\s-]+/) // Split on space or dash
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
      .join(" "); // Join words back with a single space
  }

  // Otherwise, convert camelCase to "Title Case"
  return metric
    .replace(/([A-Z])/g, " $1") // Add a space before each capital letter
    .replace(/^./, (str) => str.toUpperCase()) // Capitalize the first letter
    .trim();
}

// src/utils/sheetConfig.ts
export const sheetOptions = [
  "Expenditure",
  "Earning",
  "Recoverable",
  "PerformanceIndex",
  "OriginatingEarnings",
  "PHExpenditure",
  "Dwrecoverable",
  "Suspenseregister",
  "Completionreport",
  "Stocksheet",
  "Settlementcase",
  "Savingthroughic",
  "Hrinspection",
  "Auditobjection",
  "Accountinspection",
];

// helper to display a human-friendly label
export const humanLabel = (s: string) =>
  s
    .replace(/([a-z])([A-Z])/g, "$1 $2") // camelToWords if needed
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/(\w+)/g, (w) => w[0].toUpperCase() + w.slice(1));
