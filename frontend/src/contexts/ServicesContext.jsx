import {  Children, createContext, useContext, useEffect, useState } from "react"
import { Api } from "../services/api"

const ServicesContext = createContext()

 export const ServiceProvider =  ({children})=>{
    const [services , setServices] = useState([])

    useEffect(()=>{
        const fetchService = async ()=>{
            try{
                const res = await Api.get("/getservices.php")
              
                if(res.data.status){ setServices(res.data.services)};
             
                
        
            } catch(err){
                return(
                    <div>
                        <h1>خطا در دریافت :{err}</h1>
                    </div>
                )    
            }
        }
        fetchService();
    },[])

    return(
        <ServicesContext.Provider value={{services}}>
            {children}
        </ServicesContext.Provider>
    )
 }

 export const useServices = ()=> useContext(ServicesContext)
