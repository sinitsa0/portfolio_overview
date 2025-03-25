import { IPortfolioProps } from './PortfolioItem.props';
import styles from '../../App.module.scss';
import cn from 'classnames';

function PortfolioItem(props: IPortfolioProps) {
    return (
        <div className={cn(styles['row'], { [styles['active']]: props.active })} onClick={props.onClick}>
            <div className={styles['column']}>{props.name.slice(0, props.name.length - 4)}</div>
            {props.count !== undefined && <div className={styles['column']}>{props.count}</div>}
            <div className={styles['column']}>${props.price}</div>
            {props.sumPrice !== undefined && <div className={styles['column']}>${props.sumPrice}</div>}
            <div
                className={cn(styles['column'], {
                    [styles['red']]: props.priceChangePercent < 0,
                    [styles['green']]: props.priceChangePercent > 0
                })}
            >
                {props.priceChangePercent}%
            </div>
            {props.portfolioPercent !== undefined && <div className={styles['column']}>{props.portfolioPercent}%</div>}
        </div>
    );
}

export default PortfolioItem;
