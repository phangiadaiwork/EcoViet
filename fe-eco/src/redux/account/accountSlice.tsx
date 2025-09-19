import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    isAuthenticated: false,
    user: {
        "id": "",
        "email": "",
        "phone": "",
        "name": "",
        "address": "",
        "roleId": "",
        "isActive": "",
        "gender": "",
        "avatar": "",
    }
}

export const accountSlide = createSlice({
    name: 'account',
    initialState,
    reducers: {
        doLoginAction: (state, action) => {
            state.isAuthenticated = true;
            state.user = action.payload;
        },
        doGetAccountAction: (state, action) => {
            state.isAuthenticated = true;
            state.user = action.payload.user;
        },
        doLogoutAction: (state) => {
            if (typeof window !== 'undefined') localStorage.removeItem("access_token");
            state.isAuthenticated = initialState.isAuthenticated;
            state.user = initialState.user;
        },
        doUpdateInfoAction: (state, action) => {
            state.user.name = action.payload.name;
            state.user.phone = action.payload.phone;
            state.user.avatar = action.payload.avatar;
            state.user.address = action.payload.address;
            state.user.gender = action.payload.gender;
        }
    },

})

export const { doLoginAction, doGetAccountAction, doLogoutAction, doUpdateInfoAction } = accountSlide.actions


export default accountSlide.reducer