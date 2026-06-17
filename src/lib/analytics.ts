type EventPayload = Record<string, string | number | boolean>;

declare global {
  interface Window {
    umami?: {
      track: (event: string, data?: EventPayload) => void;
    };
  }
}

function track(event: string, data?: EventPayload) {
  if (typeof window !== "undefined" && window.umami) {
    window.umami.track(event, data);
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
