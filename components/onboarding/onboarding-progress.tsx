interface OnboardingProgressProps {
  currentStep: number;
  totalSteps?: number;
}

const neo = {
  track: "#F0E8DE",
  insetDark: "rgba(90, 78, 62, 0.12)",
  insetLight: "rgba(255, 255, 255, 0.65)",
  fill: "#7A8C6E",
} as const;

/** Barra de progresso soft UI (trilha inset) — design_system.md */
export function OnboardingProgress({ currentStep, totalSteps = 5 }: OnboardingProgressProps) {
  const pct = Math.min(100, Math.round((currentStep / totalSteps) * 100));
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Etapa {currentStep} de {totalSteps}</span>
        <span>{pct}%</span>
      </div>
      <div
        className="mt-2 h-3 w-full overflow-hidden rounded-full"
        style={{
          background: neo.track,
          boxShadow: `inset 4px 4px 8px ${neo.insetDark}, inset -3px -3px 8px ${neo.insetLight}`,
        }}
      >
        <div
          className="h-full rounded-full transition-[width] duration-300 ease-out"
          style={{
            width: `${pct}%`,
            backgroundColor: neo.fill,
            boxShadow: "2px 2px 6px rgba(90, 78, 62, 0.2)",
          }}
        />
      </div>
    </div>
  );
}
