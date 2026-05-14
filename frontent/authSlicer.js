import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "./src/utils/axiosClient";

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

export const checkAuth = createAsyncThunk(
    "auth/check",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosClient.get('/api/check', { withCredentials: true })
            return response.data.user;
        } catch (err) {
            if (err.response?.status === 401) {
                return null;
            }
            return rejectWithValue(err.response?.data?.message || err.message || 'Something went wrong');
        }
    }
);

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

const authSlicer = createSlice({
    name: "auth",
    initialState: {
        user: null,
        isAuthenticated: false,
        authChecked: false,  // only true after checkAuth completes
        loading: false,      // only for login/register button spinners
        error: null
    },
    extraReducers(builder) {
        builder
            // Register
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                state.isAuthenticated = !!action.payload;
                state.user = action.payload;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = typeof action.payload === 'string' ? action.payload : action.payload?.message || 'Something went wrong';
                state.isAuthenticated = false;
                state.user = null;
            })
            // Login
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                state.isAuthenticated = !!action.payload;
                state.user = action.payload;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = typeof action.payload === 'string' ? action.payload : action.payload?.message || 'Something went wrong';
                state.isAuthenticated = false;
                state.user = null;
            })
            // CheckAuth — uses authChecked, NOT loading
            .addCase(checkAuth.pending, (state) => {
                state.authChecked = false;
                state.error = null;
            })
            .addCase(checkAuth.fulfilled, (state, action) => {
                state.authChecked = true;
                state.error = null;
                state.isAuthenticated = !!action.payload;
                state.user = action.payload;
            })
            .addCase(checkAuth.rejected, (state) => {
                state.authChecked = true;
                state.error = null;
                state.isAuthenticated = false;
                state.user = null;
            })
            // Logout
            .addCase(userLogout.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(userLogout.fulfilled, (state) => {
                state.loading = false;
                state.user = null;
                state.isAuthenticated = false;
                state.error = null;
            })
            .addCase(userLogout.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Something went wrong';
                state.isAuthenticated = false;
                state.user = null;
            })
            // Google Login
            .addCase(googleLogin.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(googleLogin.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                state.isAuthenticated = !!action.payload;
                state.user = action.payload;
            })
            .addCase(googleLogin.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Google login failed';
                state.isAuthenticated = false;
                state.user = null;
            })
    }
})

export default authSlicer.reducer;
