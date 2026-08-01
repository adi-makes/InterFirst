import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowRight, Check } from "@phosphor-icons/react";
import { Brand } from "./Brand.jsx";
import { CareersSequenceCanvas } from "./careers/DeveloperSequenceCanvas.jsx";
import {
  createEmptyValues,
  draftStorageKey,
  DRAFT_SCHEMA_VERSION,
  isDraftCurrent,
  roleConfigurations,
  validateStep,
} from "../careers/applicationModel.js";

const stepLabels = [
  "Your role",
  "Your name",
  "Contact",
  "Work type",
  "Work link",
  "Work context",
  "About you",
  "Review",
];

const applicationWheelSpeed = 1.65;

function routeApplicationWheel(event) {
  if (
    event.ctrlKey
    || event.defaultPrevented
    || !Number.isFinite(event.deltaY)
    || event.deltaY === 0
    || Math.abs(event.deltaY) <= Math.abs(event.deltaX)
  ) return;

  const verticalDelta = event.deltaMode === WheelEvent.DOM_DELTA_LINE
    ? event.deltaY * 16
    : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
      ? event.deltaY * window.innerHeight
      : event.deltaY;

  event.preventDefault();
  const scrollElement = document.scrollingElement || document.documentElement;
  scrollElement.scrollTop += verticalDelta * applicationWheelSpeed;
}

function Field({ error, help, id, label, optional = false, ...inputProps }) {
  const helpId = help ? `${id}-help` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [helpId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="application-field">
      <label htmlFor={id}>
        {label}
        {optional ? <span>Optional</span> : null}
      </label>
      <input
        aria-describedby={describedBy}
        aria-invalid={Boolean(error)}
        id={id}
        {...inputProps}
      />
      {help ? <p className="application-field__help" id={helpId}>{help}</p> : null}
      {error ? <p className="application-field__error" id={errorId} role="alert">{error}</p> : null}
    </div>
  );
}

function RoleStep({ firstInputRef, onSelect, selectedRole }) {
  return (
    <div className="application-question application-question--role">
      <div className="application-panel__heading application-panel__heading--intro">
        <p className="application-panel__kicker">Careers at InterFirst</p>
        <h1 id="application-step-1" tabIndex="-1">What role do you want to apply for?</h1>
        <p>Choose your craft. Your application will unfold below as you scroll.</p>
      </div>
      <div className="application-role-options" role="group" aria-label="Choose your role">
        {Object.entries(roleConfigurations).map(([role, configuration], index) => (
          <button
            aria-pressed={selectedRole === role}
            className="application-role-option"
            key={role}
            onClick={() => onSelect(role)}
            ref={index === 0 ? firstInputRef : undefined}
            type="button"
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{configuration.label}</strong>
            {selectedRole === role ? <Check aria-hidden="true" size={20} /> : <ArrowDown aria-hidden="true" size={20} />}
          </button>
        ))}
      </div>
    </div>
  );
}

function NameStep({ errors, firstInputRef, onChange, values }) {
  return (
    <div className="application-question">
      <div className="application-panel__heading">
        <p className="application-panel__kicker">First, who are you?</p>
        <h1 id="application-step-2" tabIndex="-1">What's your name?</h1>
      </div>
      <div className="application-fields application-fields--single">
        <Field autoComplete="name" error={errors.name} id="full-name" label="Full name" onChange={(event) => onChange("name", event.target.value)} ref={firstInputRef} required value={values.name} />
      </div>
    </div>
  );
}

function ContactStep({ errors, firstInputRef, onChange, values }) {
  return (
    <div className="application-question">
      <div className="application-panel__heading">
        <p className="application-panel__kicker">Stay in touch</p>
        <h1 id="application-step-3" tabIndex="-1">Where can we reach you?</h1>
      </div>
      <div className="application-fields">
        <Field autoComplete="email" error={errors.email} id="email" label="Email" onChange={(event) => onChange("email", event.target.value)} ref={firstInputRef} required type="email" value={values.email} />
        <Field autoComplete="address-level2" error={errors.location} id="location" label="Location" onChange={(event) => onChange("location", event.target.value)} optional value={values.location} />
      </div>
    </div>
  );
}

