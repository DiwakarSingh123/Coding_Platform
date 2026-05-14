import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "./src/utils/axiosClient";

// 1. Create async thunk to fetch  users detaile from database....
export const registerUser = createAsyncThunk(
    "auth/register",
    async (userData, { rejectWithValue }) => {
        try {
            const response = await axiosClient.post('/api/register', userData)

            return response.data.user;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message || 'Something went wrong');
        }
    }
);


// 2. Create async thunk to fetch  users detaile from database....
export const loginUser = createAsyncThunk(
    "auth/login",
    async (creadential, { rejectWithValue }) => {
        try {
            const response = await axiosClient.post('/api/login', creadential)
            return response.data.user;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message || 'Something went wrong');
        }
    }
);

// 3. Create async thunk to check user is already here or not
export const checkAuth = createAsyncThunk(
    "auth/check",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosClient.get('/api/check',{withCredentials: true })
            console.log(response.data)
            return response.data.user;
        } catch (err) {
            if (err.response?.status === 401) {
                return null; // Not authenticated, no error
            }
            return rejectWithValue(err.response?.data?.message || err.message || 'Something went wrong');
        }
    }
);

// 1. Create async thunk to check user is logout  here or not
export const userLogout = createAsyncThunk(
    "auth/logout",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosClient.post('/api/logout')
            return response.data.user;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message || 'Something went wrong');
        }
    }
);

// Google OAuth login — sends Firebase ID token to backend
export const googleLogin = createAsyncThunk(
    "auth/googleLogin",
    async (idToken, { rejectWithValue }) => {
        try {
            const response = await axiosClient.post('/api/google-login', { idToken });
            return response.data.user;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message || 'Something went wrong');
        }
    }
);

// now here i create my Slicer...........
const authSlicer = createSlice({
    name: "auth",
    initialState: {
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null
    },
    extraReducers(builder) {
        builder
            .addCase(registerUser.pending, (state) => { // here the code is for register user.....
                state.loading=true,
                state.error=null
            })
            .addCase(registerUser.fulfilled,(state,action)=>{
                state.loading=false;
                state.error=null;
                state.isAuthenticated=!!action.payload;
                state.user=action.payload
            })
            .addCase(registerUser.rejected,(state,action)=>{
                state.loading=false;
                state.error = typeof action.payload === 'string' ? action.payload : action.payload?.message || 'Something went wrong';
                state.isAuthenticated=false;
                state.user=null;
            })
            .addCase(loginUser.pending, (state) => { // here the code is for login user.....
                state.loading=true,
                state.error=null
            })
            .addCase(loginUser.fulfilled,(state,action)=>{
                state.loading=false;
                state.error=null;
                state.isAuthenticated=!!action.payload;
                state.user=action.payload
            })
            .addCase(loginUser.rejected,(state,action)=>{
                state.loading=false;
                state.error = typeof action.payload === 'string' ? action.payload : action.payload?.message || 'Something went wrong';
                state.isAuthenticated=false;
                state.user=null;
            })
            .addCase(checkAuth.pending, (state) => { // here the code is for checkout .....
                state.loading=true,
                state.error=null
            })
            .addCase(checkAuth.fulfilled,(state,action)=>{
                state.loading=false;
                state.error=null;
                state.isAuthenticated=!!action.payload;
                state.user=action.payload
            })
            .addCase(checkAuth.rejected,(state,action)=>{
                state.loading=false;
                state.error = null; // don't show error toast for checkAuth failure
                state.isAuthenticated=false;
                state.user=null;
            })
            .addCase(userLogout.pending, (state) => { // here the code is for checkout .....
                state.loading=true,
                state.error=null
            })
            .addCase(userLogout.fulfilled,(state)=>{
                state.loading = false;
                state.user = null;
                state.isAuthenticated = false;
                state.error = null;
            })
            .addCase(userLogout.rejected,(state,action)=>{
                state.loading=false;
                state.error = action.payload?.message || 'Something went wrong';
                state.isAuthenticated=false;
                state.user=null;
            })
            // Google Login
            .addCase(googleLogin.pending, (state) => {
                state.loading=true;
                state.error=null;
            })
            .addCase(googleLogin.fulfilled,(state,action)=>{
                state.loading=false;
                state.error=null;
                state.isAuthenticated=!!action.payload;
                state.user=action.payload;
            })
            .addCase(googleLogin.rejected,(state,action)=>{
                state.loading=false;
                state.error = action.payload || 'Google login failed';
                state.isAuthenticated=false;
                state.user=null;
            })
    }
})

export default authSlicer.reducer;
