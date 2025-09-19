import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { 
    callGetCart, 
    callAddToCart, 
    callUpdateCartItem, 
    callRemoveFromCart, 
    callClearCart 
} from '../../services/apiCart/apiCart';

interface CartItem {
    id: string;
    productId: string;
    name: string;
    price: number;
    salePrice?: number;
    image: string;
    quantity: number;
    stock: number;
    slug: string;
}

interface CartState {
    items: CartItem[];
    totalItems: number;
    totalAmount: number;
    isLoading: boolean;
    isSyncing: boolean;
    lastSyncError: string | null;
}

const initialState: CartState = {
    items: [],
    totalItems: 0,
    totalAmount: 0,
    isLoading: false,
    isSyncing: false,
    lastSyncError: null,
};

// Async thunks for API calls
export const fetchCart = createAsyncThunk(
    'cart/fetchCart',
    async (_, { rejectWithValue }) => {
        try {
            const response = await callGetCart();
            if ((response as any)?.statusCode === 200) {
                return (response as any).data;
            }
            return rejectWithValue('Failed to fetch cart');
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch cart');
        }
    }
);

export const addToCartAsync = createAsyncThunk(
    'cart/addToCartAsync',
    async ({ productId, quantity, productData }: { 
        productId: string; 
        quantity: number; 
        productData: CartItem 
    }, { rejectWithValue }) => {
        try {
            const response = await callAddToCart(productId, quantity);
            if ((response as any)?.statusCode === 200) {
                return { item: (response as any).data, productData };
            }
            return rejectWithValue('Failed to add to cart');
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to add to cart');
        }
    }
);

export const updateCartItemAsync = createAsyncThunk(
    'cart/updateCartItemAsync',
    async ({ productId, quantity }: { productId: string; quantity: number }, { rejectWithValue }) => {
        try {
            const response = await callUpdateCartItem(productId, quantity);
            if ((response as any)?.statusCode === 200) {
                return (response as any).data;
            }
            return rejectWithValue('Failed to update cart item');
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update cart item');
        }
    }
);

export const removeFromCartAsync = createAsyncThunk(
    'cart/removeFromCartAsync',
    async (productId: string, { rejectWithValue }) => {
        try {
            const response = await callRemoveFromCart(productId);
            if ((response as any)?.statusCode === 200) {
                return productId;
            }
            return rejectWithValue('Failed to remove from cart');
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to remove from cart');
        }
    }
);

