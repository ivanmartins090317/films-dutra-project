export interface OnboardingStepFieldsProps {
  form: Record<string, unknown>;
  patch: (patch: Record<string, unknown>) => void;
  fieldErrors: Record<string, string>;
  useBirthYearOnly: boolean;
  setUseBirthYearOnly: (value: boolean) => void;
}
