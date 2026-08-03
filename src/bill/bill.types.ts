// Order Bill related interfaces
export interface OrderBillResponse {
  bill_uuid: string;
  line_item_uuid: string;
  sub_benefit_code: string;
  intervention_code: string;
  consent_token: string;
  service_type: string;
  requires_preauth: boolean;
  normal_preauth: boolean;
  elective_preauth: boolean;
  preauth_approved: boolean;
}

// Preauth related interfaces
export interface PreauthItem {
  id: number;
  estimatedAmount: string;
  providerCurrency: string;
  guid: string;
  requestedOn: string;
  respondedOn: string;
  status: string;
  responseNote: string;
  name: string;
  unitPrice: string;
  quantity: string;
  chargeDate: string;
  interventionName: string;
  interventionCode: string;
  schemeName: string;
  schemeCode: string;
}

export interface PreauthDiagnosis {
  id: number;
  interventionName: string;
  interventionCode: string;
  siteCode: string;
  siteCodeType: string;
  preauthDiagnosisType: string;
  guid: string;
  requestedOn: string;
  status: string;
  name: string;
}

export interface PreauthAttachment {
  id: number;
  uploadedFile: string;
  organisationName: string;
  description: string;
  contentType: string;
  guid: string;
  source: string;
  author: string;
  authorName: string;
  authorEmail: string;
  attachmentType: string;
  title: string;
  interventionCode: string;
  attachment: number;
}

export interface PreauthNote {
  id: number;
  organisationName: string;
  guid: string;
  source: string;
  author: string;
  authorName: string;
  authorEmail: string;
  note: string;
}

export interface Contact {
  id: number;
  contactValue: string;
  businessPartner: BusinessPartner;
  guid: string;
  contactType: string;
  isConfirmed: boolean;
  active: boolean;
  role: string;
  canSendComm: boolean;
  contactName: string;
}

export interface BusinessPartner {
  active: boolean;
  adminEmail: string | null;
  allowedDoctorApprovalMedium: string;
  applicationNumber: string | null;
  applicationStatus: string | null;
  baseCurrencyCode: string;
  bpBabyCotCapacity: string | null;
  bpBedCapacity: string | null;
  bpHduBedCapacity: string | null;
  bpIcuBedCapacity: string | null;
  bpLevel: string | null;
  bpLicensingBody: string | null;
  bpNormalBedCapacity: string | null;
  bpOwnership: string | null;
  bpRegistrationNumber: string | null;
  bpType: string;
  branchName: string | null;
  contractStatus: string | null;
  country: string;
  county: string | null;
  econtractingDone: boolean;
  enabledForEmergencyServices: boolean;
  geofencingEnforced: boolean;
  guid: string;
  id: number;
  invoicingStartDate: string | null;
  isAmbulance: boolean;
  isEnabled: boolean | null;
  isSuspended: boolean;
  keycloakOrgId: string | null;
  latitude: string | null;
  longitude: string | null;
  name: string;
  nationalIdentifier: string;
  operationalStatus: string | null;
  practitionerCadre: string;
  practitionerDisciplineName: string;
  practitionerGender: string | null;
  practitionerIdNumber: string;
  practitionerIdType: string;
  practitionerInHealthWorkerRegistry: boolean;
  practitionerLicenceNumber: string;
  practitionerLicenceStart: string;
  practitionerLicenceType: string | null;
  practitionerLicenceValidity: string;
  practitionerLicenseBody: string;
  practitionerPostalAddress: string;
  practitionerQualifications: string;
  practitionerRegistrationNumber: string;
  practitionerRegistryId: string;
  practitionerSpecialty: string;
  practitionerSubSpecialty: string;
  practitionerType: string | null;
  provisioningStatus: string;
  region: string | null;
  replicated: string;
  sladeCode: number;
  specialty: string | null;
  subCounty: string | null;
  suspended: boolean;
  suspendedByEmail: string | null;
  suspendedByName: string | null;
  suspendedDate: string | null;
  suspendedReason: string | null;
  suspensionReason: string | null;
  suspensionReasonType: string | null;
  suspensionReasonTypeText: string | null;
  taxIdentifier: string | null;
  town: string | null;
  updateBankDetails: boolean;
  updateLicenseDetails: boolean;
}

export interface DoctorProfile {
  id: number;
  guid: string;
  name: string;
  sladeCode: number;
  active: boolean;
  country: string;
  contacts: Contact[];
  practitionerLicenseStatus: string;
  practitionerRegistryId: string;
  practitionerCadre: string;
  practitionerIdNumber: string;
  practitionerIdType: string;
  practitionerLicenseBody: string;
  practitionerLicenceNumber: string;
  practitionerSpecialty: string;
  practitionerQualifications: string;
  practitionerPostalAddress: string;
  practitionerLicenceStart: string;
  practitionerLicenceValidity: string;
  practitionerRegistrationNumber: string;
  practitionerInHealthWorkerRegistry: boolean;
}

export interface PreauthDoctor {
  id: number;
  name: string;
  sladeCode: number;
  doctorProfile: DoctorProfile;
  guid: string;
  requestedOn: string;
  requestedBy: string;
  requestedByName: string;
  status: string;
  isHospitalDoctor: boolean;
}

