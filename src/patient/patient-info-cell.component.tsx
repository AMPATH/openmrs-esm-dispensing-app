import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { usePatientAge } from './patient.resources';
import { type PharmacyConfig } from '../config-schema';
import { useConfig } from '@openmrs/esm-framework';

type PatientInfoCellProps = {
  patient: {
    name: string;
    uuid: string;
  };
  setIdentifiers: (identifiers: string) => void;
};

const PatientInfoCell: React.FC<PatientInfoCellProps> = ({ patient: { name: display, uuid }, setIdentifiers }) => {
  const { error, isLoading, age, identifiers } = usePatientAge(uuid);
  const { patientIdIdentifierTypeUuid } = useConfig<PharmacyConfig>();
  const { t } = useTranslation();
  const ageLabel = t('age', 'Age');
  function concatAgePatientDisplay(input: string, age: number): string | null {
    const openParenIndex = input.indexOf('(');
    if (openParenIndex !== -1) {
      const nameOnly = input.slice(0, openParenIndex).trim();
      return `${nameOnly}, ${ageLabel}: ${age}`;
    } else {
      return `${input}, ${ageLabel}: ${age}`;
    }
  }
  const identifiersInput = useMemo(() => {
    if (
      display &&
      identifiers &&
      identifiers.length &&
      patientIdIdentifierTypeUuid &&
      patientIdIdentifierTypeUuid.length
    ) {
      const identifiersTxt = identifiers
        ?.filter((identifier) =>
          !identifier.voided && patientIdIdentifierTypeUuid && patientIdIdentifierTypeUuid.length
            ? patientIdIdentifierTypeUuid.includes(identifier.identifierType.uuid)
            : true,
        )
        ?.map((identifier) => identifier.identifier)
        ?.join(',');
      return identifiersTxt;
    }
    return '';
  }, [display, identifiers, patientIdIdentifierTypeUuid]);
  useEffect(() => {
    if (identifiersInput) {
      setIdentifiers(identifiersInput);
    }
  }, [identifiersInput, setIdentifiers]);
  if (isLoading || error) return <>{display}</>;
  const displayWithAge = concatAgePatientDisplay(display, age);
  return <>{displayWithAge}</>;
};

export default PatientInfoCell;
