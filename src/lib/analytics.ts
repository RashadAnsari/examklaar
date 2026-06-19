type EventPayload = Record<string, string | number | boolean>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

// Sends a custom event to Google Analytics. gtag only exists once the visitor
// has accepted analytics cookies (see GoogleAnalytics.tsx), so before consent
// every call is a no-op.
function track(event: string, data?: EventPayload) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", event, data);
  }
}

export const analytics = {
  // Auth
  signUp: () => track("sign_up"),
  logIn: () => track("log_in"),
  logOut: () => track("log_out"),
  passwordReset: () => track("password_reset"),

  // Exam
  examStarted: (examId: string) => track("exam_started", { exam_id: examId }),
  examCompleted: (examId: string) => track("exam_completed", { exam_id: examId }),
  examAbandoned: (examId: string) => track("exam_abandoned", { exam_id: examId }),

  // Payment
  checkoutStarted: (plan: string) => track("checkout_started", { plan }),
  checkoutCompleted: (plan: string) => track("checkout_completed", { plan }),
  cancelSubscription: () => track("cancel_subscription"),
};
