"use client";

import { useEffect } from "react";
import { AmbientEnvironment } from "./AmbientEnvironment.jsx";
import { ApplicationExperience } from "./ApplicationExperience.jsx";
import { PageScrollNavigator } from "./PageScrollNavigator.jsx";

export function CareersPage({ onApplicationModeChange = () => {} }) {
  useEffect(() => {
    onApplicationModeChange(true);
    return () => onApplicationModeChange(false);
  }, [onApplicationModeChange]);

  return (
    <>
      <AmbientEnvironment />
      <PageScrollNavigator href="#application-checkpoint-2" label="Continue application" />
      <main className="careers-page min-h-screen" id="main-content">
        <ApplicationExperience onExit={() => window.location.assign("/")} />
      </main>
    </>
  );
}
