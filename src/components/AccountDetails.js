import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPersonBurst,
  faPersonCircleCheck,
  faWallet,
} from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

export default function AccountDetails({ user }) {
  const router = useRouter();
  const { t, lang } = useTranslation('dashboard');

  return (
    <div className="account-details-component" style={{}}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          maxWidth: '100%',
          width: '100% !important',
          padding: '10px 20px',
        }}
        className="card"
      >
        <div
          className="account-details"
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            width: '100%',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <b>{user.login}</b>
            <br />

            <small>
              {t('balance')}: {user.balance.toFixed(2)} USD{' '}
              <button
                onClick={() => router.push('/dashboard/wallet')}
                style={{ padding: '3px 3px', fontSize: '10px' }}
              >
                + {t('addfunds')}
              </button>
            </small>
            <br />
            <small>Level: Starter</small>
            <br />
          </div>{' '}
        </div>
      </div>
    </div>
  );
}
