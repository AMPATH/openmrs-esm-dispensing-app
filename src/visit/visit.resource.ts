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
  const url = `${restBaseUrl}/encounter/${encounterUuid}?v=${customRep}`;
  const { data, error, isLoading, mutate } = useSWR<
    FetchResponse<{
      uuid: string;
      visit: Visit;
    }>
  >(url, openmrsFetch);

  return {
    encounter: data?.data,
    visit: data?.data?.visit,
    error,
    isLoading,
    mutate,
  };
};
