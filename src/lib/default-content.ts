import type { SiteContent } from "./types";

export const defaultContent: SiteContent = {
  siteTitle: "Professional CV",
  cv: {
    fullName: "Guillermo Lopez",
    headline: "Business Operations & Automation Specialist",
    location: "Mexico City, MX",
    address: "Roma Norte, CDMX, Mexico",
    email: "hello@guillermolopez.mx",
    phone: "+52 55 0000 0000",
    summary:
      "Operations-focused professional with strong execution discipline across digital platforms, process automation, and stakeholder alignment. Experienced in turning complex workflows into clear, scalable systems.",
    skills: [
      "Process Design",
      "Workflow Automation",
      "Stakeholder Management",
      "Data Analysis",
      "Project Delivery",
      "Cross-Functional Leadership"
    ],
    experience: [
      {
        role: "Senior Operations Consultant",
        company: "Independent Practice",
        period: "2022 - Present",
        highlights: [
          "Led automation projects reducing manual process time by over 40%.",
          "Designed standardized operating procedures for distributed teams.",
          "Implemented KPI reporting structures for executive review."
        ]
      },
      {
        role: "Digital Transformation Analyst",
        company: "Enterprise Services Group",
        period: "2019 - 2022",
        highlights: [
          "Mapped and optimized mission-critical workflows.",
          "Partnered with leadership to prioritize roadmap initiatives."
        ]
      }
    ],
    education: [
      {
        title: "B.A. in Business Administration",
        institution: "Universidad del Valle",
        period: "2015 - 2019"
      }
    ],
    showProjects: false,
    projects: [
      {
        title: "Portfolio Website",
        url: "https://example.com",
        description: "Modern responsive web experience showcasing selected work, UI architecture, and frontend delivery."
      }
    ]
  },
  theme: {
    accent: "#76f005",
    accentAlt: "#47f556",
    background: "#192211",
    backgroundImage: "",
    contrast: "soft",
    bannerStyle: "editorial",
    light: {
      accent: "#4ea003",
      accentAlt: "#0ba32c",
      background: "#f5f7f3",
      backgroundImage: "",
      contrast: "editorial"
    }
  },
  locales: {
    es: {
      siteTitle: "CV Profesional",
      cv: {
        headline: "Especialista en Operaciones y Automatización",
        summary:
          "Profesional orientado a operaciones con ejecución sólida en plataformas digitales, automatización de procesos y alineación de stakeholders. Enfocado en convertir flujos complejos en sistemas claros y escalables."
      }
    }
  }
};
