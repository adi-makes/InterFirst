"use client";

import { useEffect } from "react";
import { AmbientEnvironment } from "./AmbientEnvironment.jsx";
import { ApplicationExperience } from "./ApplicationExperience.jsx";

export function CareersPage({ onApplicationModeChange = () => {} }) {
  useEffect(() => {
    onApplicationModeChange(true);
    return () => onApplicationModeChange(false);
  }, [onApplicationModeChange]);

  return (
    <>
      <AmbientEnvironment />
      <main className="min-h-screen" id="main-content">
        <ApplicationExperience onExit={() => window.location.assign("/")} />
      </main>
    </>
  );
}