export const clearCartAsync = createAsyncThunk(
    'cart/clearCartAsync',
    async (_, { rejectWithValue }) => {
        try {
            const response = await callClearCart();
            if ((response as any)?.statusCode === 200) {
                return true;
            }
            return rejectWithValue('Failed to clear cart');
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to clear cart');
        }
    }
);

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        // Local actions (fallback when offline or not authenticated)
        addToCart: (state, action: PayloadAction<CartItem>) => {
            const existingItem = state.items.find(item => item.productId === action.payload.productId);
            
            if (existingItem) {
                if (existingItem.quantity < existingItem.stock) {
                    existingItem.quantity += action.payload.quantity;
                }
            } else {
                state.items.push(action.payload);
            }
            
            cartSlice.caseReducers.calculateTotals(state);
        },
        
        removeFromCart: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter(item => item.productId !== action.payload);
            cartSlice.caseReducers.calculateTotals(state);
        },
        
        updateQuantity: (state, action: PayloadAction<{ productId: string; quantity: number }>) => {
            const item = state.items.find(item => item.productId === action.payload.productId);
            if (item && action.payload.quantity > 0 && action.payload.quantity <= item.stock) {
                item.quantity = action.payload.quantity;
            }
            cartSlice.caseReducers.calculateTotals(state);
        },
        
        clearCart: (state) => {
            state.items = [];
            state.totalItems = 0;
            state.totalAmount = 0;
        },
        
        calculateTotals: (state) => {
            state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0);
            state.totalAmount = state.items.reduce((total, item) => {
                const price = item.salePrice || item.price;
                return total + (price * item.quantity);
            }, 0);
        },
        
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        
        syncWithServer: (state, action: PayloadAction<CartItem[]>) => {
            state.items = action.payload;
            cartSlice.caseReducers.calculateTotals(state);
        },

        clearSyncError: (state) => {
            state.lastSyncError = null;
        }
    },
    extraReducers: (builder) => {
        // Fetch cart
        builder
            .addCase(fetchCart.pending, (state) => {
                state.isLoading = true;
                state.lastSyncError = null;
            })
            .addCase(fetchCart.fulfilled, (state, action) => {
                state.isLoading = false;
                if (action.payload && action.payload.items) {
                    // Transform server data to match our CartItem interface
                    state.items = action.payload.items.map((item: any) => ({
                        id: item.id,
                        productId: item.product_id,
                        name: item.product.name,
                        price: parseFloat(item.product.price),
                        salePrice: item.product.sale_price ? parseFloat(item.product.sale_price) : undefined,
                        image: item.product.images?.[0] || item.product.image || '/images/placeholder-product.svg',
                        quantity: item.quantity,
                        stock: item.product.stock || 0,
                        slug: item.product.slug || ''
                    }));
                    cartSlice.caseReducers.calculateTotals(state);
                }
            })
            .addCase(fetchCart.rejected, (state, action) => {
                state.isLoading = false;
                state.lastSyncError = action.payload as string;
            });

        // Add to cart
        builder
            .addCase(addToCartAsync.pending, (state) => {
                state.isSyncing = true;
                state.lastSyncError = null;
            })
            .addCase(addToCartAsync.fulfilled, (state, action) => {
                state.isSyncing = false;
                // Add or update item in local state
                const { productData } = action.payload;
                const existingItem = state.items.find(item => item.productId === productData.productId);
                
                if (existingItem) {
                    existingItem.quantity += productData.quantity;
                } else {
                    state.items.push(productData);
                }
                cartSlice.caseReducers.calculateTotals(state);
            })
            .addCase(addToCartAsync.rejected, (state, action) => {
                state.isSyncing = false;
                state.lastSyncError = action.payload as string;
            });

        // Update cart item
        builder
            .addCase(updateCartItemAsync.pending, (state) => {
                state.isSyncing = true;
                state.lastSyncError = null;
            })
            .addCase(updateCartItemAsync.fulfilled, (state) => {
                state.isSyncing = false;
                // Update is handled by the local updateQuantity action
            })
            .addCase(updateCartItemAsync.rejected, (state, action) => {
                state.isSyncing = false;
                state.lastSyncError = action.payload as string;
            });

        // Remove from cart
        builder
            .addCase(removeFromCartAsync.pending, (state) => {
                state.isSyncing = true;
                state.lastSyncError = null;
            })
            .addCase(removeFromCartAsync.fulfilled, (state, action) => {
                state.isSyncing = false;
                state.items = state.items.filter(item => item.productId !== action.payload);
                cartSlice.caseReducers.calculateTotals(state);
            })
            .addCase(removeFromCartAsync.rejected, (state, action) => {
                state.isSyncing = false;
                state.lastSyncError = action.payload as string;
            });

        // Clear cart
        builder
            .addCase(clearCartAsync.pending, (state) => {
                state.isSyncing = true;
                state.lastSyncError = null;
            })
            .addCase(clearCartAsync.fulfilled, (state) => {
                state.isSyncing = false;
                state.items = [];
                state.totalItems = 0;
                state.totalAmount = 0;
            })
            .addCase(clearCartAsync.rejected, (state, action) => {
                state.isSyncing = false;
                state.lastSyncError = action.payload as string;
            });
    }
});

export const {
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    calculateTotals,
    setLoading,
    syncWithServer,
    clearSyncError
} = cartSlice.actions;

export default cartSlice.reducer;
