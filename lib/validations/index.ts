/**
 * Schemas Zod por domínio (ex.: onboarding) serão adicionados nas fases correspondentes.
 */
export { loginSchema } from "./auth";
export {
  parseOnboardingPayload,
  onboardingStep1Schema,
  onboardingStep2Schema,
} from "./onboarding";
