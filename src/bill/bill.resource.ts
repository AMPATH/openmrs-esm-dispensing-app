import { openmrsFetch, type OpenmrsResource, restBaseUrl, useConfig } from '@openmrs/esm-framework';
import useSWR, { mutate } from 'swr';
import { type BillInvoice } from '../types';
import { useCallback } from 'react';
import dayjs from 'dayjs';

export const useBills = (patientUuid: string = '', billStatus: string = 'PENDING') => {
  const url = `${restBaseUrl}/billing/bill?patientUuid=${patientUuid}&v=custom:(uuid,patient:(uuid),lineItems:(uuid,billableService,quantity,price,item,priceUuid,priceName,paymentStatus),status)`;

  const {
    data,
    error,
    isLoading,
    isValidating,
    mutate: mutated,
  } = useSWR<{ data: { results: Array<BillInvoice> } }>(url, openmrsFetch, {
    errorRetryCount: 2,
  });

  const results = data?.data?.results ?? [];

  return {
    bills: results,
    error,
    isLoading,
    isValidating,
    mutated,
  };
};

export function useInvalidateBills(patientUuid: string) {
  return useCallback(() => {
    mutate(
      (key) => typeof key === 'string' && key.startsWith(`${restBaseUrl}/billing/bill?patientUuid=${patientUuid}`),
      undefined,
      { revalidate: true },
    );
  }, [patientUuid]);
}

export const usePatientBills = (patientUuid: string, billStatus: string = 'PENDING,POSTED') => {
  const url = `${restBaseUrl}/billing/bill?patientUuid=${patientUuid}&status=${billStatus}&v=custom:(uuid,lineItems,dateCreated)`;

  const {
    data,
    error,
    isLoading,
    isValidating,
    mutate: mutated,
  } = useSWR<{ data: { results: Array<OpenmrsResource> } }>(url, openmrsFetch, {
    errorRetryCount: 2,
  });

  const results = data?.data?.results ?? [];

  const today = dayjs().startOf('day');

  const currentDayBills = results.filter((bill) => {
    const billDate = dayjs(bill?.dateCreated).startOf('day');
    return billDate.isSame(today);
  });

  return {
    currentDayBills,
    error,
    isLoading,
    isValidating,
    mutated,
  };
};

export const useOrderBill = (orderNumber: string) => {
  const { hieBaseUrl } = useConfig({
    externalModuleName: '@ampath/esm-dha-workflow-app',
  });
  const url = `${hieBaseUrl}/bill-order?order_no=${orderNumber}`;

  const {
    data,
    error,
    isLoading,
    isValidating,
    mutate: mutated,
  } = useSWR<{ data: { bill_uuid: string; line_item_uuid: string } }>(url, openmrsFetch);

  const results = data?.data;

  return {
    orderBill: results,
    error,
    isLoadingOrderBill: isLoading,
    isValidating,
    mutated,
  };
};

export const useOdooBills = (patientUuid: string, enableOdooBilling: boolean = false) => {
  const url = enableOdooBilling ? `etl/odoo/billing/patient/${patientUuid}` : null;

  const { data, error, isLoading } = useSWR<{
    data: {
      orders: Array<{
        order_lines: Array<{
          billing_status: string;
          openmrs_order_id: string;
        }>;
      }>;
    };
  }>(url, openmrsFetch);

  const results = data?.data;

  return {
    odooBills: results,
    error,
    isLoadingOdooBills: isLoading,
  };
};
