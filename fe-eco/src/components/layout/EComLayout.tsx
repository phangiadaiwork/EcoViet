import { Box } from "@mui/material";
import EcommerceHeader from "../header/EcommerceHeader";
import { Outlet } from "react-router-dom";
import EcommerceFooter from "../footer/EcommerceFooter";
import { useDispatch } from "react-redux";
import { useServerKeepAlive } from "../../hooks/useServerKeepAlive";
import { callFetchAccount } from "../../services/apiUser/apiAuth";
import { doGetAccountAction } from "../../redux/account/accountSlice";
import { useEffect } from "react";
import { useClientSideEffects } from "../../hooks/useClientSideEffects";

const Layout = () => {

const dispatch = useDispatch();

  // Keep-alive server chỉ chạy ở client-side
    useServerKeepAlive({
      onSuccess: () => console.log('[App] Server ping thành công'),
      onError: (error) => console.warn('[App] Server ping thất bại:', error.message)
    });

  const getAccount = async () => {
      const res = await callFetchAccount();
      if (res && res.data) {
        dispatch(doGetAccountAction(res.data))
    }
  }

  useEffect(() => {
    getAccount()
  }, [])

  useClientSideEffects();

  return (
    <div className="layout-app">
      <Box display={"flex"} flexDirection={"column"} overflow={"hidden"}>
        <EcommerceHeader />
        <Outlet />
        <EcommerceFooter />
      </Box>
    </div>
  )
}

export default Layout;