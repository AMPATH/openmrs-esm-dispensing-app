import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR, { mutate } from 'swr';
import { type BillInvoice } from '../types';
import { getHieBaseUrl, postJson } from '../utils';
import { useCallback } from 'react';

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

export const getOrderNumberFromHie = async (orderNumber: string) => {
  const hieBaseUrl = await getHieBaseUrl();
  const url = `${hieBaseUrl}/bill-order?order_no=${orderNumber}`;
  return postJson<{ bill_uuid: string; line_item_uuid: string }>(url, null, 'GET');
};