function EvidenceTypeStep({ errors, firstInputRef, onChange, role, values }) {
  const configuration = roleConfigurations[role];
  return (
    <div className="application-question">
      <div className="application-panel__heading">
        <p className="application-panel__kicker">A piece of work</p>
        <h1 id="application-step-4" tabIndex="-1">What kind of work are you sharing?</h1>
      </div>
      <div className="application-fields">
        <fieldset className="application-choice" aria-describedby={errors.evidenceType ? "evidence-type-error" : undefined}>
          <legend>Work type</legend>
          <div className="application-choice__options">
            {configuration.evidenceOptions.map((option, index) => (
              <label key={option}>
                <input checked={values.evidenceType === option} name="evidence-type" onChange={() => onChange("evidenceType", option)} ref={index === 0 ? firstInputRef : undefined} type="radio" value={option} />
                <span>{option}</span>
              </label>
            ))}
          </div>
          {errors.evidenceType ? <p className="application-field__error" id="evidence-type-error" role="alert">{errors.evidenceType}</p> : null}
        </fieldset>
      </div>
    </div>
  );
}

function EvidenceLinkStep({ errors, firstInputRef, onChange, role, values }) {
  const configuration = roleConfigurations[role];
  return (
    <div className="application-question">
      <div className="application-panel__heading">
        <p className="application-panel__kicker">{values.evidenceType || "Relevant work"}</p>
        <h1 id="application-step-5" tabIndex="-1">{configuration.workHeading}</h1>
      </div>
      <div className="application-fields application-fields--single">
        <Field autoComplete="url" error={errors.evidenceUrl} help="Use a complete https:// link." id="evidence-url" label="Work link" onChange={(event) => onChange("evidenceUrl", event.target.value)} placeholder="https://" ref={firstInputRef} required type="url" value={values.evidenceUrl} />
      </div>
    </div>
  );
}

function EvidenceNoteStep({ firstInputRef, onChange, values }) {
  return (
    <div className="application-question">
      <div className="application-panel__heading">
        <p className="application-panel__kicker">Optional context</p>
        <h1 id="application-step-6" tabIndex="-1">Anything we should know about it?</h1>
        <p>A short note is plenty. You can also skip this.</p>
      </div>
      <div className="application-field application-field--answer">
        <label htmlFor="evidence-note">Tell us about it <span>Optional</span></label>
        <textarea id="evidence-note" onChange={(event) => onChange("evidenceNote", event.target.value)} ref={firstInputRef} rows="6" value={values.evidenceNote} />
      </div>
    </div>
  );
}

function AboutStep({ errors, firstInputRef, onChange, role, values }) {
  return (
    <div className="application-question">
      <div className="application-panel__heading">
        <p className="application-panel__kicker">In your own words</p>
        <h1 id="application-step-7" tabIndex="-1">{roleConfigurations[role].question}</h1>
        <p>What made it interesting, and what did you learn?</p>
      </div>
      <div className="application-field application-field--answer">
        <label htmlFor="about-answer">Your answer</label>
        <textarea aria-describedby={errors.answer ? "about-answer-error" : undefined} aria-invalid={Boolean(errors.answer)} id="about-answer" onChange={(event) => onChange("answer", event.target.value)} ref={firstInputRef} rows="9" value={values.answer} />
        {errors.answer ? <p className="application-field__error" id="about-answer-error" role="alert">{errors.answer}</p> : null}
      </div>
    </div>
  );
}

