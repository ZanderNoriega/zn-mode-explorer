import { createContext } from "react";

const ProjectSettingsContext = createContext<Project.Settings | null>(null);

export default ProjectSettingsContext;
