import Link from 'next/link';
import styles from './header.module.scss';
import commonStyles from '../../styles/common.module.scss';

export default function Header(): JSX.Element {
  return (
    <div className={commonStyles.Container}>
      <div className={styles.Content}>
        <Link href="/">
          <a>
            <img src="/images/Logo.png" alt="logo" />
          </a>
        </Link>
      </div>
    </div>
  );
}
