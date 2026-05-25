import React from 'react';
import { Button, Tag } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { launchWorkspace2, type Session } from '@openmrs/esm-framework';
import { initiateMedicationDispenseBody } from '../../medication-dispense/medication-dispense.resource';
import { type Provider, type MedicationRequestBundle, type BillStatus } from '../../types';
import { usePatientBills } from '../../bill/bill.resource';

type DispenseActionButtonProps = {
  patientUuid: string;
  encounterUuid: string;
  medicationRequestBundle: MedicationRequestBundle;
  session: Session;
  providers: Array<Provider>;
  dispensable: boolean;
  quantityRemaining: number;
  quantityDispensed: number;
  disabled: boolean;
  billStatus: BillStatus;
};

const DispenseActionButton: React.FC<DispenseActionButtonProps> = ({
  patientUuid,
  encounterUuid,
  medicationRequestBundle,
  session,
  providers,
  dispensable,
  quantityRemaining,
  quantityDispensed,
  disabled,
  billStatus = 'PAID',
}) => {
  const { t } = useTranslation();
  const dispenseWorkspaceProps = {
    patientUuid,
    encounterUuid,
    medicationDispense: initiateMedicationDispenseBody(medicationRequestBundle.request, session, providers, true),
    medicationRequestBundle,
    quantityRemaining,
    quantityDispensed,
    mode: 'enter',
  };

  const { currentDayBills } = usePatientBills(patientUuid);

  const handleLaunchWorkspace = () => {
    launchWorkspace2('dispense-workspace', dispenseWorkspaceProps);
  };

  if (!dispensable) {
    return null;
  }

  if (currentDayBills && currentDayBills.length && (billStatus === 'PAID' || billStatus === 'POSTED')) {
    return (
      <Tag type="red" size="lg">
        {t('clearPendingBills', 'Clear pending bills to dispense')}
      </Tag>
    );
  }

  return billStatus === 'PAID' || billStatus === 'POSTED' ? (
    <Button kind="primary" onClick={handleLaunchWorkspace} disabled={disabled}>
      {t('dispense', 'Dispense')}
    </Button>
  ) : null;
};

export default DispenseActionButton;
