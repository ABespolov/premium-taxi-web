import { useState } from 'react';
import { useNavigate } from 'react-router';
import { getWallet, setDefaultPaymentMethod } from '@/api/profile';
import { Icon } from '@/components/Icon';
import { NavBar } from '@/components/NavBar';
import { Page } from '@/components/Page';
import { PaymentIcon } from '@/components/PaymentIcon';
import { SettingsRow } from '@/components/SettingsRow';

export function Wallet() {
  const navigate = useNavigate();
  const [wallet, setWallet] = useState(getWallet);

  function makeDefault(methodId: string) {
    setDefaultPaymentMethod(methodId);
    setWallet(getWallet());
  }

  return (
    <Page>
      <NavBar title="Wallet" />
      <div className="flex flex-col gap-2 px-5 pt-8">
        <p className="text-subheadline font-semibold text-label-secondary">Payment methods</p>
        <div className="overflow-hidden rounded-[14px] bg-background-tertiary">
          {wallet.methods.map((method) => (
            <SettingsRow
              key={method.id}
              leading={<PaymentIcon brand={method.brand} />}
              title={method.label}
              value={method.id === wallet.defaultMethodId ? 'Default' : undefined}
              onPress={() => makeDefault(method.id)}
            />
          ))}
          <SettingsRow
            leading={<Icon name="plus" />}
            title="Add payment method"
            hasDivider={false}
            onPress={() => navigate('/add-card')}
          />
        </div>
      </div>
    </Page>
  );
}
