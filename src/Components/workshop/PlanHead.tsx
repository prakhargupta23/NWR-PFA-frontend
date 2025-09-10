import React, { useEffect, useState } from "react";
import {
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  ToggleButtonGroup,
  ToggleButton,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import BarGraph from "../../modules/BarChart";
import SimpleBarGraph from "../../modules/SimpleBarGraph";
import TrendBarGraph from "../../modules/TrendBarGraph";
import { months, years, divisionsName } from "../../utils/staticDataUtis";
import { WorkshopService } from "../../services/workshop.service";

function PlanHead() {
  const workshopDivisions = divisionsName.filter((d) => d !== "Jaipur");
  const desiredKeyOrderForComparison = [
    "ActualfortheMonthLastYear",
    "RBG",
    "ActualfortheMonthCurrentYear",
    "Actual",
  ];

  const [division, setDivision] = useState<string[]>(["Ajmer"]);
  const [selectedDataType, setSelectedDataType] = useState<string[]>([
    "RBG",
  ]);
  const [defaultCheckBoxMarked, setDefaultCheckBoxMarked] = useState(false);
  const [localData, setLocalData] = useState<any[]>([]);
  const [forceReload, setForceReload] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rawData, setRawData] = useState<any[]>([]);

  const handleDivisionChangeCustom = (name: string) => {
    setDivision((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
    );
  };

  const handleDataTypeChangeCustom = (name: string) => {
    setSelectedDataType((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
    );
  };

  const [selectedDate, setSelectedDate] = useState({
    month: "January",
    year: new Date().getFullYear(),
  });

  const [trendDateRange, setTrendDateRange] = useState({
    fromMonth: "January",
    fromYear: new Date().getFullYear(),
    toMonth: "June",
    toYear: new Date().getFullYear(),
  });

  const [selectedTab, setSelectedTab] = useState("amount");
  const [selectedGraphTab, setSelectedGraphTab] = useState("Bar");
  const dataType = [
    "RBG",
    "Actual",
    "ActualfortheMonthCurrentYear",
    "ActualfortheMonthLastYear",
  ];
  const [varianceData, setVarianceData] = useState<any[]>([]);
  const [uniqueCategories, setUniqueCategories] = useState<any[]>([]);

  const handleChartToggle = (
    event: React.MouseEvent<HTMLElement>,
    newType: any
  ) => {
    if (newType !== null) {
      setSelectedGraphTab(newType);
    }
  };

  const handleDateRangeChange = (field: string, value: any) => {
    setTrendDateRange((prev) => {
      const newRange = {
        ...prev,
        [field]: value,
      };

      const fromDate = new Date(`1 ${newRange.fromMonth} ${newRange.fromYear}`);
      const toDate = new Date(`1 ${newRange.toMonth} ${newRange.toYear}`);

      const monthDiff =
        (toDate.getFullYear() - fromDate.getFullYear()) * 12 +
        (toDate.getMonth() - fromDate.getMonth()) +
        1;

      if (monthDiff > 6) {
        const adjustedToDate = new Date(fromDate);
        adjustedToDate.setMonth(adjustedToDate.getMonth() + 5);

        return {
          ...newRange,
          toMonth: months[adjustedToDate.getMonth()],
          toYear: adjustedToDate.getFullYear(),
        };
      }

      return newRange;
    });
    setForceReload((prev) => !prev);
  };

  const getDefaultNwrShades = (count: number) => {
    const baseColors = [
      "#4e79a7",
      "#f28e2b",
      "#e15759",
      "#76b7b2",
      "#59a14f",
      "#edc948",
      "#b07aa1",
      "#ff9da7",
      "#9c755f",
      "#bab0ac",
    ];

    return baseColors.slice(0, count);
  };

  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      try {
        setLoading(true);
        const response = await WorkshopService.fetchAllDataFromTable("planHead");
        const list = (response && (response.data?.data || response.data)) || [];
        const filteredList = list.filter((item: any) => item.division !== "Jaipur");
        if (isMounted) setRawData(Array.isArray(filteredList) ? filteredList : []);
      } catch (e) {
        if (isMounted) setRawData([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchData();
    return () => {
      isMounted = false;
    };
  }, [forceReload]);

  useEffect(() => {
    try {
      if (selectedGraphTab === "Trend") {
        processTrendData();
      } else if (selectedGraphTab === "Bar") {
        processBarData();
      } else if (selectedGraphTab === "Comparison") {
        processComparisonData();
      }
    } catch (error) {
      console.error("Error processing data:", error);
    }
  }, [
    rawData,
    selectedTab,
    selectedGraphTab,
    selectedDate,
    division,
    selectedDataType,
    defaultCheckBoxMarked,
    trendDateRange,
    forceReload,
  ]);

  const toNumericMonthYear = (monthName: string, year: number | string) => {
    const monthIndex = months.indexOf(monthName) + 1;
    const mm = String(monthIndex).padStart(2, "0");
    return `${mm}/${year}`;
  };

  const processBarData = () => {
    const selectedMonthYear = toNumericMonthYear(
      selectedDate.month,
      selectedDate.year
    );

    const monthData = rawData.filter((item) => item.date === selectedMonthYear);

    if (!monthData || monthData.length === 0) {
      setLocalData([]);
      setUniqueCategories([]);
      return;
    }

    const cleanedMonthData = monthData.map(({ date, PlanHead, ...rest }) => ({
      ...rest,
    }));

    const groupedData: Record<string, any> = {};
    const allKeys: Set<string> = new Set();

    cleanedMonthData.forEach((item) => {
      const { division, ...rest } = item as any;

      if (!groupedData[division]) {
        groupedData[division] = { division };

        Object.keys(rest).forEach((key) => {
          groupedData[division][key] = 0;
        });
      }

      Object.keys(rest).forEach((key) => {
        const v = (item as any)[key];
        if (typeof v === "number") groupedData[division][key] += v || 0;
        if (key !== "division") allKeys.add(key);
      });
    });

    workshopDivisions.forEach((div) => {
      if (!groupedData[div]) {
        groupedData[div] = { division: div } as any;
        Array.from(allKeys).forEach((k) => {
          if (k !== "division") (groupedData[div] as any)[k] = 0;
        });
      }
    });

    const formattedBarData = Object.values(groupedData).sort((a, b) => {
      return (
        workshopDivisions.indexOf((a as any).division) -
        workshopDivisions.indexOf((b as any).division)
      );
    });

    setUniqueCategories([]);
    setLocalData(formattedBarData);
  };

  const processComparisonData = () => {
    const comparisonKeys = desiredKeyOrderForComparison;

    const selectedMonthYear = toNumericMonthYear(
      selectedDate.month,
      selectedDate.year
    );

    const filteredDataForMonth = rawData.filter(
      (item) => item.date === selectedMonthYear
    );

    const comparisonData: Record<string, Record<string, number>> = {};

    filteredDataForMonth.forEach((item: any) => {
      const { division } = item;

      comparisonKeys.forEach((key: any) => {
        if (!comparisonData[key]) {
          comparisonData[key] = {};
        }

        if (!comparisonData[key][division]) {
          comparisonData[key][division] = 0;
        }

        const value = item[key];
        if (typeof value === "number") {
          comparisonData[key][division] += value;
        }
      });
    });

    const formattedComparisonData = Object.entries(comparisonData).map(
      ([key, value]) => ({
        key,
        ...value,
      })
    );

    const availableDivisions = workshopDivisions.filter((d) =>
      formattedComparisonData.some((item) => Object.prototype.hasOwnProperty.call(item, d))
    );

    const formattedComparisonDataSorted = formattedComparisonData
      .sort((a, b) => {
        return (
          desiredKeyOrderForComparison.indexOf(a.key) -
          desiredKeyOrderForComparison.indexOf(b.key)
        );
      })
      .map((item: any) => {
        const sortedItem: Record<string, any> = { key: item.key };

        availableDivisions.forEach((d) => {
          if (Object.prototype.hasOwnProperty.call(item, d)) {
            sortedItem[d] = item[d];
          }
        });

        return sortedItem;
      });

    setUniqueCategories(
      Object.keys(
        filteredDataForMonth.reduce((acc: any, item: any) => {
          acc[item.division] = true;
          return acc;
        }, {})
      )
    );

    setLocalData(formattedComparisonDataSorted);
  };

  const processTrendData = () => {
    let filteredDivisionData = defaultCheckBoxMarked
      ? rawData
      : rawData.filter((item) => division.includes(item.division));

    const fromDate = new Date(
      `1 ${trendDateRange.fromMonth} ${trendDateRange.fromYear}`
    );
    const toDate = new Date(
      `1 ${trendDateRange.toMonth} ${trendDateRange.toYear}`
    );

    const allMonthsInRange: string[] = [];
    let currentDate = new Date(fromDate);

    while (currentDate <= toDate) {
      const mm = String(currentDate.getMonth() + 1).padStart(2, "0");
      allMonthsInRange.push(`${mm}/${currentDate.getFullYear()}`);
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    const filteredByDateRange = allMonthsInRange.flatMap((month) => {
      const foundData = filteredDivisionData.filter((item) => item.date === month);

      if (foundData.length > 0) {
        return foundData;
      }

      return defaultCheckBoxMarked
        ? [
            {
              date: month,
              division: "NWR",
              ...Object.fromEntries(dataType.map((key) => [key, 0])),
            },
          ]
        : division.map((div) => ({
            date: month,
            division: div,
            ...Object.fromEntries(dataType.map((key) => [key, 0])),
          }));
    });

    const groupedByMonth: Record<string, Record<string, any>> = {};

    filteredByDateRange.forEach((item: any) => {
      const month = item.date;
      const div = item.division;

      if (!groupedByMonth[month]) {
        groupedByMonth[month] = { date: month };
      }

      selectedDataType.forEach((dt) => {
        const value = item[dt];
        if (typeof value === "number") {
          const key = `${div} - ${dt}`;
          groupedByMonth[month][key] =
            (groupedByMonth[month][key] || 0) + value;
        }
      });
    });

    if (defaultCheckBoxMarked) {
      allMonthsInRange.forEach((formattedDate) => {
        selectedDataType.forEach((dt) => {
          const nwrValue = ["Jodhpur", "Bikaner", "Ajmer"].reduce(
            (sum: number, divName) => {
              const key = `${divName} - ${dt}`;
              return sum + (groupedByMonth[formattedDate]?.[key] || 0);
            },
            0
          );

          if (!groupedByMonth[formattedDate]) {
            groupedByMonth[formattedDate] = { date: formattedDate };
          }
          groupedByMonth[formattedDate][`NWR - ${dt}`] = nwrValue;
        });
      });
    }

    interface TrendDataItem {
      date: string;
      [key: string]: any;
    }

    const processedTrendData: TrendDataItem[] = Object.entries(
      groupedByMonth
    ).map(([month, data]) => ({
      date: month,
      ...data,
    }));

    const allCategories = Array.from(
      new Set(
        processedTrendData.flatMap((item) =>
          Object.keys(item).filter((key) => key !== "date")
        )
      )
    ).filter((category) =>
      processedTrendData.some(
        (item) => typeof (item as any)[category] === "number" && (item as any)[category] > 0
      )
    );

    let filteredCategoriesSorted = allCategories;
    if (!defaultCheckBoxMarked) {
      filteredCategoriesSorted = allCategories.sort((a, b) => {
        const divisionA = workshopDivisions.find((d) => a.includes(d)) ?? "";
        const divisionB = workshopDivisions.find((d) => b.includes(d)) ?? "";
        return (
          workshopDivisions.indexOf(divisionA) - workshopDivisions.indexOf(divisionB)
        );
      });
    } else {
      filteredCategoriesSorted = allCategories.sort((a, b) => {
        const isNWRA = a.includes("NWR - ");
        const isNWRB = b.includes("NWR - ");
        if (isNWRA && !isNWRB) return 1;
        if (!isNWRA && isNWRB) return -1;
        return a.localeCompare(b);
      });
    }

    let filteredTrendData = processedTrendData.map((item) => {
      const filteredItem: any = { date: item.date };
      filteredCategoriesSorted.forEach((category) => {
        if (Object.prototype.hasOwnProperty.call(item, category)) {
          filteredItem[category] = (item as any)[category];
        } else {
          filteredItem[category] = 0;
        }
      });
      return filteredItem;
    });

    setUniqueCategories(filteredCategoriesSorted);
    setLocalData(filteredTrendData);
  };

  const CustomTooltip = ({ active, payload, label }: any) => null;

  return (
    <>
      <Box sx={{
        width: "96%",
        pt: "2%",
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
      }}>
        <ToggleButtonGroup
          value={selectedGraphTab}
          onChange={handleChartToggle}
          exclusive
          sx={{
            backgroundColor: "#222633",
            borderRadius: "12px",
            height: "40px",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            flexWrap: "nowrap",
          }}
        >
          {["Bar", "Trend", "Comparison"].map((label) => (
            <ToggleButton
              key={label}
              value={label}
              sx={{
                px: 2,
                color: selectedGraphTab === label ? "#fff" : "#A5A5A5",
                background: selectedGraphTab === label
                  ? "linear-gradient(90deg, #7B2FF7, #9F44D3)"
                  : "transparent",
                "&.Mui-selected": {
                  background: "linear-gradient(90deg, #7B2FF7, #9F44D3)",
                  color: "#fff",
                },
                fontSize: 16,
                fontWeight: 600,
                fontFamily: "MyCustomFont, SourceSerif4_18pt",
                textTransform: "none",
                whiteSpace: "nowrap",
              }}
            >
              {label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      <Paper sx={{
        display: "flex",
        margin: "4px 12px",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        borderRadius: "10px",
        backgroundColor: "#222633",
        border: "1px solid #222633",
      }}>
        <Grid container justifyContent="center" alignItems="center" sx={{
          height: selectedGraphTab === "Bar" ? "90%" : "90%",
        }}>
          <Grid container alignItems="center" justifyContent="space-between" spacing={2} sx={{
            width: "100%",
            flexWrap: "wrap",
            mt: 1,
            px: 2
          }}>
            {selectedGraphTab === "Trend" ? (
              <>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" sx={{ color: '#fff', mb: 1 }}>
                    From Month
                  </Typography>
                  <Select
                    value={trendDateRange.fromMonth}
                    onChange={(e) => handleDateRangeChange('fromMonth', e.target.value)}
                    fullWidth
                    sx={{
                      backgroundColor: "#222633",
                      borderRadius: "10px",
                      height: "40px",
                      color: "#fff",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      "& .MuiSelect-icon": { color: "#fff" },
                    }}
                  >
                    {months.map((month) => (
                      <MenuItem key={month} value={month}>
                        {month}
                      </MenuItem>
                    ))}
                  </Select>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" sx={{ color: '#fff', mb: 1 }}>
                    From Year
                  </Typography>
                  <Select
                    value={trendDateRange.fromYear}
                    onChange={(e) => handleDateRangeChange('fromYear', e.target.value)}
                    fullWidth
                    sx={{
                      backgroundColor: "#222633",
                      borderRadius: "10px",
                      height: "40px",
                      color: "#fff",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      "& .MuiSelect-icon": { color: "#fff" },
                    }}
                  >
                    {years.map((year) => (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    ))}
                  </Select>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" sx={{ color: '#fff', mb: 1 }}>
                    To Month
                  </Typography>
                  <Select
                    value={trendDateRange.toMonth}
                    onChange={(e) => handleDateRangeChange('toMonth', e.target.value)}
                    fullWidth
                    sx={{
                      backgroundColor: "#222633",
                      borderRadius: "10px",
                      height: "40px",
                      color: "#fff",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      "& .MuiSelect-icon": { color: "#fff" },
                    }}
                  >
                    {months.map((month) => (
                      <MenuItem key={month} value={month}>
                        {month}
                      </MenuItem>
                    ))}
                  </Select>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" sx={{ color: '#fff', mb: 1 }}>
                    To Year
                  </Typography>
                  <Select
                    value={trendDateRange.toYear}
                    onChange={(e) => handleDateRangeChange('toYear', e.target.value)}
                    fullWidth
                    sx={{
                      backgroundColor: "#222633",
                      borderRadius: "10px",
                      height: "40px",
                      color: "#fff",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      "& .MuiSelect-icon": { color: "#fff" },
                    }}
                  >
                    {years.map((year) => (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    ))}
                  </Select>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{
                    display: "inline-flex",
                    overflowX: "auto",
                    gap: 1,
                    bgcolor: "#282828",
                    borderRadius: "8px",
                    whiteSpace: "nowrap",
                    width: "100%",
                    p: 1,
                    scrollbarColor: "#444 #000",
                  }}>
                    {[{ name: "NWR" }, ...workshopDivisions.map(name => ({ name }))].map((d) => (
                      <FormControlLabel
                        key={d.name}
                        control={
                          <Checkbox
                            checked={
                              d.name === "NWR"
                                ? defaultCheckBoxMarked
                                : division.includes(d.name)
                            }
                            onChange={() => {
                              if (d.name === "NWR") {
                                setDefaultCheckBoxMarked(!defaultCheckBoxMarked);
                                if (!defaultCheckBoxMarked) setDivision([]);
                              } else if (!defaultCheckBoxMarked) {
                                handleDivisionChangeCustom(d.name);
                              }
                            }}
                            sx={{
                              color: "#fff",
                              p: 0.25,
                              "&.Mui-checked": { color: "#571F90" },
                            }}
                            disabled={defaultCheckBoxMarked && d.name !== "NWR"}
                          />
                        }
                        label={d.name}
                        sx={{
                          color: "#fff",
                          fontSize: "0.85rem",
                          fontFamily: "MyCustomFont, SourceSerif4_18pt",
                          m: 0,
                          flex: "0 0 auto",
                        }}
                      />
                    ))}
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{
                    display: "inline-flex",
                    overflowX: "auto",
                    gap: 1,
                    bgcolor: "#282828",
                    borderRadius: "8px",
                    whiteSpace: "nowrap",
                    width: "100%",
                    p: 1,
                    scrollbarColor: "#444 #000",
                  }}>
                    {dataType.map((d) => (
                      <FormControlLabel
                        key={d}
                        control={
                          <Checkbox
                            checked={selectedDataType.includes(d)}
                            onChange={() => handleDataTypeChangeCustom(d)}
                            sx={{
                              color: "#fff",
                              p: 0.25,
                              "&.Mui-checked": { color: "##571F90" },
                            }}
                          />
                        }
                        label={d}
                        sx={{
                          color: "#fff",
                          fontSize: "0.85rem",
                          fontFamily: "MyCustomFont, SourceSerif4_18pt",
                          m: 0,
                          flex: "0 0 auto",
                        }}
                      />
                    ))}
                  </Box>
                </Grid>
              </>
            ) : (
              <>
                <Grid item xs={12} sm={6} md={4}>
                  <Select
                    value={selectedDate.month}
                    onChange={(e) => setSelectedDate(prev => ({ ...prev, month: e.target.value }))}
                    fullWidth
                    sx={{
                      backgroundColor: "#222633",
                      borderRadius: "10px",
                      height: "40px",
                      color: "#fff",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      "& .MuiSelect-icon": { color: "#fff" },
                    }}
                  >
                    {months.map((month) => (
                      <MenuItem key={month} value={month}>
                        {month}
                      </MenuItem>
                    ))}
                  </Select>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Select
                    value={selectedDate.year}
                    onChange={(e) => {
                      const yearValue = Number(e.target.value);
                      setSelectedDate(prev => ({ ...prev, year: yearValue }));
                    }}
                    fullWidth
                    sx={{
                      backgroundColor: "#222633",
                      borderRadius: "10px",
                      height: "40px",
                      color: "#fff",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      "& .MuiSelect-icon": { color: "#fff" },
                    }}
                  >
                    {years.map((year) => (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    ))}
                  </Select>
                </Grid>
              </>
            )}
          </Grid>

          {loading ? (
            <CircularProgress />
          ) : localData && localData.length > 0 ? (
            <>
              {selectedGraphTab === "Bar" ? (
                <BarGraph data={localData} stackId={false} type={"Expenditure"} />
              ) : selectedGraphTab === "Comparison" ? (
                <SimpleBarGraph data={localData} graphType={"Expenditure"} />
              ) : (
                <TrendBarGraph
                  uniqueCategories={uniqueCategories}
                  defaultCheckBoxMarked={defaultCheckBoxMarked}
                  lineData={localData}
                  selectedTab={selectedTab}
                  color="#fff"
                  dataDownload={true}
                  month={selectedDate}
                  graphType={"Expenditure"}
                  varianceData={[]}
                  customTooltip={<CustomTooltip />}
                  getDefaultNwrShades={getDefaultNwrShades}
                />
              )}
            </>
          ) : (
            <Typography sx={{
              fontFamily: "MyCustomFont,SourceSerif4_18pt",
              color: "#fff",
              py: 4
            }}>
              No Data Available
            </Typography>
          )}
        </Grid>
      </Paper>
    </>
  );
}

export default PlanHead;


