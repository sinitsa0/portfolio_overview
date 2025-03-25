export interface IPortfolioProps {
    name: string;
    active: boolean;
    count?: number;
    price: number;
    sumPrice?: number;
    priceChangePercent: number;
    portfolioPercent?: number;
    onClick?(): void;
}
