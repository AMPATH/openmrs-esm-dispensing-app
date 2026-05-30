import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import useSWR from 'swr';
import {
  fhirBaseUrl,
  openmrsFetch,
  type Order,
  parseDate,
  restBaseUrl,
  useConfig,
  useSession,
} from '@openmrs/esm-framework';
import { JSON_MERGE_PATH_MIME_TYPE, OPENMRS_FHIR_EXT_REQUEST_FULFILLER_STATUS } from '../constants';
import {
  type AllergyIntoleranceResponse,
  type EncounterResponse,
  type MedicationRequest,
  type MedicationRequestResponse,
  type PrescriptionsTableRow,
  type MedicationDispense,
  type Encounter,
  type MedicationRequestFulfillerStatus,
  type MedicationRequestBundle,
  type SimpleLocation,
  type QueueEntryResult,
} from '../types';
import {
  getPrescriptionDetailsEndpoint,
  getMedicationDisplay,
  getMedicationReferenceOrCodeableConcept,
  getPrescriptionTableEndpoint,
  sortMedicationDispensesByWhenHandedOver,
  computePrescriptionStatusMessageCode,
  getAssociatedMedicationDispenses,
  getEtlBaseUrl,
} from '../utils';
import { type PharmacyConfig } from '../config-schema';

const ACTIVE_STATUS_FETCH_COUNT = 100;

export function usePrescriptionsTable(
  loadData: boolean,
  customPrescriptionsTableEndpoint: string = '',
  status: string = '',
  pageSize: number = 10,
  pageOffset: number = 0,
  patientSearchTerm: string = '',
  locations: SimpleLocation[] = [],
  medicationRequestExpirationPeriodInDays: number,
  refreshInterval: number,
) {
  const fetchPageSize = status === 'ACTIVE' ? ACTIVE_STATUS_FETCH_COUNT : pageSize;
  const fetchPageOffset = status === 'ACTIVE' ? 0 : pageOffset;
  const { data, error } = useSWR<{ data: EncounterResponse }, Error>(
    loadData
      ? getPrescriptionTableEndpoint(
          customPrescriptionsTableEndpoint,
          status,
          fetchPageOffset,
          fetchPageSize,
          '',
          patientSearchTerm,
          locations?.map((location) => location.id).join(','),
        )
      : null,
    openmrsFetch,
    { refreshInterval: refreshInterval },
  );
  const { queueEntries } = useQueueEntries();

  let prescriptionsTableRows: PrescriptionsTableRow[];
  if (data) {
    const entries = data?.data.entry;
    const filteredEntries =
      status === 'ACTIVE' && entries
        ? entries.filter((entry) =>
            dayjs(entry?.resource?.meta?.lastUpdated).isAfter(
              dayjs().startOf('day').subtract(medicationRequestExpirationPeriodInDays, 'day'),
            ),
          )
        : entries;

    if (filteredEntries) {
      const encounters = filteredEntries
        .filter((entry) => entry?.resource?.resourceType == 'Encounter')
        .map((entry) => entry.resource as Encounter);
      const medicationRequests = filteredEntries
        .filter((entry) => entry?.resource?.resourceType == 'MedicationRequest')
        .map((entry) => entry.resource as MedicationRequest);
      const medicationDispenses = filteredEntries
        .filter((entry) => entry?.resource?.resourceType == 'MedicationDispense')
        .map((entry) => entry.resource as MedicationDispense)
        .sort(sortMedicationDispensesByWhenHandedOver);
      prescriptionsTableRows = encounters.map((encounter) => {
        const medicationRequestsForEncounter = medicationRequests.filter(
          (medicationRequest) => medicationRequest.encounter.reference == 'Encounter/' + encounter.id,
        );

        const medicationRequestReferences = medicationRequestsForEncounter.map(
          (medicationRequest) => 'MedicationRequest/' + medicationRequest.id,
        );
        const medicationDispensesForMedicationRequests = medicationDispenses.filter((medicationDispense) =>
          medicationRequestReferences.includes(medicationDispense.authorizingPrescription[0]?.reference),
        );

        const patientUuid = encounter?.subject?.reference?.split('/')[1];
        const priority = queueEntries?.find((q) => q.patient_uuid === patientUuid)?.priority ?? 'NON-URGENT';

        return buildPrescriptionsTableRow(
          encounter,
          medicationRequestsForEncounter,
          medicationDispensesForMedicationRequests,
          medicationRequestExpirationPeriodInDays,
          priority,
        );
      });
      prescriptionsTableRows.sort((a, b) => (a.created < b.created ? 1 : -1));
    } else {
      prescriptionsTableRows = [];
    }
  }

  return {
    prescriptionsTableRows,
    error: error,
    isLoading: !prescriptionsTableRows && !error,
    totalOrders: status === 'ACTIVE' ? prescriptionsTableRows?.length ?? 0 : data?.data.total,
  };
}

