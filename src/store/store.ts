import { configureStore } from '@reduxjs/toolkit';
import portfolioSlice, { PORTFOLIO_STATE } from './portfolio.slice';
import { saveState } from './storage';

export const store = configureStore({
    reducer: {
        portfolio: portfolioSlice
    }
});

store.subscribe(() => {
    saveState(store.getState().portfolio, PORTFOLIO_STATE);
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispath = typeof store.dispatch;
