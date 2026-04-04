import React, { useEffect, useMemo, useState } from 'react';
import { ExtensionSlot, type Order, useConfig, useSession } from '@openmrs/esm-framework';
import {
  type BillInvoice,
  type BillStatus,
  MedicationDispenseStatus,
  type MedicationRequestBundle,
  MedicationRequestStatus,
} from '../types';
import {
  computeMedicationRequestStatus,
  computeQuantityRemaining,
  getMostRecentMedicationDispenseStatus,
  computeTotalQuantityDispensed,
} from '../utils';
import { type PharmacyConfig } from '../config-schema';
import { useProviders } from '../medication-dispense/medication-dispense.resource';
import styles from './action-buttons.scss';
import { getOrderNumberFromHie } from '../bill/bill.resource';

interface ActionButtonsProps {
  medicationRequestBundle: MedicationRequestBundle;
  patientUuid: string;
  encounterUuid: string;
  disabled: boolean;
  orders: Order[];
  bills: BillInvoice[];
  isLoading: boolean;
  isLoadingOrders?: boolean;
  hasActiveRequests?: boolean;
  mutated: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  medicationRequestBundle,
  patientUuid,
  encounterUuid,
  disabled,
  orders,
  bills,
  isLoading,
  isLoadingOrders,
  hasActiveRequests,
  mutated,
}) => {
  const [status, setStatus] = useState<BillStatus>('BLANK');
  const config = useConfig<PharmacyConfig>();
  const session = useSession();
  const providers = useProviders(config.dispenserProviderRoles);
  const order = useMemo(() => {
    const medicationReference = medicationRequestBundle.request.medicationReference.reference;
    if (!isLoadingOrders) {
      return orders.find((o) => medicationReference.includes(o?.drug?.uuid));
    }
    return {} as Order;
  }, [orders, medicationRequestBundle, isLoadingOrders]);

  useEffect(() => {
    const getBillStatus = async () => {
      try {
        const response = await getOrderNumberFromHie(order?.orderNumber);
        const billUuid = response.bill_uuid;
        const bill = bills.find((b) => b.uuid === billUuid);
        const lineItem = bill?.lineItems?.find((i) => i.uuid === response?.line_item_uuid);
        if (lineItem) {
          if (lineItem.priceName === 'SHA') {
            setStatus('PAID');
          } else {
            setStatus(lineItem?.paymentStatus as BillStatus);
          }
        } else {
          setStatus('BLANK');
        }
      } catch (error) {
        setStatus('BLANK');
      }
    };

    if (!isLoadingOrders && order) {
      getBillStatus();
    }
  }, [order, bills, isLoadingOrders]);

  const mostRecentMedicationDispenseStatus: MedicationDispenseStatus = getMostRecentMedicationDispenseStatus(
    medicationRequestBundle.dispenses,
  );
  const medicationRequestStatus = computeMedicationRequestStatus(
    medicationRequestBundle.request,
    config.medicationRequestExpirationPeriodInDays,
  );
  const dispensable =
    medicationRequestStatus === MedicationRequestStatus.active &&
    mostRecentMedicationDispenseStatus !== MedicationDispenseStatus.declined;

  const pauseable =
    config.actionButtons.pauseButton.enabled &&
    medicationRequestStatus === MedicationRequestStatus.active &&
    mostRecentMedicationDispenseStatus !== MedicationDispenseStatus.on_hold &&
    mostRecentMedicationDispenseStatus !== MedicationDispenseStatus.declined;

  const closeable =
    config.actionButtons.closeButton.enabled &&
    medicationRequestStatus === MedicationRequestStatus.active &&
    mostRecentMedicationDispenseStatus !== MedicationDispenseStatus.declined;

  let quantityRemaining = null;
  if (config.dispenseBehavior.restrictTotalQuantityDispensed) {
    quantityRemaining = computeQuantityRemaining(medicationRequestBundle);
  }

  let quantityDispensed = 0;
  if (config.dispenseBehavior.restrictTotalQuantityDispensed && medicationRequestBundle.dispenses) {
    quantityDispensed = computeTotalQuantityDispensed(medicationRequestBundle.dispenses);
  }

  const prescriptionActionsState = {
    dispensable,
    pauseable,
    closeable,
    quantityRemaining,
    quantityDispensed,
    patientUuid,
    encounterUuid,
    medicationRequestBundle,
    session,
    providers,
    disabled,
    order,
    billStatus: status,
    isLoading: isLoading,
    hasActiveRequests,
    mutated,
  };

  return (
    <div className={styles.actionBtns}>
      <ExtensionSlot
        className={styles.extensionSlot}
        name="prescription-action-button-slot"
        state={prescriptionActionsState}
      />
    </div>
  );
};

export default ActionButtons;