function buildPrescriptionsTableRow(
  encounter: Encounter,
  medicationRequests: Array<MedicationRequest>,
  medicationDispense: Array<MedicationDispense>,
  medicationRequestExpirationPeriodInDays: number,
  priority: string,
): PrescriptionsTableRow {
  return {
    id: encounter?.id,
    created: encounter?.meta?.lastUpdated, //encounter?.period?.start,
    patient: {
      name: encounter?.subject?.display,
      uuid: encounter?.subject?.reference?.split('/')[1],
    },
    drugs: [
      ...new Set(
        medicationRequests
          .map((medicationRequest) => getMedicationDisplay(getMedicationReferenceOrCodeableConcept(medicationRequest)))
          .sort((a, b) => {
            return a.localeCompare(b);
          }),
      ),
    ].join('; '),
    lastDispenser:
      medicationDispense && medicationDispense[0]?.performer && medicationDispense[0]?.performer[0]?.actor.display,
    prescriber: [...new Set(medicationRequests.map((o) => o.requester.display))].join(', '),
    status: computePrescriptionStatusMessageCode(medicationRequests, medicationRequestExpirationPeriodInDays),
    location: encounter?.location ? encounter?.location[0]?.location.display : null,
    priority: priority,
  };
}

export function usePrescriptionDetails(encounterUuid: string, refreshInterval = null) {
  const { data, ...rest } = useSWR<{ data: MedicationRequestResponse }, Error>(
    getPrescriptionDetailsEndpoint(encounterUuid),
    openmrsFetch,
    { refreshInterval: refreshInterval },
  );

  const { medicationRequestBundles, prescriptionDate } = useMemo(() => {
    if (data) {
      return medicationRequestResponseToPrescriptionDetails(data.data.entry);
    } else {
      return { medicationRequestBundles: [], prescriptionDate: null };
    }
  }, [data]);

  return {
    medicationRequestBundles,
    prescriptionDate,
    ...rest,
  };
}

/**
 * fetches prescription details of a given encounter directly via openmrsFetch (instead of useSWR)
 * @param encounterUuid
 * @returns
 */
export async function getPrescriptionDetails(encounterUuid: string) {
  const result = await openmrsFetch<MedicationRequestResponse>(getPrescriptionDetailsEndpoint(encounterUuid));
  const {
    data: { entry },
  } = result;
  return medicationRequestResponseToPrescriptionDetails(entry);
}

function medicationRequestResponseToPrescriptionDetails(
  results: { resource: MedicationRequest | MedicationDispense }[],
) {
  const medicationRequestBundles: Array<MedicationRequestBundle> = [];
  let prescriptionDate: Date;

  const encounter = results
    ?.filter((entry) => entry?.resource?.resourceType == 'Encounter')
    .map((entry) => entry.resource as Encounter);

  if (encounter) {
    // by definition of the request (search by encounter) there should be one and only one encounter
    prescriptionDate = parseDate(encounter[0]?.period.start);

    const medicationRequests = results
      ?.filter((entry) => entry?.resource?.resourceType == 'MedicationRequest')
      .map((entry) => entry.resource as MedicationRequest);

    const medicationDispenses = results
      ?.filter((entry) => entry?.resource?.resourceType == 'MedicationDispense')
      .map((entry) => entry.resource as MedicationDispense)
      .sort(sortMedicationDispensesByWhenHandedOver);

    medicationRequests.every((medicationRequest) =>
      medicationRequestBundles.push({
        request: medicationRequest,
        dispenses: getAssociatedMedicationDispenses(medicationRequest, medicationDispenses).sort(
          sortMedicationDispensesByWhenHandedOver,
        ),
      }),
    );
  }

  return { medicationRequestBundles, prescriptionDate };
}

