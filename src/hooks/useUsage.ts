type PlanOptions = { plan: "monthly" | "annual"; tier: "pro" | "business" };

const unavailable = async (_options?: Partial<PlanOptions>) => ({
  success: false as const,
  error: "Accounts and billing are not part of LocalScribe",
  alreadyOnPlan: false,
  immediateAmount: 0,
  currency: "usd",
  newPriceAmount: 0,
  newInterval: "month",
  nextBillingDate: null,
});

/**
 * Compatibility shape for legacy views while account/billing UI is removed.
 * This is not a synthetic Pro entitlement: LocalScribe has no quota at all.
 */
export function useUsage() {
  return {
    plan: "local",
    status: "local",
    isPastDue: false,
    wordsUsed: 0,
    wordsRemaining: -1,
    limit: 0,
    isSubscribed: false,
    isTrial: false,
    trialDaysLeft: null,
    currentPeriodEnd: null,
    billingInterval: null,
    isOverLimit: false,
    isApproachingLimit: false,
    resetAt: null,
    isLoading: false,
    hasLoaded: true,
    error: null,
    checkoutLoading: false,
    refetch: async () => {},
    openCheckout: unavailable,
    openBillingPortal: unavailable,
    switchPlan: unavailable,
    previewSwitchPlan: unavailable,
  };
}