export interface InterventionDetail {
  name: string;
  code: string;
  id: number;
  needsPreauth: boolean;
  overallTariff: string;
  activeForUhc: boolean;
  paymentMechanism: string;
  subBenefitCode: string;
  requiresSurgicalPreauth: boolean;
  applicableSchemes: string[];
  supportedScheme: string;
  fund: string;
  packageCombinations: string[];
  interventionCombinations: string[];
  allowedInterventions: unknown[];
  standaloneInterventions: string[];
  kephLevelTarrif: string;
  fallBackKephLevelTariff: string;
  preauthFinalised: boolean;
  prescriptionMedication: boolean;
  dispenseMedication: boolean;
  authInterventionId: number;
}

export interface EligibilityDetails {
  member: Record<string, unknown>;
  cover: Record<string, unknown>;
}

export interface ParentPreauth {
  token: string;
  beneficiaryCode: string;
  beneficiaryName: string;
  beneficiaryNumber: string;
  isOpen: boolean;
  interventions: any;
  preauthTypes: any;
  status: string;
  isElective: boolean;
  isBiometricsDischargeAuthorization: boolean;
  guid: string;
}

export interface ElectivePreauth {
  serviceStart: string;
  serviceEnd: string;
}

export interface AuthorizationDetails {
  id: number;
  createdByName: string;
  payerName: string;
  payerSladeCode: number;
  providerName: string;
  authCode: string;
  beneficiaryName: string;
  beneficiaryNumber: string;
  beneficiaryCode: string;
  beneficiaryScheme: string;
  interventions: InterventionDetail[];
  eligibilityDetails: EligibilityDetails;
  isOpen: boolean;
  isComplete: boolean;
  label: string;
  preauthIds: number[];
  preauthTypes: Record<string, string>;
  overallPreauthFinalised: boolean;
  needsPreauth: boolean;
  parentPreauth: ParentPreauth;
  electivePreauth: ElectivePreauth;
  providerFid: string;
  guid: string;
  provider: number;
  authorizationType: string[];
  token: string;
  status: string;
  expiry: string;
  benefitType: string;
  isElective: boolean;
  isBiometricsDischargeAuthorization: boolean;
  endedVia: string | null;
  beneficiary: number;
}

export interface Identifier {
  identifier: string;
  identifierType: string;
}

export interface BeneficiaryDetails {
  DoB: string;
  gender: string;
  beneficiaryId: number;
  firstName: string;
  lastName: string;
  otherNames: string;
  beneficiaryCode: string;
  guid: string;
  identifiers: Identifier[];
  schemeName: string;
  schemeCode: string;
  categoryName: string;
  categoryCode: string;
}

export interface ProviderDetails {
  name: string;
  sladeCode: number;
  businessPartnerId: number;
  guid: string;
  nationalIdentifier: string;
  bpLevel: string;
  active: boolean;
  identifiers: Identifier[];
}

export interface InterventionData {
  status: string;
  code: string;
  id: number;
  guid: string;
  name: string;
  overallTariff: string;
  paymentMechanism: string;
  kephLevelTarrif: string;
  fallBackKephLevelTariff: string;
}

export interface RequestExtraData {
  hasCoinsurance: boolean;
  sessionExpectedDate: string;
  sessionsRequired: number;
  costPerSession: string;
  sessionsFrequency: string;
  clinicalIndications: string;
}

export interface PreauthRequest {
  id: number;
  preauthItems: PreauthItem[];
  preauthDiagnoses: PreauthDiagnosis[];
  preauthAttachments: PreauthAttachment[];
  preauthNotes: PreauthNote[];
  preauthDoctors: PreauthDoctor[];
  authorizationDetails: AuthorizationDetails;
  preauthType: string;
  providerName: string;
  payerName: string;
  memberName: string;
  memberIsVip: boolean;
  memberIsVvip: boolean;
  memberIdentifier: string;
  memberScheme: string;
  status: string;
  isEmergency: boolean;
  lengthOfStay: number;
  isResponsePhase: boolean;
  isRequestPhase: boolean;
  isRadiology: boolean;
  isSurgical: boolean;
  isRenal: boolean;
  isOncology: boolean;
  isOptical: boolean;
  finalApprovedAmount: string;
  totalInterimApprovedAmountForPreauth: string;
  totalEstimatedAmountForPreauth: string;
  submissionDateIn_EAT: string;
  providerCurrency: string;
  needsDoctorApproval: boolean;
  countdown: number;
  conditionOtherRelated: boolean;
  conditionEmploymentRelated: boolean;
  providerDetails: ProviderDetails;
  beneficiaryDetails: BeneficiaryDetails;
  interventionData: InterventionData;
  interventionCode: string;
  createdByName: string;
  updatedByName: string;
  guid: string;
  sessionType: string;
  serviceStart: string;
  serviceEnd: string;
  requestExtraData: RequestExtraData;
  providerNotificationEmail: string;
  token: string;
  doctorApproved: boolean;
  isElective: boolean;
  sessionsRequired: number;
  costPerSession: string;
  providerConsent: boolean;
  isHmisPreauth: boolean;
  authorization: number;
}

export interface PreauthPreviewResponse {
  results: PreauthRequest[];
}
