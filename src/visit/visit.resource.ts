import { restBaseUrl, openmrsFetch, type FetchResponse, type Visit } from '@openmrs/esm-framework';
import useSWR from 'swr';

export const endVisit = async (visitUuid: string) => {
  const url = `${restBaseUrl}/visit/${visitUuid}`;
  const stopDatetime = new Date();
  const body = {
    stopDatetime,
  };
  const response = await openmrsFetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  return response.json();
};

export const useEncounter = (encounterUuid: string) => {
  const customRep = 'custom:(uuid,visit)';
  const url = encounterUuid ? `${restBaseUrl}/encounter/${encounterUuid}?v=${customRep}` : null;
  const { data, error, isLoading, mutate } = useSWR<
    FetchResponse<{
      visit: Visit;
    }>
  >(url, openmrsFetch);

  const { isLoading: isLoadingVisit, error: visitError, visit } = usePatientVisit(data?.data?.visit?.uuid);

  return {
    visit,
    error: error || visitError,
    isLoading: isLoading || isLoadingVisit,
    mutate,
  };
};

export const usePatientVisit = (visitUuid: string | null | undefined) => {
  const customRep = 'full';
  const url = visitUuid ? `${restBaseUrl}/visit/${visitUuid}?v=${customRep}` : null;
  const { data, error, isLoading, mutate } = useSWR<FetchResponse<Visit>>(url, openmrsFetch);

  return {
    visit: data?.data,
    error,
    isLoading,
    mutate,
  };
};
