import { combineReducers, configureStore } from '@reduxjs/toolkit'
import {
    persistStore,
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import accountSlice from './account/accountSlice'
import cartSlice from './cart/cartSlice'
import noopStorage from './noopStorage';

const isServer = typeof window === 'undefined';
const persistConfig = {
    key: 'root',
    version: 1,
    storage: isServer ? noopStorage : storage,
    whitelist: ['account', 'cart']
}

const rootReducer = combineReducers({
    account: accountSlice,
    cart: cartSlice,
},)

const persistedReducer = persistReducer(persistConfig, rootReducer)


export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
})


export const persistor = persistStore(store)