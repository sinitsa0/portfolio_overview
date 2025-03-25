import { ChangeEvent, useEffect, useState } from 'react';
import { IResponseProps } from './Response.props';
import PortfolioItem from './components/PortfolioItem/PortfolioItem';
import axios from 'axios';
import Button from './components/Button/Button';
import cn from 'classnames';
import styles from './App.module.scss';
import Input from './components/Input/Input';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispath, RootState } from './store/store';
import { portfolioActions } from './store/portfolio.slice';

function App() {
    const [formActive, setFormActive] = useState(false);
    const [formItemSelected, setFormItemSelected] = useState<IResponseProps>({
        symbol: '',
        lastPrice: 0,
        priceChangePercent: 0,
        count: 1
    });
    const [formItems, setFormItems] = useState<IResponseProps[]>([]);
    const [formItemsOld, setFormItemsOld] = useState<IResponseProps[]>([]);
    const [, setWs] = useState<WebSocket | null>(null);
    const [filter, setFilter] = useState<string>('');
    const dispatch = useDispatch<AppDispath>();
    const list = useSelector((s: RootState) => s.portfolio.list);
    const url = useSelector((s: RootState) => s.portfolio.url);

    function upsert(row: IResponseProps | null) {
        if (row === null) row = formItemSelected;
        dispatch(portfolioActions.upsert(row));
    }

    useEffect(() => {
        if (formActive) {
            setFormItemSelected({
                symbol: '',
                lastPrice: 0,
                priceChangePercent: 0,
                count: 1
            });
            getItems();
        }
    }, [formActive]);

    useEffect(() => {
        if (url !== '') {
            const websocket = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${url}`);
            websocket.onmessage = (event: { data: string }) => {
                //когда получаем данные
                const { data } = JSON.parse(event.data);
                upsert({
                    count: 0,
                    symbol: data.s,
                    lastPrice: Number(data.a),
                    priceChangePercent: data.P
                });
            };

            websocket.onclose = () => {
                console.warn('Socket закрыт');
            };
            websocket.onopen = () => {
                console.warn('Socket открыт');
            };
            setWs(websocket);

            return () => {
                websocket.close();
            };
        }
    }, [url]);

    useEffect(() => {
        getFilterRes(filter);
    }, [filter]);

    const getFilterRes = (fil: string) => {
        if (fil.length === 0) {
            setFormItems(formItemsOld);
        } else {
            setFormItems(formItemsOld.filter((i) => i.symbol.includes(fil)));
        }
    };

    const openForm = () => {
        setFormActive(true);
    };

    const getItems = async () => {
        try {
            const { data } = await axios.get<IResponseProps[]>(`https://api.binance.com/api/v3/ticker/24hr`);
            const usdt: IResponseProps[] = data.filter((item) => {
                // фильтр по *USDT в symbol
                return item.symbol.includes('USDT');
            });

            const items = usdt
                .map((item) => {
                    return {
                        symbol: item.symbol,
                        lastPrice: Math.round(item.lastPrice * 100) / 100,
                        priceChangePercent: item.priceChangePercent,
                        count: 0
                    };
                })
                .slice(0, 150);
            setFormItems(items);
            setFormItemsOld(items);
        } catch (e) {
            console.error(e);
        }
    };

    const addRow = () => {
        if (formItemSelected.symbol.length > 0 && formItemSelected.count > 0) {
            upsert(null);
            setFormActive(false);
        }
    };

    const countItem = (e: ChangeEvent<HTMLInputElement>) => {
        setFormItemSelected({ ...formItemSelected, count: e.target.value.length > 0 ? Number(e.target.value) : 0 });
    };

    // const close = () => {
    //     ws?.close();
    // };

    const delItem = (name: string) => {
        dispatch(portfolioActions.delete(name));
    };

    const updateFilter = (e: ChangeEvent<HTMLInputElement>) => {
        setFilter(e.target.value.toUpperCase());
    };

    return (
        <>
            <div className={styles['head']}>
                <div>PORTFOLIO OVERVIEW</div>
                <Button className={styles['add']} onClick={openForm}>
                    Добавить
                </Button>
            </div>
            {list.length == 0 && (
                <div className={styles['noContent']}>Нет активов в вашем портфеле. Добавьте что-нибудь, чтобы начать!</div>
            )}
            {formActive && (
                <div
                    className={cn(styles['form'], {
                        [styles['active']]: formActive
                    })}
                    onClick={() => setFormActive(false)}
                >
                    <div className={styles['content']} onClick={(e) => e.stopPropagation()}>
                        <Input type="text" placeholder="Поиск валюты" onChange={updateFilter} />

                        <div
                            className={cn(styles['conteiner'], {
                                [styles['little']]: true
                            })}
                        >
                            <div className={styles['row']}>
                                <div className={styles['column']}>Актив</div>
                                <div className={styles['column']}>Цена</div>
                                <div className={styles['column']}>24ч.</div>
                            </div>
                            {formItems.map((el: IResponseProps) => (
                                <PortfolioItem
                                    key={el.symbol}
                                    name={el.symbol}
                                    active={el.symbol === formItemSelected.symbol}
                                    price={el.lastPrice}
                                    priceChangePercent={el.priceChangePercent}
                                    onClick={() =>
                                        setFormItemSelected({
                                            symbol: el.symbol,
                                            lastPrice: el.lastPrice,
                                            priceChangePercent: el.priceChangePercent,
                                            count: 1
                                        })
                                    }
                                />
                            ))}
                        </div>
                        {formItemSelected.symbol.length > 0 && (
                            <Input
                                type="number"
                                placeholder="Количество"
                                min={1}
                                max={1000}
                                onChange={countItem}
                                defaultValue={1}
                                required
                                step="1"
                            />
                        )}
                        <div className={styles['addCancel-conteiner']}>
                            <Button onClick={addRow} className={styles['addCancel']}>
                                Добавить
                            </Button>
                            <Button onClick={() => setFormActive(false)} className={styles['addCancel']}>
                                Отмена
                            </Button>
                        </div>
                    </div>
                </div>
            )}
            {list.length > 0 && (
                <>
                    {list.length > 0 && (
                        <div className={styles['conteiner']}>
                            <div className={styles['row']}>
                                <div className={styles['column']}>Актив</div>
                                <div className={styles['column']}>Количество</div>
                                <div className={styles['column']}>Цена</div>
                                <div className={styles['column']}>Общая стоимость</div>
                                <div className={styles['column']}>Изм. за 24 ч.</div>
                                <div className={styles['column']}>% портфеля</div>
                            </div>
                            {list.map((el: IResponseProps) => (
                                <PortfolioItem
                                    key={el.symbol}
                                    name={el.symbol}
                                    active={false}
                                    count={el.count}
                                    price={el.lastPrice}
                                    sumPrice={el.lastPrice < 0.01 ? 0 : Math.round(el.count * el.lastPrice * 100) / 100}
                                    priceChangePercent={el.priceChangePercent}
                                    portfolioPercent={el.percentPortfolio}
                                    onClick={() => delItem(el.symbol)}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}
        </>
    );
}

export default App;
