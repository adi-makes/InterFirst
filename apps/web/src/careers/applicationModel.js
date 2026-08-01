export const DRAFT_SCHEMA_VERSION = 2;
export const DRAFT_LIFETIME_MS = 30 * 24 * 60 * 60 * 1000;
export const DRAFT_STORAGE_PREFIX = "interfirst.application-draft";

const sharedApplicationConfiguration = Object.freeze({
  evidenceOptions: ["Portfolio", "Project", "Case study"],
  workHeading: "Show us work you're proud of.",
  question: "Tell us about a problem you genuinely enjoyed solving.",
  confirmation: "Thanks for showing us how you think and work.",
});

export const roleConfigurations = {
  developer: {
    label: "Developer",
    ...sharedApplicationConfiguration,
  },
  designer: {
    label: "Designer",
    ...sharedApplicationConfiguration,
  },
  marketer: {
    label: "Marketer",
    ...sharedApplicationConfiguration,
  },
};

export function createEmptyValues() {
  return {
    name: "",
    email: "",
    location: "",
    evidenceType: "",
    evidenceUrl: "",
    evidenceNote: "",
    answer: "",
  };
}

export function draftStorageKey(role) {
  return `${DRAFT_STORAGE_PREFIX}.${role}`;
}

export function isDraftCurrent(draft, role, now = Date.now()) {
  if (
    !draft ||
    draft.schemaVersion !== DRAFT_SCHEMA_VERSION ||
    draft.role !== role ||
    !Number.isInteger(draft.step) ||
    draft.step < 0 ||
    draft.step > 7 ||
    typeof draft.updatedAt !== "string"
  ) {
    return false;
  }

  const updatedAt = Date.parse(draft.updatedAt);
  return Number.isFinite(updatedAt) && now - updatedAt <= DRAFT_LIFETIME_MS;
}

export function validateStep(step, values) {
  const errors = {};

  if (step === 1) {
    if (!values.name.trim()) errors.name = "Enter your full name.";
  }

  if (step === 2) {
    if (!values.email.trim()) {
      errors.email = "Enter an email address we can use to reach you.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      errors.email = "Enter a valid email address.";
    }
  }

  if (step === 3) {
    if (!values.evidenceType) {
      errors.evidenceType = "Choose the kind of work you're sharing.";
    }
  }

  if (step === 4) {
    if (!values.evidenceUrl.trim()) {
      errors.evidenceUrl = "Add a link to the work.";
    } else {
      try {
        const url = new URL(values.evidenceUrl);
        if (url.protocol !== "https:") {
          errors.evidenceUrl = "Use a complete link beginning with https://.";
        }
      } catch {
        errors.evidenceUrl = "Use a complete link beginning with https://.";
      }
    }
  }

  if (step === 6 && !values.answer.trim()) {
    errors.answer = "Share the decision or problem that mattered to you.";
  }

  return errors;
}
