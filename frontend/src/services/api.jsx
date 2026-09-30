import axios from "axios";

export const Api = axios.create({
    baseURL: "https://barber.site.je/api",
    withCredentials:true,
    headers:{
        "Content-Type":"application/json"
    },
})