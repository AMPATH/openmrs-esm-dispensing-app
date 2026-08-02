import { type FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';

export const usePatientAge = (patienUuid: string) => {
  const customRep = 'custom:(person:(age),identifiers:(identifier,identifierType:(uuid,display)))';
  const url = `${restBaseUrl}/patient/${patienUuid}?v=${customRep}`;
  const { data, error, isLoading, mutate } = useSWR<
    FetchResponse<{
      person: { age: number };
      identifiers: Array<{
        identifier: string;
        voided: boolean;
        identifierType: {
          uuid: string;
          display: string;
        };
      }>;
    }>
  >(url, openmrsFetch);
  return {
    age: data?.data?.person?.age,
    identifiers: data?.data?.identifiers,
    error,
    isLoading,
    mutate,
  };
};
