import styles from './Button.module.scss';
import cn from 'classnames';
import { ButtonProps } from './Button.props';

function Button({ children, className, ...props }: ButtonProps) {
    return (
        <button className={cn(styles['btn'], className)} {...props}>
            {children}
        </button>
    );
}

export default Button;
