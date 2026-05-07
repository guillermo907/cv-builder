export type CvExperienceItem = {
  role: string;
  company: string;
  period: string;
  highlights: string[];
};

export type CvEducationItem = {
  title: string;
  institution: string;
  period: string;
};

export type CvProjectItem = {
  title: string;
  url: string;
  description: string;
};

export type CvContent = {
  fullName: string;
  headline: string;
  location: string;
  address: string;
  email: string;
  phone: string;
  summary: string;
  skills: string[];
  experience: CvExperienceItem[];
  education: CvEducationItem[];
  showProjects?: boolean;
  projects: CvProjectItem[];
};

export type SiteLocale = "en" | "es";

export type BannerStyle = "editorial" | "blurred" | "split" | "floating";

export type ThemeSettings = {
  accent: string;
  accentAlt: string;
  background: string;
  backgroundImage: string;
  contrast: "soft" | "balanced" | "high" | "editorial";
  bannerStyle?: BannerStyle;
};

export type SiteContent = {
  siteTitle: string;
  cv: CvContent;
  cvUploadedAt?: string;
  cvFileUrl?: string;
  sourceFileName?: string;
  theme: ThemeSettings & {
    light: ThemeSettings;
  };
  locales?: {
    es?: {
      siteTitle?: string;
      cv?: Partial<CvContent>;
    };
  };
};
