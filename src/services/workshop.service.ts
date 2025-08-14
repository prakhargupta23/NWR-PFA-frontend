import { fetchWrapper } from "../helpers/fetch-wrapper";
import { config } from "../shared/constants/config";
import { getUserData } from "./user.service";

/// Exporting all the function for the ab testing -----------------------/
export const WorkshopService = {
    uploadWorkshopData,
};

//// Funciton for fetching all the experiments ---------------------------/
async function uploadWorkshopData(data: any) {
  console.log("ddddddddddddddddata")
  const userdata = await getUserData();
  const response = await fetchWrapper.post(`${config.apiUrl}/api/upload-workshop-data`, {
    data,
    username: userdata.username
  });
  console.log("response",response)
  return response;
}