function ReviewStep({ firstInputRef, onEdit, role, values }) {
  const workSummary = [values.evidenceType, values.evidenceUrl].filter(Boolean).join(" · ");
  return (
    <>
      <div className="application-panel__heading">
        <p className="application-panel__kicker">One final look</p>
        <h1 id="application-step-8" ref={firstInputRef} tabIndex="-1">Review.</h1>
        <p>Make sure this feels like you before sending it.</p>
      </div>
      <div className="application-review">
        <section>
          <div><p>Personal details</p><button onClick={() => onEdit(1)} type="button">Edit</button></div>
          <dl>
            <div><dt>Name</dt><dd>{values.name}</dd></div>
            <div><dt>Email</dt><dd>{values.email}</dd></div>
            {values.location ? <div><dt>Location</dt><dd>{values.location}</dd></div> : null}
            <div><dt>Applying as</dt><dd>{roleConfigurations[role].label}</dd></div>
          </dl>
        </section>
        <section>
          <div><p>Relevant work</p><button onClick={() => onEdit(3)} type="button">Edit</button></div>
          <p>{workSummary}</p>
          {values.evidenceNote ? <p>{values.evidenceNote}</p> : null}
        </section>
        <section>
          <div><p>About you</p><button onClick={() => onEdit(6)} type="button">Edit</button></div>
          <p>{values.answer}</p>
        </section>
      </div>
    </>
  );
}

function SubmitActions({ submissionState }) {
  return (
    <div className="application-actions application-actions--submit">
      <button className="application-primary-action" disabled={submissionState === "submitting"} type="submit">
        {submissionState === "submitting" ? "Sending…" : "Submit application"}
      </button>
    </div>
  );
}

function ExitConfirmation({ onContinue, onDiscard, onKeep }) {
  const continueRef = useRef(null);
  useEffect(() => { continueRef.current?.focus(); }, []);
  return (
    <main className="application-decision" aria-labelledby="exit-title">
      <div>
        <p className="application-panel__kicker">Your work is saved</p>
        <h1 id="exit-title">Leave this application?</h1>
        <p>Keep the draft on this device, discard it, or continue where you left off.</p>
        <div className="application-decision__actions">
          <button className="application-primary-action" onClick={onContinue} ref={continueRef}>Continue application</button>
          <button className="application-secondary-action" onClick={onKeep}>Keep draft and exit</button>
          <button className="application-text-action" onClick={onDiscard}>Discard draft</button>
        </div>
      </div>
    </main>
  );
}

function Confirmation({ onBackToCareers, role }) {
  const headingRef = useRef(null);
  useEffect(() => { headingRef.current?.focus(); }, []);
  return (
    <main className="application-confirmation" aria-labelledby="confirmation-title">
      <div>
        <p className="application-panel__kicker">Application received</p>
        <h1 id="confirmation-title" ref={headingRef} tabIndex="-1">Application received.</h1>
        <p>{roleConfigurations[role].confirmation}</p>
        <div className="application-confirmation__actions">
          <a className="application-primary-action" href="/journal">Read the Journal <ArrowRight aria-hidden="true" size={18} /></a>
          <button className="application-text-action" onClick={onBackToCareers}>Back to Careers</button>
        </div>
      </div>
    </main>
  );
}

