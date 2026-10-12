import useSWR from 'swr';
import { type DrugFormulation, type Medication, type MedicationFormulationsResponse } from '../types';
import { fhirBaseUrl, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { getConceptCodingUuid, getMedicationsByConceptEndpoint } from '../utils';

/**
 * Given a Medication Reference, fetches that Medication and returns the codeable concept associated with it
 * Note: returns null if existingMedicationCodeableConcept already defined
 *
 * @param existingMedicationCodeableConceptUuid
 * @param medicationReference
 */
export function useMedicationCodeableConcept(
  existingMedicationCodeableConceptUuid: string,
  medicationReference: string,
) {
  const { data } = useSWR<{ data: Medication }, Error>(
    existingMedicationCodeableConceptUuid || !medicationReference ? null : `${fhirBaseUrl}/${medicationReference}`,
    openmrsFetch,
  );

  return {
    medicationCodeableConceptUuid: data ? getConceptCodingUuid(data.data.code.coding) : null,
  };
}

/**
 * Searches orderable drugs using the first word of the drug name
 *
 * @param drugName
 * @param isDrug
 */
export const useDrugFormulations = (drugName: string | undefined, isDrug: boolean) => {
  const query = drugName?.split(' ')[0] || null;
  const customRepresentation = 'custom:(uuid,display,dosageForm:(uuid,display),concept:(uuid,display))';
  const url =
    isDrug && query
      ? `${restBaseUrl}/drug?s=ampathOrderableDrugs&q=${encodeURIComponent(query)}&v=${customRepresentation}`
      : null;

  const { data, isLoading, error } = useSWR<{ data: { results: Array<DrugFormulation> } }, Error>(url, openmrsFetch);

  return { isLoadingDrugFormulations: isLoading, error, drugFormulations: data?.data?.results };
};

/**
 * Given a concept uuid, returns all Medications associated with that concept
 *
 * @param medicationCodeableConcept
 */
export function useMedicationFormulations(medicationCodeableConcept: string) {
  const { data } = useSWR<{ data: MedicationFormulationsResponse }, Error>(
    medicationCodeableConcept ? getMedicationsByConceptEndpoint(medicationCodeableConcept) : null, // note that we don't start the search until we've confirmed we have a uuid to search for
    openmrsFetch,
  );

  if (data?.data?.entry) {
    return {
      medicationFormulations: data.data.entry.map((e) => e.resource),
    };
  } else {
    return {};
  }
}
