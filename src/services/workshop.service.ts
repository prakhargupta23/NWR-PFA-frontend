import { fetchWrapper } from "../helpers/fetch-wrapper";
import { config } from "../shared/constants/config";
import { getUserData } from "./user.service";

/// Exporting all the function for the ab testing -----------------------/
export const WorkshopService = {
    uploadWorkshopData,
    fetchAllDataFromTable,
};

//// Funciton for fetching all the experiments ---------------------------/
async function uploadWorkshopData(data: any) {
  console.log("ddddddddddddddddata",data)
  const userdata = await getUserData();
  const response = await fetchWrapper.post(`${config.apiUrl}/api/upload-workshop-data`, {
    data,
    username: userdata.username
  });
  console.log("response",response)
  return response;
}

//// Function for fetching all data from a specific table ---------------------------/
async function fetchAllDataFromTable(tableName: string) {
  try {
    if (!tableName) {
      throw new Error("Table name parameter is required");
    }
    
    console.log(`Fetching all data from table: ${tableName}`);
    
    const userdata = await getUserData();
    const response = await fetchWrapper.post(`${config.apiUrl}/api/fetch-workshop-data`, {
      tableName: tableName,
      username: userdata.username
    });
    
    console.log("fetchAllDataFromTable response:", response);
    return response;
  } catch (error) {
    console.error('Error in fetchAllDataFromTable:', error);
    throw error;
  }
}