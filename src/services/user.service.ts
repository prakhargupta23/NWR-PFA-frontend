import { BehaviorSubject } from "rxjs";
import { fetchWrapper } from "../helpers/fetch-wrapper";
import { config } from "../shared/constants/config";



export const userSubject: any = new BehaviorSubject(
  JSON.parse(localStorage.getItem("user")!)
);

/// Exporting all the function for the ab testing -----------------------/
export const userService = {
  login,
  getCredentials,

  get userValue() {
    return userSubject.value || JSON.parse(localStorage.getItem("user")!);
  },
};
// Function to fetch user data from localStorage
export function getUserData() {
  console.log("getUserData called");
  const userData = localStorage.getItem("user");
  if (userData) {
    console.log("User data found in localStorage:", userData);
    return JSON.parse(userData);
  }
  console.log("No user data found in localStorage");
  return null; // Return null if no user data is found
}

//// Funciton for creating new experiments ---------------------------/
async function login(username: string, password: string) {
  const portal = "expenditure"
  let response = await fetchWrapper.post(`${config.apiUrl}/api/login`, {
    username,
    password,
    portal,
  });
  console.log("respons ofscjnadskze",response)

  localStorage.setItem("user", JSON.stringify({ jwt: response.data.jwt, username: username }));
  let user = {
    jwt: response.data.jwt,
    role: response.data.role,
    username: username,
  };
  userSubject.next(user);
  console.log("kadjszcjkadshdfznj", userSubject.value)
  return response;
}

async function getCredentials() {
  return fetchWrapper.get(`${config.apiUrl}/api/get-azure-cred?portal=pfa`);
}