export function usePatientAllergies(patientUuid: string, refreshInterval) {
  const { data, error, isLoading } = useSWR<{ data: AllergyIntoleranceResponse }, Error>(
    `${fhirBaseUrl}/AllergyIntolerance?patient=${patientUuid}`,
    openmrsFetch,
    { refreshInterval: refreshInterval },
  );

  const allergies = data?.data.entry?.map((allergy) => allergy.resource) ?? [];

  return {
    allergies,
    totalAllergies: data?.data.total,
    error,
    isLoading,
  };
}

// supports passing just the uuid/code or the entire reference, ie either: "MedicationReference/123-abc" or "123-abc"
export function useMedicationRequest(reference: string, refreshInterval) {
  reference = reference
    ? reference.startsWith('MedicationRequest')
      ? reference
      : `MedicationRequest/${reference}`
    : null;

  const { data, isLoading } = useSWR<{ data: MedicationRequest }, Error>(
    reference ? `${fhirBaseUrl}/${reference}` : null,
    openmrsFetch,
    { refreshInterval: refreshInterval },
  );
  return {
    medicationRequest: data ? data.data : null,
    isLoading,
  };
}

export function updateMedicationRequestFulfillerStatus(
  medicationRequestUuid: string,
  fulfillerStatus: MedicationRequestFulfillerStatus,
) {
  const url = `${fhirBaseUrl}/MedicationRequest/${medicationRequestUuid}`;

  return openmrsFetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': JSON_MERGE_PATH_MIME_TYPE,
    },
    body: {
      extension: [
        {
          url: OPENMRS_FHIR_EXT_REQUEST_FULFILLER_STATUS,
          valueCode: fulfillerStatus,
        },
      ],
    },
  });
}

export function useOrders(encounterUuid: string) {
  // const customRepresentation = `custom:(uuid,display,orders:(uuid,orderNumber,concept:(uuid,display)))`;
  const customRepresentation = `full`;
  const url = `${restBaseUrl}/encounter/${encounterUuid}?v=${customRepresentation}`;
  const { data, error, mutate, isLoading, isValidating } = useSWR<{
    data: {
      orders: Array<Order>;
    };
  }>(`${url}`, openmrsFetch);

  const orders = data?.data?.orders;

  return {
    orders: orders ?? [],
    isLoading,
    isError: error,
    mutate,
    isValidating,
  };
}

export function useQueueEntries(patientUuid: string = '') {
  const [etlBaseUrl, setEtlBaseUrl] = useState('');
  const { sessionLocation } = useSession();
  const { serviceUuid } = useConfig<PharmacyConfig>();

  useEffect(() => {
    const fetchEtlBaseUrl = async () => {
      const baseUrl = await getEtlBaseUrl();
      setEtlBaseUrl(baseUrl);
    };
    fetchEtlBaseUrl();
  }, []);

  const url = `${etlBaseUrl}/queue-entry?locationUuid=${sessionLocation?.uuid}&serviceUuid=${serviceUuid}`;
  const { data, error, mutate, isLoading, isValidating } = useSWR<{
    data: { data: Array<QueueEntryResult> };
  }>(etlBaseUrl ? `${url}` : null, openmrsFetch);

  let filteredQueueEntries = data?.data?.data;

  if (patientUuid) {
    filteredQueueEntries = filteredQueueEntries?.filter((queueEntry) => queueEntry.patient_uuid === patientUuid);
  }

  return {
    queueEntries: filteredQueueEntries ?? [],
    isLoading,
    isError: error,
    mutate,
    isValidating,
  };
}
