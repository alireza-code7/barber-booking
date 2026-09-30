import { createContext, useContext, useEffect, useState } from "react";
import { Api } from "../services/api";

const AuthContext = createContext();
export const AuthProvider = ({children})=>{
    const [user,setUser] = useState(null)
    const [loading,setLoading] = useState(true)


    useEffect(()=>{
        const checkAuth = async ()=>{
            try{
                const response= await Api.get("/checkAuth.php")
                if(response.data.loggedIn){
                    setUser(response.data.user)
                }
            }catch(error){
                console.error("خطا در احراز هویت",error);
                
            }finally{
                setLoading(false)
            }
        }
        checkAuth()
    },[])

    const login=(userData)=>{
        
        
        setUser(userData)
      
        
    }

    const logout= async ()=>{
        try{
            await Api.post("/logout.php")
            setUser(null)
        }catch(error){
            console.error("خطا در خروج",error);
        }
    }

    return(
        <AuthContext.Provider value={{user,loading,login,logout}}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = ()=> useContext(AuthContext)
