import React from 'react';
import { Button, InlineLoading } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { launchWorkspace, type Order, useConfig } from '@openmrs/esm-framework';
import { type MedicationRequestBundle, type BillStatus } from '../../types';
import { type PharmacyConfig } from '../../config-schema';

type GenerateBillActionButtonProps = {
  medicationRequestBundle: MedicationRequestBundle;
  isLoading: boolean;
  billStatus: BillStatus;
  order: Order;
  dispensable: boolean;
  mutated: () => void;
};

const GenerateBillActionButton: React.FC<GenerateBillActionButtonProps> = ({
  medicationRequestBundle,
  isLoading,
  billStatus,
  order,
  dispensable,
  mutated,
}) => {
  const { t } = useTranslation();
  const { pharmacyServiceTypedUuid } = useConfig<PharmacyConfig>();

  const launchBillWorkspace = () => {
    launchWorkspace('create-order-bill-form-workspace', {
      workspaceTitle: t('createOrderBill', 'Create order bill form'),
      order: order,
      quantity: medicationRequestBundle.request.dispenseRequest.quantity.value,
      serviceTypeUuid: pharmacyServiceTypedUuid,
      mutated,
    });
  };

  if (!dispensable) {
    return null;
  }

  return isLoading ? (
    <InlineLoading description="Checking bills" />
  ) : billStatus === 'PENDING' ? (
    <Button kind="secondary">{t('pendingPayment', 'Pending payment')}</Button>
  ) : billStatus === 'BLANK' ? (
    <Button kind="primary" onClick={launchBillWorkspace}>
      {t('generateBill', 'Generate bill')}
    </Button>
  ) : null;
};

export default GenerateBillActionButton;
