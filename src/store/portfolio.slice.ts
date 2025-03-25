import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { loadState, saveState } from './storage';
import { IResponseProps } from '../Response.props';

export const PORTFOLIO_STATE = 'portfolioData';

export interface PortfolioState {
    list: IResponseProps[];
    url: string;
}

const initialState: PortfolioState = loadState<PortfolioState>(PORTFOLIO_STATE) ?? {
    list: [],
    url: ''
};

export const portfolioSlice = createSlice({
    name: 'portfolio',
    initialState,
    reducers: {
        delete: (state, action: PayloadAction<string>) => {
            if (state.list.length === 1) {
                state.list = [];
                state.url = '';
                return;
            }

            state.list = state.list.filter((i) => i.symbol !== action.payload);
            action.payload = action.payload.toLowerCase();
            let newUrl = state.url.replace(action.payload + '@ticker/', '');
            if (newUrl.length === state.url.length) {
                newUrl = state.url.replace('/' + action.payload + '@ticker', '');
            }
            state.url = newUrl;

            saveState<PortfolioState>(state, PORTFOLIO_STATE);
        },
        upsert: (state, action: PayloadAction<IResponseProps>) => {
            if (!state.list.find((i) => i.symbol === action.payload.symbol)) {
                state.list.push(action.payload);
                state.url =
                    state.url.length > 0
                        ? state.url + '/' + action.payload.symbol.toLowerCase() + '@ticker'
                        : state.url + action.payload.symbol.toLowerCase() + '@ticker';
            } else {
                state.list = state.list.map((i) => {
                    if (i.symbol === action.payload.symbol) {
                        if (action.payload.count > 0) {
                            i.count += action.payload.count;
                        } else {
                            i.lastPrice = action.payload.lastPrice;
                            i.priceChangePercent = action.payload.priceChangePercent;
                        }
                    }
                    return i;
                });
            }

            const sum = state.list.reduce((sum, item) => {
                return sum + item.count * item.lastPrice;
            }, 0);
            state.list = state.list.map((i) => {
                const a = (i.count * i.lastPrice * 100) / sum;
                i.percentPortfolio = a < 0.01 ? 0 : Math.round(a * 100) / 100;
                i.lastPrice = i.lastPrice < 0.01 ? 0 : Math.round(i.lastPrice * 100) / 100;
                i.priceChangePercent = Math.round(i.priceChangePercent * 100) / 100;
                return i;
            });

            saveState<PortfolioState>(state, PORTFOLIO_STATE);
        }
    }
});

export default portfolioSlice.reducer;
export const portfolioActions = portfolioSlice.actions;