export function ApplicationExperience({ onExit }) {
  const scrollContainerRef = useRef(null);
  const formRef = useRef(null);
  const checkpointRefs = useRef([]);
  const stepControlRefs = useRef([]);
  const saveTimerRef = useRef(null);
  const submitTimerRef = useRef(null);
  const [step, setStep] = useState(0);
  const [progressValue, setProgressValue] = useState(1);
  const [role, setRole] = useState(null);
  const [values, setValues] = useState(createEmptyValues);
  const [errors, setErrors] = useState({});
  const [saveStatus, setSaveStatus] = useState("Saved on this device");
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);
  const [submissionState, setSubmissionState] = useState("idle");
  const [isSequenceLoading, setIsSequenceLoading] = useState(true);
  const [announcement, setAnnouncement] = useState("Choose a role to begin.");
  const configuration = role ? roleConfigurations[role] : null;
  const storageKey = useMemo(() => (role ? draftStorageKey(role) : null), [role]);
  const stepRefCallbacks = useMemo(() => Array.from({ length: 8 }, (_, index) => (node) => { stepControlRefs.current[index] = node; }), []);

  useEffect(() => {
    if (!role || !storageKey || step === 0) return undefined;
    window.clearTimeout(saveTimerRef.current);
    const statusFrame = window.requestAnimationFrame(() => setSaveStatus("Saving…"));
    saveTimerRef.current = window.setTimeout(() => {
      try {
        localStorage.setItem(storageKey, JSON.stringify({ schemaVersion: DRAFT_SCHEMA_VERSION, role, step, updatedAt: new Date().toISOString(), values }));
        setSaveStatus("Saved on this device");
      } catch {
        setSaveStatus("Couldn't save on this device");
      }
    }, 240);
    return () => {
      window.cancelAnimationFrame(statusFrame);
      window.clearTimeout(saveTimerRef.current);
    };
  }, [role, step, storageKey, values]);

  useEffect(() => {
    const onEscape = (event) => {
      if (event.key !== "Escape" || submissionState !== "idle") return;
      setShowExitConfirmation((current) => !current);
    };
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [submissionState]);

  useEffect(() => {
    if (!role) return undefined;
    let frame = 0;
    const updateActiveCheckpoint = () => {
      const marker = 74 + window.innerHeight * 0.34;
      const checkpointTops = checkpointRefs.current.map(
        (checkpoint) => checkpoint?.getBoundingClientRect().top + window.scrollY,
      );
      let nextStep = 0;
      checkpointRefs.current.forEach((checkpoint, index) => {
        if (checkpoint && checkpoint.getBoundingClientRect().top <= marker) nextStep = index;
      });
      setStep((current) => (current === nextStep ? current : nextStep));

      const scrollPosition = window.scrollY + 74;
      let progressSegment = 0;
      for (let index = 1; index < checkpointTops.length; index += 1) {
        if (scrollPosition >= checkpointTops[index]) progressSegment = index;
        else break;
      }

      let nextProgress = progressSegment + 1;
      const segmentStart = checkpointTops[progressSegment];
      const segmentEnd = checkpointTops[progressSegment + 1];
      if (Number.isFinite(segmentStart) && Number.isFinite(segmentEnd)) {
        const segmentFraction = Math.min(
          Math.max((scrollPosition - segmentStart) / Math.max(segmentEnd - segmentStart, 1), 0),
          1,
        );
        nextProgress += segmentFraction;
      }
      if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 1) {
        nextProgress = 8;
      }
      setProgressValue((current) => (
        Math.abs(current - nextProgress) < 0.001 ? current : nextProgress
      ));
    };
    const onScroll = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(updateActiveCheckpoint);
    };
    updateActiveCheckpoint();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [role]);

  useEffect(() => () => {
    window.clearTimeout(saveTimerRef.current);
    window.clearTimeout(submitTimerRef.current);
  }, []);

  useEffect(() => {
    const form = formRef.current;
    if (!form) return undefined;
    form.addEventListener("wheel", routeApplicationWheel, { capture: true, passive: false });
    return () => form.removeEventListener("wheel", routeApplicationWheel, { capture: true });
  }, [showExitConfirmation, submissionState]);

  const onChange = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const scrollToCheckpoint = (targetStep, focus = false) => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    checkpointRefs.current[targetStep]?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
    if (focus) window.setTimeout(() => stepControlRefs.current[targetStep]?.focus(), reducedMotion ? 0 : 520);
  };

  const selectRole = (nextRole) => {
    setRole(nextRole);
    setErrors({});
    let storedDraft = null;
    const nextStorageKey = draftStorageKey(nextRole);
    try {
      storedDraft = JSON.parse(localStorage.getItem(nextStorageKey));
      if (!isDraftCurrent(storedDraft, nextRole)) {
        if (storedDraft) localStorage.removeItem(nextStorageKey);
        storedDraft = null;
      }
    } catch {
      localStorage.removeItem(nextStorageKey);
    }

    const nextStep = storedDraft ? Math.max(1, storedDraft.step) : 1;
    setValues(storedDraft ? { ...createEmptyValues(), ...storedDraft.values } : createEmptyValues());
    setStep(nextStep);
    setAnnouncement(`${roleConfigurations[nextRole].label} selected. All application questions are available below.`);
  };

  const submit = () => {
    const validationSteps = [1, 2, 3, 4, 6];
    const nextErrors = validationSteps.reduce(
      (allErrors, validationStep) => ({
        ...allErrors,
        ...validateStep(validationStep, values),
      }),
      {},
    );

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      const firstInvalidStep = validationSteps.find(
        (validationStep) => Object.keys(validateStep(validationStep, values)).length,
      );
      setAnnouncement("Complete the highlighted application fields before submitting.");
      scrollToCheckpoint(firstInvalidStep, true);
      return;
    }

    setErrors({});
    setSubmissionState("submitting");
    submitTimerRef.current = window.setTimeout(() => {
      localStorage.removeItem(storageKey);
      setSubmissionState("received");
    }, 520);
  };

  if (submissionState === "received") return <Confirmation onBackToCareers={() => onExit(null)} role={role} />;
  if (showExitConfirmation) {
    return <ExitConfirmation onContinue={() => setShowExitConfirmation(false)} onDiscard={() => { if (storageKey) localStorage.removeItem(storageKey); onExit(null); }} onKeep={() => onExit(role)} />;
  }

  const checkpointContents = [
    <RoleStep firstInputRef={stepRefCallbacks[0]} key="role" onSelect={selectRole} selectedRole={role} />,
    <NameStep errors={errors} firstInputRef={stepRefCallbacks[1]} key="name" onChange={onChange} values={values} />,
    <ContactStep errors={errors} firstInputRef={stepRefCallbacks[2]} key="contact" onChange={onChange} values={values} />,
    <EvidenceTypeStep errors={errors} firstInputRef={stepRefCallbacks[3]} key="work-type" onChange={onChange} role={role || "developer"} values={values} />,
    <EvidenceLinkStep errors={errors} firstInputRef={stepRefCallbacks[4]} key="work-link" onChange={onChange} role={role || "developer"} values={values} />,
    <EvidenceNoteStep firstInputRef={stepRefCallbacks[5]} key="work-context" onChange={onChange} values={values} />,
    <AboutStep errors={errors} firstInputRef={stepRefCallbacks[6]} key="about" onChange={onChange} role={role || "developer"} values={values} />,
    <ReviewStep firstInputRef={stepRefCallbacks[7]} key="review" onEdit={(target) => scrollToCheckpoint(target, true)} role={role || "developer"} values={values} />,
  ];

  return (
    <div className="application-shell" ref={scrollContainerRef}>
      <CareersSequenceCanvas enabled={Boolean(role)} onLoadingChange={setIsSequenceLoading} scrollContainerRef={scrollContainerRef} />
      <header className="application-header">
        <div className="application-header__inner">
          <div><Brand href="/" /><span>{configuration ? `Applying as ${configuration.label}` : "Choose a role"}</span></div>
          <div>
            <span aria-live="polite">{isSequenceLoading ? "Preparing image…" : saveStatus}</span>
            <button onClick={() => setShowExitConfirmation(true)} type="button">Exit</button>
          </div>
        </div>
        <progress aria-label={`Application progress: checkpoint ${step + 1} of 8`} max="8" value={progressValue} />
      </header>

      <main className="application-scroll-flow">
        <p className="application-mobile-statement">We build internet-first companies.</p>
        <p className="sr-only" aria-live="polite">{announcement}</p>
        <form
          data-scroll-owner="document"
          noValidate
          onSubmit={(event) => { event.preventDefault(); submit(); }}
          ref={formRef}
        >
          {(role ? checkpointContents : checkpointContents.slice(0, 1)).map((content, index) => (
            <section
              aria-labelledby={`application-step-${index + 1}`}
              className={`application-checkpoint ${index === step ? "application-checkpoint--active" : ""}`}
              data-application-checkpoint={index}
              id={`application-checkpoint-${index + 1}`}
              key={stepLabels[index]}
              ref={(node) => { checkpointRefs.current[index] = node; }}
            >
              <div className="application-checkpoint__card">
                <div className="application-main__meta"><span>{stepLabels[index]}</span><span>{String(index + 1).padStart(2, "0")} / 08</span></div>
                <div className="application-panel">{content}</div>
                {index === 7 ? <SubmitActions submissionState={submissionState} /> : null}
                {index === 7 ? <p className="application-privacy-note">This draft is stored only in this browser for up to 30 days. On a shared device, discard it before leaving.</p> : null}
              </div>
            </section>
          ))}
        </form>
      </main>
    </div>
  );
}
