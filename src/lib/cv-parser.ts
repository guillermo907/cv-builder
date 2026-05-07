import type { CvContent, CvEducationItem, CvExperienceItem } from "./types";

function cleanLine(line: string) {
  return line.replace(/\s+/g, " ").replace(/[^\S\r\n]+/g, " ").trim();
}

function prettifyText(line: string) {
  return cleanLine(
    line
      .replace(/([a-zà-ÿ])([A-ZÁÉÍÓÚÑ])/g, "$1 $2")
      .replace(/([A-Za-zÀ-ÿ])(\d)/g, "$1 $2")
      .replace(/(\d)([A-Za-zÀ-ÿ])/g, "$1 $2")
      .replace(/([,.])([A-Za-zÀ-ÿ])/g, "$1 $2")
      .replace(/\bFrontenddeveloper\b/gi, "Frontend developer")
      .replace(/\bWebDeveloper\b/g, "Web Developer")
      .replace(/FrontendSoftware/gi, "Frontend Software")
      .replace(/SoftwareDeveloper/gi, "Software Developer")
      .replace(/\bHtmlCss\b/g, "HTML CSS")
      .replace(/\bJiraworkflow\b/gi, "Jira workflow")
      .replace(/\bReactJS\b/g, "React JS")
      .replace(/\bNextJS\b/g, "Next JS")
      .replace(/\bNodeJS\b/g, "Node JS")
      .replace(/withteams/gi, "with teams")
      .replace(/Frontenddeveloperwithover/gi, "Frontend developer with over")
      .replace(/teamsworldwide/gi, "teams worldwide")
      .replace(/componentsfromscratch/gi, "components from scratch")
      .replace(/performingvarious/gi, "performing various")
      .replace(/worldwide/gi, "worldwide")
      .replace(/yearsofprofessionalexperience/gi, "years of professional experience")
      .replace(/variousactivities/gi, "various activities")
      .replace(/suchas/gi, "such as")
      .replace(/ascreating/gi, "as creating")
      .replace(/fromscratch/gi, "from scratch")
      .replace(/addingfunctionalities/gi, "adding functionalities")
      .replace(/addingaccessibilityremediation/gi, "adding accessibility remediation")
      .replace(/followingmockups\/wireframes/gi, "following mockups/wireframes")
      .replace(/Iworkacrossdifferentprojects/gi, "I work across different projects")
      .replace(/andnewfeatures/gi, "and new features")
      .replace(/devprocesswith/gi, "dev process with")
      .replace(/besidescollaboratinginthe/gi, "besides collaborating in the")
      .replace(/teamsindifferentlocations/gi, "teams in different locations")
      .replace(/mainlyonthefrontend/gi, "mainly on the frontend")
      .replace(/ensuringaccessibility/gi, "ensuring accessibility")
      .replace(/whilealways/gi, "while always")
      .replace(/adheringto/gi, "adhering to")
      .replace(/Scrummethodologies/gi, "Scrum methodologies")
      .replace(/followingprocesses/gi, "following processes")
      .replace(/bestpractices/gi, "best practices")
      .replace(/standards\.Professional/gi, "standards. Professional")
      .replace(/abilitytocollaborate/gi, "ability to collaborate")
      .replace(/diverseteams/gi, "diverse teams")
      .replace(/apassionfor/gi, "a passion for")
      .replace(/functionalUI/gi, "functional UI")
      .replace(/teamplayer/gi, "team player")
      .replace(/NDSCognitive/gi, "NDS Cognitive")
      .replace(/Makingsense/gi, "Making Sense")
      .replace(/PersistentSystems/gi, "Persistent Systems")
      .replace(/Projectadministrator/gi, "Project administrator")
      .replace(/Logisticsandgeneraloperation/gi, "Logistics and general operation")
      .replace(/Freelanceweb/gi, "Freelance Web")
      .replace(/Differentprojectson/gi, "different projects on")
      .replace(/Iworkedon/gi, "I worked on")
      .replace(/fromaccessibilitytodesignand/gi, "from accessibility to design and")
      .replace(/performancetodifferentfortune/gi, "performance to different Fortune")
      .replace(/websitesbelongingtodifferentbrands/gi, "websites belonging to different brands")
      .replace(/workingmainlyonthefrontend/gi, "working mainly on the frontend")
      .replace(/workingmainly on the frontend/gi, "working mainly on the frontend")
      .replace(/Thelastproject/gi, "The last project")
      .replace(/Iparticipatedon/gi, "I participated on")
      .replace(/wasbasedon/gi, "was based on")
      .replace(/classbased/gi, "class based")
      .replace(/mostlyclass based/gi, "mostly class based")
      .replace(/generalsupportandmanagement/gi, "general support and management")
      .replace(/forgeneral/gi, "for general")
      .replace(/Iwasresponsiblefor/gi, "I was responsible for")
      .replace(/managementforthe/gi, "management for the")
      .replace(/ECGPSplatform/gi, "ECGPS platform")
      .replace(/whichisa/gi, "which is a")
      .replace(/Vehiclecontrolapp/gi, "vehicle control app")
      .replace(/appthatprovides/gi, "app that provides")
      .replace(/providesgpslocation/gi, "provides GPS location")
      .replace(/locationandvehiclecontrol/gi, "location and vehicle control")
      .replace(/vehiclecontrol/gi, "vehicle control")
      .replace(/troughawebapplication/gi, "through a web application")
      .replace(/Myactivitiesthererangefrom/gi, "My activities there range from")
      .replace(/generalsupporttothe/gi, "general support to the")
      .replace(/fromgeneral support/gi, "from general support")
      .replace(/teamandcustomerinteraction/gi, "team and customer interaction")
      .replace(/providingmaintenance/gi, "providing maintenance")
      .replace(/maintenancefor/gi, "maintenance for")
      .replace(/fortheserver/gi, "for the server")
      .replace(/functionalitytothebackendandfrontend/gi, "functionality to the backend and frontend")
      .replace(/databases\(MySQL\)togetrequireddata/gi, "databases (MySQL) to get required data")
      .replace(/ConsumingAPIsandprovidingsupport/gi, "Consuming APIs and providing support")
      .replace(/forthetechnicianswheninstallingnewdevicesonvehicles/gi, "for the technicians when installing new devices on vehicles")
      .replace(/Ialsoperformedmaintenancebyadding/gi, "I also performed maintenance by adding")
      .replace(/changingorremovingcontent/gi, "changing or removing content")
      .replace(/specificdesignchangesfrom/gi, "specific design changes from")
      .replace(/Iprovidedsupportandaddednewfunctionality/gi, "I provided support and added new functionality")
      .replace(/functionalityto/gi, "functionality to")
      .replace(/toexistingsoftwaresolutions/gi, "to existing software solutions")
      .replace(/Transactionloggerforasmallbanking\/financialenterprise/gi, "Transaction logger for a small banking/financial enterprise")
      .replace(/Jewelrystoresellpoint\/ERPwhichincludedaWebapplication/gi, "Jewelry store sell point/ERP which included a Web application")
      .replace(/builtaround/gi, "built around")
      .replace(/Amongmyactivitieswere/gi, "Among my activities were")
      .replace(/onsitemeetingswiththeclient/gi, "on-site meetings with the client")
      .replace(/writingdown/gi, "writing down")
      .replace(/assigningitemstoteammembers/gi, "assigning items to team members")
      .replace(/supervisingtheteamanddocumenting/gi, "supervising the team and documenting")
      .replace(/documentingfor/gi, "documenting for")
      .replace(/Iranthelogistics/gi, "I ran the logistics")
      .replace(/informatiónandresources/gi, "information and resources")
      .replace(/supervisedtheexpendingsandthe/gi, "supervised the spendings and the")
      .replace(/activityreportsonthe/gi, "activity reports on the")
      .replace(/UNPNUDprogramon/gi, "UN PNUD program on")
      .replace(/workingfromthe/gi, "working from the")
      .replace(/GDLsite/gi, "GDL site")
      .replace(/Participatedondifferentprojectsallinrelationtosocialdevelopment/gi, "Participated on different projects related to social development")
      .replace(/I’veworkedondesigning/gi, "I’ve worked on designing")
      .replace(/testingandmaintaining/gi, "testing and maintaining")
      .replace(/Webpagesusing/gi, "Web pages using")
      .replace(/Fluentenglish/gi, "Fluent English")
      .replace(/Basicimageediting/gi, "Basic image editing")
      .replace(/Problemsolving/gi, "Problem solving")
      .replace(/Goodtastefordesign/gi, "Good taste for design")
      .replace(/Tecnologíasdelainformación/gi, "Tecnologías de la información")
      .replace(/Lic\.en/gi, "Lic. en ")
      .replace(/\s*[-–—]\s*/g, " - ")
      .replace(/on - site/gi, "on-site")
      .replace(/\bdec\b/g, "Dec")
  );
}

function detectPeriod(line: string) {
  const cleaned = line.replace(/CurrentJobsince/i, "").replace(/job since/i, "");
  const match = cleaned.match(
    /(\b(?:ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*(19|20)\d{2}|(19|20)\d{2}|\d{1,2}[/-](19|20)\d{2})\s*[-–—]\s*(\b(?:ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*(19|20)\d{2}|(19|20)\d{2}|Present|Presente|Actual|Now|Current|Actualmente|\d{1,2}[/-](19|20)\d{2})/i
  );
  if (match?.[0]) return prettifyText(match[0]);

  const currentSince = line.match(/(?:current\s*job\s*since|currentjobsince)\s*([A-Za-z]{3,}\.?\s*(19|20)\d{2})/i);
  if (currentSince?.[1]) return `${prettifyText(currentSince[1])} - Present`;

  return "";
}

function hasDate(line: string) {
  return Boolean(detectPeriod(line)) || /\b(19|20)\d{2}\b/.test(line);
}

function isContactLine(line: string) {
  return /@|linkedin|github|http|www\.|phone|telefono|teléfono|correo|email|address|direccion|dirección|\+?\d[\d\s().-]{7,}\d/i.test(line);
}

function isSectionHeading(line: string) {
  return /^(experience|employment|work history|professional history|experiencia|experiencia profesional|trayectoria|education|educacion|educación|skills|habilidades|competencias|programming languages\/?|frameworks|other skills|otherskills|other tools|other tools i’ve worked with|languages|certifications|certificaciones|projects|proyectos|summary|profile|perfil|contact|contacto)$/i.test(line);
}

function isRoleLike(line: string) {
  return /manager|engineer|analyst|specialist|consultant|developer|director|lead|coordinator|intern|owner|founder|architect|designer|administrator|operator|assistant|associate|supervisor|gerente|analista|ingeniero|consultor|desarrollador|director|coordinador|fundador|diseñador|administrador|supervisor|asistente/i.test(line);
}

function isCompanyLike(line: string) {
  return /inc|llc|ltd|corp|company|group|solutions|services|studio|agency|consulting|systems|technologies|cognitive|persistent|ecgps|galex|kronosoft|imepi|universidad|university|empresa|grupo|servicios|soluciones|tecnologias|tecnologías|consultoria|consultoría/i.test(line);
}

function compactLine(line: string) {
  return cleanLine(line.replace(/^[-•*]\s*/, ""));
}

function stripLabel(line: string) {
  return cleanLine(
    line.replace(
      /^(email|e-mail|correo|mail|phone|telefono|teléfono|tel|mobile|celular|address|direccion|dirección|location|ubicacion|ubicación)\s*[:|-]\s*/i,
      ""
    )
  );
}

function findSection(lines: string[], startPattern: RegExp, endPatterns: RegExp[]) {
  const start = lines.findIndex((line) => startPattern.test(line));
  if (start < 0) return [] as string[];

  let end = lines.length;
  for (let i = start + 1; i < lines.length; i += 1) {
    if (endPatterns.some((pattern) => pattern.test(lines[i]))) {
      end = i;
      break;
    }
  }

  return lines.slice(start + 1, end).filter(Boolean);
}

function extractEmail(lines: string[]) {
  const line = lines.find((item) => /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(item)) ?? "";
  return line.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] ?? "";
}

function extractPhone(lines: string[]) {
  const line =
    lines.find((item) => /(\+?\d[\d\s().-]{7,}\d)/.test(item) && item.replace(/\D/g, "").length >= 8) ?? "";
  return stripLabel(line).match(/\+?\d[\d\s().-]{7,}\d/)?.[0] ?? stripLabel(line);
}

function extractAddress(lines: string[]) {
  const phoneLine = lines.find((line) => /(\+?\d[\d\s().-]{7,}\d)/.test(line));
  if (phoneLine) {
    const beforePhone = phoneLine.split(/(\+?\d[\d\s().-]{7,}\d)/)[0];
    if (beforePhone.length > 2) return prettifyText(beforePhone);
  }

  const addressLine = lines.find((line) =>
    /address|direccion|dirección|street|st\.|avenue|ave\.|city|colonia|municipio|zip|postal|cp\s*\d|c\.p\./i.test(line)
  );

  if (addressLine) return stripLabel(addressLine);

  const locationLike = lines.find((line) =>
    /,\s*[A-Za-zÀ-ÿ]{2,}(\s*,\s*[A-Za-zÀ-ÿ]{2,})?/.test(line) &&
    !/@|linkedin|github|http|www\./i.test(line) &&
    line.length < 90
  );
  return locationLike ?? "";
}

function extractName(lines: string[]) {
  const contactPattern = /@|linkedin|github|phone|tel|correo|email|address|direccion|http|www\.|\d{4,}/i;
  const candidate = lines
    .slice(0, 12)
    .find((line) => /^[A-Za-zÀ-ÿ' -]{6,60}$/.test(line) && line.split(" ").length <= 5 && !contactPattern.test(line));
  return prettifyText(candidate ?? lines[0] ?? "Uploaded Candidate");
}

function extractHeadline(lines: string[], name: string) {
  const afterNameIndex = lines.findIndex((line) => line === name);
  const nextLines = afterNameIndex >= 0 ? lines.slice(afterNameIndex + 1, afterNameIndex + 6) : lines.slice(0, 6);
  const candidate = nextLines.find((line) =>
    /manager|engineer|analyst|specialist|consultant|developer|director|lead|coordinator|architect|designer|administrator|operations|marketing|sales|finance|profile|perfil|gerente|analista|ingeniero|consultor|desarrollador|director|coordinador|diseñador/i.test(line)
  );
  return prettifyText(candidate ?? "Professional Profile");
}

function extractSkills(lines: string[]) {
  const skillsSection = findSection(lines, /skills|habilidades|competencias|technical skills|core skills|herramientas|programminglanguages|frameworks/i, [/education|educacion|educación|formacion|formación|otherskills|other skills|languages|github/i]);

  const skillLines = (skillsSection.length > 0 ? skillsSection : lines)
    .flatMap((line) => line.split(/[,|•]/))
    .map((line) => prettifyText(line.replace(/\*+/g, "")))
    .filter((line) => line.length > 2 && line.length < 40)
    .filter((line) => !/skills|habilidades|competencias|experience|education|frameworks|programming/i.test(line))
    .filter((line) => !/@|http|www\.|\+\d/.test(line));

  return Array.from(new Set(skillLines)).slice(0, 12);
}

function isJobHeader(line: string, nextLine = "") {
  return (/—|-|–/.test(line) && (isRoleLike(line) || isCompanyLike(line) || isRoleLike(nextLine))) || /^Freelance\s*Web\s*Developer$/i.test(line);
}

function parseJobHeader(line: string, nextLine = "") {
  const pretty = prettifyText(line.replace(/\(Current\)/i, ""));
  const nextPretty = prettifyText(nextLine.replace(/\(Current\)/i, ""));

  if (/freelance/i.test(pretty)) {
    return { company: "Freelance", role: pretty };
  }

  const parts = pretty.split(/\s+[—–-]\s+|[—–]/).map(prettifyText).filter(Boolean);
  const company = parts[0] ?? "Organization";
  const roleBase = parts.slice(1).join(" ") || "Role";
  const role = isRoleLike(nextPretty) && !hasDate(nextPretty) ? `${roleBase} ${nextPretty}` : roleBase;

  return { company, role };
}

function isNoiseInExperience(line: string) {
  return isContactLine(line) || isSectionHeading(line) || /^(javascript|html5|react|redux|vue|angular|next|astro|jquery|css|sql|mongodb|node|express|git|sass|cypress|wordpress|bootstrap|materialui|styledcomponents|semanticui|fontawesome|fontsawesome)$/i.test(line.replace(/\*+/g, "").replace(/\s+/g, ""));
}

function extractExperience(lines: string[]): CvExperienceItem[] {
  const employmentSection = findSection(lines, /^employment$|^experience$|^professional experience$/i, [/^education$/i]);
  const source = (employmentSection.length > 0 ? employmentSection : lines)
    .map(compactLine)
    .map(prettifyText)
    .filter((line) => line.length > 1)
    .filter((line) => !isNoiseInExperience(line));

  const headerIndexes = source
    .map((line, index) => ({ index, line }))
    .filter(({ index, line }) => isJobHeader(line, source[index + 1] ?? ""))
    .map(({ index }) => index);

  const entries = headerIndexes.map((headerIndex, entryIndex) => {
    const nextHeader = headerIndexes[entryIndex + 1] ?? source.findIndex((line, index) => index > headerIndex && /^EDUCATION$/i.test(line));
    const end = nextHeader > headerIndex ? nextHeader : Math.min(source.length, headerIndex + 12);
    const block = source.slice(headerIndex, end).filter(Boolean);
    const dateLine = block.find((line, index) => index > 0 && hasDate(line)) ?? block.find((line) => hasDate(line)) ?? "";
    const period = detectPeriod(dateLine) || prettifyText(dateLine) || "Recent";
    const header = source[headerIndex];
    const parsed = parseJobHeader(header, source[headerIndex + 1] ?? "");
    const highlights = block
      .slice(1)
      .filter((line) => line !== dateLine)
      .filter((line) => line !== source[headerIndex + 1] || hasDate(line) || !isRoleLike(line))
      .filter((line) => !isNoiseInExperience(line))
      .filter((line, index) => !isJobHeader(line, block[index + 1] ?? ""))
      .map(prettifyText)
      .filter((line) => line.length > 18)
      .slice(0, 4);

    return {
      role: parsed.role,
      company: parsed.company,
      period,
      highlights: highlights.length > 0 ? highlights : ["Experience detail extracted from uploaded CV."]
    };
  });

  const uniqueEntries = entries.filter(
    (entry, index, all) =>
      all.findIndex((item) => item.role === entry.role && item.company === entry.company && item.period === entry.period) === index
  );

  if (uniqueEntries.length > 0) return uniqueEntries.slice(0, 6);

  return [
    {
      role: "Professional Experience",
      company: "Parsed from uploaded CV",
      period: "Recent",
      highlights: ["Experience details extracted from uploaded document."]
    }
  ];
}

function extractEducation(lines: string[]): CvEducationItem[] {
  const section = findSection(lines, /^education$|educacion|educación|academic|formacion|formación/i, [/^skills$|^habilidades$|^other skills$|^languages$|^github/i]);
  const source = (section.length > 0 ? section : lines).map(prettifyText);

  const items: CvEducationItem[] = [];

  for (let i = 0; i < source.length; i += 1) {
    const line = source[i];
    const period = detectPeriod(line) || prettifyText(line.match(/\b[A-Za-z]+(19|20)\d{2}\s*[-–—]\s*[A-Za-z]*(19|20)\d{2}\b/i)?.[0] ?? "");

    if (!/bachelor|master|degree|licenciatura|ingenieria|ingeniería|universidad|university|instituto|college|bootcamp|diploma|certificado|certificate/i.test(line) && !period) {
      continue;
    }

    const prev = cleanLine(source[i - 1] ?? "");
    const base = cleanLine(line.replace(period, ""));
    const next = cleanLine(source[i + 1] ?? "");
    const educationLine = period && /[—–-]/.test(prev) ? prev : base || next;
    const parts = educationLine.split(/\s+[—–-]\s+|[—–]/).map(prettifyText).filter(Boolean);

    const institution =
      parts.length > 1
        ? parts[0]
        : /universidad|university|instituto|college|school|escuela|udg/i.test(educationLine)
          ? prettifyText(educationLine)
          : prettifyText(next || "Institution");
    const title = parts.length > 1 ? parts.slice(1).join(" ") : prettifyText(base || next || "Education");

    items.push({
      title,
      institution,
      period: period || ""
    });
  }

  return items.slice(0, 4);
}

function extractSummary(lines: string[]) {
  const profileSection = findSection(lines, /summary|profile|about|resumen|perfil|objetivo/i, [/experience|employment|skills|habilidades|education|educacion|educación/i]);
  const summary = (profileSection.length > 0 ? profileSection : lines.slice(0, 20))
    .filter((line) => line.length > 40)
    .slice(0, 2)
    .join(" ");

  return prettifyText(summary || "Professional profile generated from uploaded CV.");
}

export async function parseCvPdfToContent(fileBuffer: Buffer, fileName: string): Promise<Partial<CvContent>> {
  const pdfParse = (await import("pdf-parse")).default;
  const parsed = await pdfParse(fileBuffer);
  const text = parsed.text || "";

  const lines = text
    .split("\n")
    .map(prettifyText)
    .filter((line) => line.length > 0);

  const fullName = extractName(lines);
  const email = extractEmail(lines);
  const phone = extractPhone(lines);
  const address = extractAddress(lines);
  const headline = extractHeadline(lines, fullName);
  const experience = extractExperience(lines);
  const education = extractEducation(lines);
  const skills = extractSkills(lines);
  const summary = extractSummary(lines);

  return {
    fullName,
    email,
    phone,
    address,
    headline,
    summary: `${summary} (Source: ${fileName})`,
    skills,
    experience,
    education,
    location: address || ""
  };
}
