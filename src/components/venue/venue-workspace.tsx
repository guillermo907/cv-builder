"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useState, type CSSProperties, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { deleteEventAction, saveEventAction, type EventSaveState } from "@/app/actions/events";
import { renderPosterPage } from "@/components/events/poster-page-renderers";
import {
  buildPosterDesign,
  buildPosterDesignOptions,
  posterTemplateIds,
  type PosterTemplateId,
} from "@/lib/poster-designer";
import {
  eventVisualMotifs,
  getEventInviteStyle,
  type EventInviteStyleId,
  type EventVisualMotifId,
  type PosterVisibleFieldId,
  type VenueEventRecord,
} from "@/lib/event-types";
import styles from "./venue-workspace.module.scss";

type VenueWorkspaceProps = {
  initialEvents: VenueEventRecord[];
};

type VenueEventDraft = VenueEventRecord;
type PosterAiProposal = {
  proposal_id: number;
  style_title: string;
  design_storytelling: string;
  poster_url: string;
};

const wizardSteps = [
  { id: 0, eyebrow: "Paso 1", title: "Contenido" },
  { id: 1, eyebrow: "Paso 2", title: "Dirección" },
  { id: 2, eyebrow: "Paso 3", title: "Review" },
] as const;

const posterFieldOptions: Array<{ id: PosterVisibleFieldId; label: string; hint: string }> = [
  { id: "venue", label: "Venue", hint: "Nombre principal del lugar" },
  { id: "date", label: "Fecha", hint: "Día, mes o año del evento" },
  { id: "address", label: "Dirección", hint: "Ubicación detallada" },
  { id: "summary", label: "Resumen corto", hint: "Hook o frase breve del evento" },
  { id: "description", label: "Descripción larga", hint: "Texto editorial más desarrollado" },
  { id: "schedule", label: "Horarios", hint: "Doors, show y soundcheck" },
  { id: "lineup", label: "Lineup", hint: "Artistas o participantes" },
  { id: "genre", label: "Géneros", hint: "Textura o familia musical" },
  { id: "pricing", label: "Precios", hint: "Costo y lugares disponibles" },
  { id: "cta", label: "CTA compra", hint: "Botón o llamado a compra" },
  { id: "related", label: "Otras fechas", hint: "Links a eventos relacionados" },
];

const posterIdeaPresets = [
  {
    id: "editorial-jazz",
    title: "Editorial jazz",
    localVariant: "jazz-poster" as EventInviteStyleId,
    localTemplate: "festival-ticket" as PosterTemplateId,
    motifs: ["wave-lines", "ticket-stamp"] as EventVisualMotifId[],
    prompt:
      "Poster editorial sofisticado, con tensión tipográfica, ritmo nocturno, formas orgánicas y una sensación cultural premium.",
  },
  {
    id: "club-digital",
    title: "Club digital",
    localVariant: "club-grid" as EventInviteStyleId,
    localTemplate: "signal-grid" as PosterTemplateId,
    motifs: ["equalizer-bars", "constellation-dots"] as EventVisualMotifId[],
    prompt:
      "Poster de club con energía cinética, contraste alto, luz digital controlada, sensación de after y jerarquía contundente.",
  },
  {
    id: "festival-solar",
    title: "Festival solar",
    localVariant: "festival-sunset" as EventInviteStyleId,
    localTemplate: "paper-cut-stage" as PosterTemplateId,
    motifs: ["paper-cuts", "music-notes"] as EventVisualMotifId[],
    prompt:
      "Poster cálido y celebratorio, con carácter de festival, capas amplias, presencia de lineup y una atmósfera abierta y memorable.",
  },
  {
    id: "cinematic-prestige",
    title: "Cinemático",
    localVariant: "jazz-poster" as EventInviteStyleId,
    localTemplate: "nocturne-frame" as PosterTemplateId,
    motifs: ["constellation-dots", "wave-lines"] as EventVisualMotifId[],
    prompt:
      "Poster con dramatismo cinematográfico, grano, luz dirigida, profundidad y una sensación de evento irrepetible con prestigio visual.",
  },
] as const;

const payoutAutomationRate = 0.015;
const initialState: EventSaveState = { ok: false, message: "" };
const publicFeedCacheKey = "foro-gdl-public-events-feed";
const deleteInitialState: EventSaveState = { ok: false, message: "" };

const templateLabelMap: Record<PosterTemplateId, string> = {
  "festival-ticket": "Festival Ticket",
  "midnight-flyer": "Midnight Flyer",
  "sunburst-billboard": "Sunburst Billboard",
  "velvet-program": "Velvet Program",
  "signal-grid": "Signal Grid",
  "paper-cut-stage": "Paper Cut Stage",
  "afterglow-columns": "Afterglow Columns",
  "rooftop-blueprint": "Rooftop Blueprint",
  "brass-badge": "Brass Badge",
  "analog-wave": "Analog Wave",
  "monolith-dateblock": "Monolith Dateblock",
  "kinetic-ribbon": "Kinetic Ribbon",
  "city-light-stamp": "City Light Stamp",
  "nocturne-frame": "Nocturne Frame",
  "electric-mosaic": "Electric Mosaic",
};

const assetModeOptions: Array<{
  id: NonNullable<VenueEventRecord["posterAssetMode"]>;
  label: string;
  description: string;
}> = [
  {
    id: "graphic-only",
    label: "Graphic only",
    description: "No usa fotografía en el poster; construye la composición con tipografía, formas y ornamentos.",
  },
  {
    id: "uploaded-hero",
    label: "Uploaded hero",
    description: "Prioriza la imagen subida por el venue y la transforma para el poster.",
  },
  {
    id: "banana-pro",
    label: "Banana Pro pass",
    description: "El diseñador prepara composición o plate editorial con edición/generación asistida.",
  },
  {
    id: "pexels-editorial",
    label: "Pexels editorial",
    description: "Busca una base editorial y la reinterpreta con tratamiento fuerte antes de publicar.",
  },
  {
    id: "mixed-collage",
    label: "Mixed collage",
    description: "Empuja una mezcla más agresiva de recortes, texturas y tratamiento de figura.",
  },
];

function toDateTimeLocalValue(value: string) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);
  return localDate.toISOString().slice(0, 16);
}

function splitCommaList(value: string) {
  return value
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildDraftFingerprint(event: VenueEventDraft) {
  return JSON.stringify({
    title: event.title,
    summary: event.summary,
    description: event.description,
    startsAt: event.startsAt,
    endsAt: event.endsAt,
    timezone: event.timezone,
    venueName: event.venueName,
    venueAddress: event.venueAddress,
    heroImage: event.heroImage,
    designVariant: event.designVariant ?? "",
    designTemplateId: event.designTemplateId ?? "",
    designMotifs: event.designMotifs ?? [],
    posterVisibleFields: event.posterVisibleFields ?? posterFieldOptions.map((field) => field.id),
    posterArtDirection: event.posterArtDirection ?? "",
    posterReferenceUrls: event.posterReferenceUrls ?? [],
    posterAssetMode: event.posterAssetMode ?? "graphic-only",
    doorTime: event.doorTime,
    soundcheckTime: event.soundcheckTime,
    ticketPriceMXN: event.ticketPriceMXN,
    ticketFeeMXN: event.ticketFeeMXN,
    artistPayoutRate: event.artistPayoutRate,
    capacity: event.capacity,
    soldCount: event.soldCount,
    lineup: event.lineup,
    genre: event.genre,
    isPublished: event.isPublished,
  });
}

function createEmptyDraft(): VenueEventDraft {
  const startsAt = new Date();
  startsAt.setDate(startsAt.getDate() + 7);
  startsAt.setHours(21, 0, 0, 0);
  const endsAt = new Date(startsAt);
  endsAt.setHours(23, 45, 0, 0);
  const doorTime = new Date(startsAt);
  doorTime.setHours(20, 0, 0, 0);
  const soundcheckTime = new Date(startsAt);
  soundcheckTime.setHours(18, 30, 0, 0);

  return {
    id: "",
    slug: "",
    title: "Nuevo evento Foro GDL",
    summary: "Una fecha nueva lista para venta móvil, invite premium y control operativo.",
    description:
      "Crea aquí la página pública del evento, elige una dirección visual distinta y publica cuando el venue esté listo.",
    startsAt: startsAt.toISOString(),
    endsAt: endsAt.toISOString(),
    timezone: "America/Mexico_City",
    venueName: "Foro GDL",
    venueAddress: "Av. Chapultepec Sur 180, Americana, Guadalajara, Jalisco",
    heroImage: "/events/stage1.jpg",
    designVariant: "jazz-poster",
    designTemplateId: "festival-ticket",
    designMotifs: ["wave-lines", "ticket-stamp"],
    posterVisibleFields: posterFieldOptions.map((field) => field.id),
    posterArtDirection: "",
    posterReferenceUrls: [],
    posterAssetMode: "graphic-only",
    doorTime: doorTime.toISOString(),
    soundcheckTime: soundcheckTime.toISOString(),
    ticketPriceMXN: 280,
    ticketFeeMXN: 15,
    artistPayoutRate: 0.7,
    capacity: 320,
    soldCount: 0,
    lineup: ["Headliner", "Support"],
    genre: ["Live Music", "Nightlife"],
    isPublished: false,
    createdAt: "",
    updatedAt: "",
  };
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(value);
}

function normalizeDraftRecord(event: VenueEventRecord): VenueEventDraft {
  return { ...event };
}

export function VenueWorkspace({ initialEvents }: VenueWorkspaceProps) {
  const safeEvents = useMemo(() => (Array.isArray(initialEvents) ? initialEvents : []), [initialEvents]);
  const router = useRouter();
  const [emptyDraft] = useState(() => createEmptyDraft());
  const [selectedId, setSelectedId] = useState(safeEvents[0]?.id ?? "new");
  const [draft, setDraft] = useState<VenueEventDraft>(() =>
    safeEvents[0] ? normalizeDraftRecord(safeEvents[0]) : emptyDraft,
  );
  const [pendingHeroPreview, setPendingHeroPreview] = useState("");
  const [pendingHeroFileName, setPendingHeroFileName] = useState("");
  const [previewScreen, setPreviewScreen] = useState<"preview" | "story" | "ticket">("preview");
  const [designWizardStep, setDesignWizardStep] = useState<0 | 1 | 2>(0);
  const [maxUnlockedWizardStep, setMaxUnlockedWizardStep] = useState<0 | 1 | 2>(0);
  const [designSourceMode, setDesignSourceMode] = useState<"local" | "ai">("local");
  const [selectedIdeaPreset, setSelectedIdeaPreset] = useState<(typeof posterIdeaPresets)[number]["id"]>(
    posterIdeaPresets[0].id,
  );
  const [aiProposals, setAiProposals] = useState<PosterAiProposal[]>([]);
  const [selectedAiProposalId, setSelectedAiProposalId] = useState<number | null>(null);
  const [aiStatus, setAiStatus] = useState<{ loading: boolean; error: string }>({
    loading: false,
    error: "",
  });
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [saveState, saveAction, isSaving] = useActionState(saveEventAction, initialState);
  const [deleteState, deleteAction, isDeleting] = useActionState(deleteEventAction, deleteInitialState);
  const baselineDraft = useMemo(
    () => (selectedId === "new" ? emptyDraft : safeEvents.find((event) => event.id === selectedId) ?? emptyDraft),
    [emptyDraft, safeEvents, selectedId],
  );
  const hasUnsavedChanges =
    buildDraftFingerprint(draft) !== buildDraftFingerprint(baselineDraft) || Boolean(pendingHeroPreview);
  const previewDraft = useMemo(
    () => (pendingHeroPreview ? { ...draft, heroImage: pendingHeroPreview } : draft),
    [draft, pendingHeroPreview],
  );
  const templateOptions = useMemo(
    () =>
      posterTemplateIds.filter((templateId) => {
        if (draft.designVariant === "jazz-poster") {
          return ["festival-ticket", "velvet-program", "brass-badge", "nocturne-frame", "analog-wave"].includes(templateId);
        }

        if (draft.designVariant === "club-grid") {
          return ["midnight-flyer", "signal-grid", "electric-mosaic", "kinetic-ribbon", "city-light-stamp"].includes(templateId);
        }

        return ["sunburst-billboard", "paper-cut-stage", "afterglow-columns", "rooftop-blueprint", "monolith-dateblock"].includes(templateId);
      }),
    [draft.designVariant],
  );

  useEffect(() => {
    if (saveState.ok) {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(publicFeedCacheKey);
      }

      router.refresh();
    }
  }, [router, saveState.ok]);

  useEffect(() => {
    if (!deleteState.ok || !deleteState.deletedEventId) {
      return;
    }

    if (typeof window !== "undefined") {
      window.localStorage.removeItem(publicFeedCacheKey);
    }

    const timeoutId = window.setTimeout(() => {
      setDeleteConfirmation("");
      setSelectedId("new");
      setDraft(emptyDraft);
      setPendingHeroPreview("");
      setPendingHeroFileName("");
      setPreviewScreen("preview");
      setDesignWizardStep(0);
      setMaxUnlockedWizardStep(0);
      setDesignSourceMode("local");
      setAiProposals([]);
      setSelectedAiProposalId(null);
      setAiStatus({ loading: false, error: "" });
    }, 0);

    router.refresh();
    return () => window.clearTimeout(timeoutId);
  }, [deleteState.deletedEventId, deleteState.ok, emptyDraft, router]);

  useEffect(() => {
    if (!saveState.ok) {
      return;
    }

    const persisted = saveState.savedEvent ?? safeEvents.find((event) => event.slug === saveState.slug);

    if (!persisted) {
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedId(persisted.id);
    setDraft(normalizeDraftRecord(persisted));
    setPendingHeroPreview("");
    setPendingHeroFileName("");
  }, [safeEvents, saveState.ok, saveState.savedEvent, saveState.slug]);

  useEffect(() => {
    if (selectedId === "new") {
      return;
    }

    const refreshed = safeEvents.find((event) => event.id === selectedId);

    if (!refreshed) {
      return;
    }

    if (!hasUnsavedChanges && buildDraftFingerprint(refreshed) !== buildDraftFingerprint(draft)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDraft(normalizeDraftRecord(refreshed));
    }
  }, [draft, hasUnsavedChanges, safeEvents, selectedId]);

  useEffect(() => {
    return () => {
      if (pendingHeroPreview) {
        URL.revokeObjectURL(pendingHeroPreview);
      }
    };
  }, [pendingHeroPreview]);

  const generatedDesign = useMemo(() => buildPosterDesign(previewDraft), [previewDraft]);
  const designOptions = useMemo(() => buildPosterDesignOptions(previewDraft), [previewDraft]);
  const selectedStyle = useMemo(() => getEventInviteStyle(generatedDesign.variant), [generatedDesign.variant]);
  const visiblePosterFields = useMemo(
    () => (draft.posterVisibleFields?.length ? draft.posterVisibleFields : posterFieldOptions.map((field) => field.id)),
    [draft.posterVisibleFields],
  );
  const previewRelatedEvents = useMemo(
    () =>
      safeEvents
        .filter((event) => event.id !== draft.id && event.slug !== draft.slug)
        .slice(0, 3)
        .map((event) => ({ slug: event.slug, title: event.title })),
    [draft.id, draft.slug, safeEvents],
  );

  const financialModel = useMemo(() => {
    const grossTicket = draft.ticketPriceMXN + draft.ticketFeeMXN;
    const soldGross = draft.soldCount * grossTicket;
    const faceValue = draft.soldCount * draft.ticketPriceMXN;
    const platformFees = draft.soldCount * draft.ticketFeeMXN;
    const artistGross = faceValue * draft.artistPayoutRate;
    const payoutFee = artistGross * payoutAutomationRate;
    const artistNet = artistGross - payoutFee;
    const venueNetBeforeProcessor = soldGross - platformFees - artistNet;

    return {
      remaining: Math.max(0, draft.capacity - draft.soldCount),
      grossTicket,
      soldGross,
      platformFees,
      artistNet,
      venueNetBeforeProcessor,
    };
  }, [draft]);
  const visibleFieldCount = visiblePosterFields.length;
  const hiddenFieldCount = posterFieldOptions.length - visibleFieldCount;
  const selectedPreset = useMemo(
    () => posterIdeaPresets.find((item) => item.id === selectedIdeaPreset) ?? posterIdeaPresets[0],
    [selectedIdeaPreset],
  );
  const deleteFormId = draft.id ? `delete-event-${draft.id}` : "delete-event";
  const stepMeta = wizardSteps[designWizardStep];
  const isFirstWizardStep = designWizardStep === 0;
  const isLastWizardStep = designWizardStep === wizardSteps.length - 1;
  const visibleAiProposals = useMemo(() => aiProposals.slice(0, 3), [aiProposals]);
  const selectedAiProposal = useMemo(
    () => visibleAiProposals.find((proposal) => proposal.proposal_id === selectedAiProposalId) ?? visibleAiProposals[0] ?? null,
    [selectedAiProposalId, visibleAiProposals],
  );
  const canAdvanceFromStep0 = Boolean(draft.title.trim() && draft.summary.trim() && draft.description.trim() && visiblePosterFields.length > 0);
  const canAdvanceFromStep1 =
    designSourceMode === "local"
      ? Boolean(selectedPreset && (draft.designTemplateId ?? generatedDesign.templateId))
      : Boolean((draft.posterArtDirection ?? "").trim() && visibleAiProposals.length > 0 && !aiStatus.loading);
  const canOpenReviewTabs = designWizardStep === 2;

  function applyEvent(event: VenueEventRecord | null) {
    setDraft(event ? normalizeDraftRecord(event) : emptyDraft);
    setPendingHeroPreview("");
    setPendingHeroFileName("");
    setPreviewScreen("preview");
    setDesignWizardStep(0);
    setMaxUnlockedWizardStep(0);
    setDesignSourceMode("local");
    setAiProposals([]);
    setSelectedAiProposalId(null);
    setAiStatus({ loading: false, error: "" });
  }

  function selectEvent(id: string) {
    setSelectedId(id);

    if (id === "new") {
      applyEvent(null);
      return;
    }

    const existing = safeEvents.find((event) => event.id === id) ?? null;
    applyEvent(existing);
  }

  function updateDraft<Key extends keyof VenueEventDraft>(key: Key, value: VenueEventDraft[Key]) {
    setDraft((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function toggleMotif(motifId: EventVisualMotifId) {
    setDraft((current) => {
      const currentMotifs = current.designMotifs ?? [];
      const nextMotifs = currentMotifs.includes(motifId)
        ? currentMotifs.filter((item) => item !== motifId)
        : [...currentMotifs, motifId].slice(0, 4);

      return {
        ...current,
        designMotifs: nextMotifs,
      };
    });
  }

  function togglePosterField(fieldId: PosterVisibleFieldId) {
    setDraft((current) => {
      const fields = current.posterVisibleFields?.length
        ? current.posterVisibleFields
        : posterFieldOptions.map((field) => field.id);
      const nextFields = fields.includes(fieldId)
        ? fields.filter((item) => item !== fieldId)
        : [...fields, fieldId];

      return {
        ...current,
        posterVisibleFields: nextFields,
      };
    });
  }

  function applyIdeaPreset(presetId: (typeof posterIdeaPresets)[number]["id"]) {
    const preset = posterIdeaPresets.find((item) => item.id === presetId) ?? posterIdeaPresets[0];
    setSelectedIdeaPreset(preset.id);
    setDraft((current) => ({
      ...current,
      designVariant: preset.localVariant,
      designTemplateId: preset.localTemplate,
      designMotifs: preset.motifs,
      posterArtDirection: preset.prompt,
    }));
    setPreviewScreen("preview");
  }

  async function generateAiPosterDirections() {
    const preset = posterIdeaPresets.find((item) => item.id === selectedIdeaPreset) ?? posterIdeaPresets[0];
    setAiStatus({ loading: true, error: "" });

    try {
      const response = await fetch("/api/poster-designer/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: draft.posterArtDirection?.trim() || preset.prompt,
          event_name: draft.title,
          lineup: draft.lineup,
          event_date: new Date(draft.startsAt).toLocaleString("es-MX", {
            dateStyle: "full",
            timeStyle: "short",
          }),
          venue: `${draft.venueName} · ${draft.venueAddress}`,
          purchase_link: `https://foro-gdl.local/events/${draft.slug || "preview"}`,
        }),
      });

      const payload = await response.json();

      if (!response.ok || !payload.ok) {
        throw new Error(payload.detail || "No fue posible generar propuestas IA.");
      }

      const proposals = (payload.proposals ?? []).slice(0, 3);
      setAiProposals(proposals);
      setSelectedAiProposalId(proposals[0]?.proposal_id ?? null);
      setPreviewScreen("preview");
      setDesignWizardStep(2);
      setMaxUnlockedWizardStep(2);
    } catch (error) {
      setAiStatus({
        loading: false,
        error: error instanceof Error ? error.message : "No fue posible generar propuestas IA.",
      });
      return;
    }

    setAiStatus({ loading: false, error: "" });
  }

  function handleHeroFileChange(event: ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0];

    if (pendingHeroPreview) {
      URL.revokeObjectURL(pendingHeroPreview);
    }

    if (!nextFile) {
      setPendingHeroPreview("");
      setPendingHeroFileName("");
      return;
    }

    setPendingHeroPreview(URL.createObjectURL(nextFile));
    setPendingHeroFileName(nextFile.name);
  }

  function resetDraftToSavedState() {
    applyEvent(selectedId === "new" ? null : safeEvents.find((event) => event.id === selectedId) ?? null);
  }

  function requestDeleteEvent() {
    if (!draft.id) {
      return;
    }

    const expectedPhrase = `BORRAR ${draft.title}`;
    const typed = window.prompt(
      `Esta acción no se puede deshacer.\n\nEscribe exactamente:\n${expectedPhrase}`,
      "",
    );

    if (typed === null) {
      return;
    }

    const normalized = typed.trim();
    setDeleteConfirmation(normalized);

    window.setTimeout(() => {
      const form = document.getElementById(deleteFormId) as HTMLFormElement | null;
      form?.requestSubmit();
    }, 0);
  }

  function applySelectedAiProposal() {
    if (!selectedAiProposal) {
      return;
    }

    updateDraft("posterArtDirection", selectedAiProposal.design_storytelling);
    updateDraft("posterReferenceUrls", [selectedAiProposal.poster_url]);
    updateDraft("posterAssetMode", "banana-pro");
  }

  function goToWizardStep(step: 0 | 1 | 2) {
    if (step > maxUnlockedWizardStep) {
      return;
    }

    if ((step === 1 || step === 2) && !canAdvanceFromStep0) {
      return;
    }

    if (step === 2 && !canAdvanceFromStep1) {
      return;
    }

    setDesignWizardStep(step);
    if (step === 2) {
      setPreviewScreen("preview");
    }
  }

  function goToNextWizardStep() {
    if (designWizardStep === 0 && !canAdvanceFromStep0) {
      return;
    }

    if (designWizardStep === 1 && !canAdvanceFromStep1) {
      return;
    }

    if (!isLastWizardStep) {
      const nextStep = (designWizardStep + 1) as 0 | 1 | 2;
      setMaxUnlockedWizardStep((current) => (current < nextStep ? nextStep : current));
      goToWizardStep((designWizardStep + 1) as 0 | 1 | 2);
    }
  }

  function goToPreviousWizardStep() {
    if (!isFirstWizardStep) {
      goToWizardStep((designWizardStep - 1) as 0 | 1 | 2);
    }
  }

  function isWizardStepLocked(stepId: 0 | 1 | 2) {
    if (stepId > maxUnlockedWizardStep) {
      return true;
    }

    if (stepId === 0) {
      return false;
    }

    if (stepId === 1) {
      return !canAdvanceFromStep0;
    }

    return !canAdvanceFromStep0 || !canAdvanceFromStep1;
  }

  const resolvedSlug = saveState.slug ?? draft.slug;
  const publicHref = resolvedSlug ? `/events/${resolvedSlug}` : "";

  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <header className={styles.hero}>
          <div>
            <p>Venue Console</p>
            <h1>Crea el evento y deja que el poster designer entregue la página lista al renderer.</h1>
            <span>
              Aquí el venue define contenido y operación. El sistema termina la dirección visual, la persiste como
              handoff y el sitio la traduce programáticamente cada vez que guardas un evento.
            </span>
          </div>
          <div className={styles.heroStats}>
            <article>
              <span>Eventos guardados</span>
              <strong>{safeEvents.length}</strong>
            </article>
            <article>
              <span>Designer states</span>
              <strong>Auto</strong>
            </article>
            <article>
              <span>Payout fee</span>
              <strong>1.5%</strong>
            </article>
          </div>
        </header>

        <section className={styles.workspaceLayout}>
          <aside className={styles.libraryPanel}>
            <div className={styles.panelHeader}>
              <p>Biblioteca</p>
              <h2>Eventos del venue</h2>
            </div>
            <button type="button" className={styles.createButton} onClick={() => selectEvent("new")}>
              Crear nuevo evento
            </button>
            <div className={styles.eventList}>
              {safeEvents.map((event) => (
                <button
                  key={event.id}
                  type="button"
                  className={selectedId === event.id ? styles.eventCardActive : styles.eventCard}
                  onClick={() => selectEvent(event.id)}
                >
                  <small className={styles.styleBadge}>{getEventInviteStyle(event.designVariant).shortLabel}</small>
                  <strong>{event.title}</strong>
                  <span>{new Date(event.startsAt).toLocaleString("es-MX", { dateStyle: "medium" })}</span>
                  <small>{event.isPublished ? "Publicado" : "Draft"}</small>
                </button>
              ))}
            </div>
          </aside>

          <div className={styles.editorColumn}>
            <form action={saveAction} className={styles.panel}>
              <div className={styles.panelHeader}>
                <p>Editor</p>
                <h2>{draft.id ? "Editar evento existente" : "Crear primer evento"}</h2>
              </div>

              <input type="hidden" name="id" value={draft.id} />
              <input type="hidden" name="slug" value={draft.slug} />
              <input type="hidden" name="heroImage" value={draft.heroImage} />
              <input type="hidden" name="designVariant" value={draft.designVariant ?? ""} />
              <input type="hidden" name="designMotifs" value={(draft.designMotifs ?? []).join(",")} />
              <input type="hidden" name="posterVisibleFields" value={visiblePosterFields.join(",")} />
              <input type="hidden" name="posterArtDirection" value={draft.posterArtDirection ?? ""} />
              <input type="hidden" name="posterReferenceUrls" value={(draft.posterReferenceUrls ?? []).join("\n")} />
              <input type="hidden" name="posterAssetMode" value={draft.posterAssetMode ?? "graphic-only"} />

              <div className={styles.formSections}>
                <details className={styles.formSection} open>
                  <summary>
                    <span className={styles.summaryLabel}>
                      <span className={styles.summaryIcon} aria-hidden="true">◫</span>
                      <span>Datos base del evento</span>
                    </span>
                  </summary>
                  <div className={styles.formGrid}>
                    <label className={styles.fullWidth}>
                      <span>Título</span>
                      <input name="title" value={draft.title} onChange={(event) => updateDraft("title", event.target.value)} />
                    </label>
                    <label className={styles.fullWidth}>
                      <span>Resumen corto</span>
                      <input name="summary" value={draft.summary} onChange={(event) => updateDraft("summary", event.target.value)} />
                    </label>
                    <label className={styles.fullWidth}>
                      <span>Descripción pública</span>
                      <textarea name="description" rows={5} value={draft.description} onChange={(event) => updateDraft("description", event.target.value)} />
                    </label>
                    <label>
                      <span>Venue</span>
                      <input name="venueName" value={draft.venueName} onChange={(event) => updateDraft("venueName", event.target.value)} />
                    </label>
                    <label>
                      <span>Timezone</span>
                      <input name="timezone" value={draft.timezone} onChange={(event) => updateDraft("timezone", event.target.value)} />
                    </label>
                    <label className={styles.fullWidth}>
                      <span>Dirección</span>
                      <input name="venueAddress" value={draft.venueAddress} onChange={(event) => updateDraft("venueAddress", event.target.value)} />
                    </label>
                    <label className={styles.fullWidth}>
                      <span>Lineup (separado por comas)</span>
                      <input name="lineup" value={draft.lineup.join(", ")} onChange={(event) => updateDraft("lineup", splitCommaList(event.target.value))} />
                    </label>
                    <label className={styles.fullWidth}>
                      <span>Géneros (separado por comas)</span>
                      <input name="genre" value={draft.genre.join(", ")} onChange={(event) => updateDraft("genre", splitCommaList(event.target.value))} />
                    </label>
                  </div>
                </details>

                <details className={styles.formSection}>
                  <summary>
                    <span className={styles.summaryLabel}>
                      <span className={styles.summaryIcon} aria-hidden="true">◷</span>
                      <span>Horario y operación</span>
                    </span>
                  </summary>
                  <div className={styles.formGrid}>
                    <label>
                      <span>Inicio</span>
                      <input type="datetime-local" name="startsAt" value={toDateTimeLocalValue(draft.startsAt)} onChange={(event) => updateDraft("startsAt", new Date(event.target.value).toISOString())} />
                    </label>
                    <label>
                      <span>Fin</span>
                      <input type="datetime-local" name="endsAt" value={toDateTimeLocalValue(draft.endsAt)} onChange={(event) => updateDraft("endsAt", new Date(event.target.value).toISOString())} />
                    </label>
                    <label>
                      <span>Doors</span>
                      <input type="datetime-local" name="doorTime" value={toDateTimeLocalValue(draft.doorTime)} onChange={(event) => updateDraft("doorTime", new Date(event.target.value).toISOString())} />
                    </label>
                    <label>
                      <span>Soundcheck</span>
                      <input type="datetime-local" name="soundcheckTime" value={toDateTimeLocalValue(draft.soundcheckTime)} onChange={(event) => updateDraft("soundcheckTime", new Date(event.target.value).toISOString())} />
                    </label>
                  </div>
                </details>

                <details className={`${styles.formSection} ${styles.revenueSection}`}>
                  <summary>
                    <span className={styles.summaryLabel}>
                      <span className={styles.summaryIcon} aria-hidden="true">¤</span>
                      <span>Ticketing y publicación</span>
                    </span>
                  </summary>
                  <div className={styles.formGrid}>
                    <label>
                      <span>Precio base</span>
                      <input type="number" name="ticketPriceMXN" value={draft.ticketPriceMXN} onChange={(event) => updateDraft("ticketPriceMXN", Number(event.target.value))} />
                    </label>
                    <label>
                      <span>Fee consumidor</span>
                      <input type="number" name="ticketFeeMXN" value={draft.ticketFeeMXN} onChange={(event) => updateDraft("ticketFeeMXN", Number(event.target.value))} />
                    </label>
                    <label>
                      <span>% payout artista</span>
                      <input type="number" min={0} max={1} step={0.01} name="artistPayoutRate" value={draft.artistPayoutRate} onChange={(event) => updateDraft("artistPayoutRate", Number(event.target.value))} />
                    </label>
                    <label>
                      <span>Capacidad</span>
                      <input type="number" name="capacity" value={draft.capacity} onChange={(event) => updateDraft("capacity", Number(event.target.value))} />
                    </label>
                    <label>
                      <span>Vendidos</span>
                      <input type="number" name="soldCount" value={draft.soldCount} onChange={(event) => updateDraft("soldCount", Number(event.target.value))} />
                    </label>
                    <label className={styles.publishToggle}>
                      <input type="checkbox" name="isPublished" checked={draft.isPublished} onChange={(event) => updateDraft("isPublished", event.target.checked)} />
                      <span>Publicar landing del evento</span>
                    </label>
                  </div>
                </details>

                <details
                  className={`${styles.formSection} ${styles.designSection} ${
                    designSourceMode === "ai" ? styles.designSectionAiMode : styles.designSectionLocalMode
                  }`}
                  open
                >
                  <summary>
                    <span className={styles.summaryLabel}>
                      <span className={styles.summaryIcon} aria-hidden="true">✦</span>
                      <span>Dirección visual</span>
                    </span>
                  </summary>
                  <div className={styles.wizardHeader}>
                    {wizardSteps.map((step) => (
                      <button
                        key={step.id}
                        type="button"
                        className={designWizardStep === step.id ? styles.wizardStepActive : styles.wizardStep}
                        onClick={() => goToWizardStep(step.id)}
                        disabled={isWizardStepLocked(step.id)}
                      >
                        <span>{step.eyebrow}</span>
                        <strong>{step.title}</strong>
                      </button>
                    ))}
                  </div>
                  <div className={styles.wizardStepTitle}>
                    <span>{stepMeta.eyebrow}</span>
                    <strong>{stepMeta.title}</strong>
                    <small>{designWizardStep + 1} de {wizardSteps.length}</small>
                  </div>

                  {designWizardStep === 0 ? (
                    <div className={styles.wizardSlide}>
                      <div className={styles.sectionHeading}>
                        <span>Pantalla 1</span>
                        <strong>Define el contenido base que el poster puede mostrar</strong>
                        <small>Desde aquí puedes editar datos y ocultar partes del evento para que no entren al poster.</small>
                      </div>
                      <div className={styles.wizardOverview}>
                        <article>
                          <span>Activos</span>
                          <strong>{visibleFieldCount} bloques</strong>
                        </article>
                        <article>
                          <span>Ocultos</span>
                          <strong>{hiddenFieldCount} bloques</strong>
                        </article>
                        <article>
                          <span>Qué hace esto</span>
                          <strong>Controla la información que puede aparecer en el poster</strong>
                        </article>
                      </div>
                      <div className={styles.formGrid}>
                        <label className={styles.fullWidth}>
                          <span>Título del evento</span>
                          <input value={draft.title} onChange={(event) => updateDraft("title", event.target.value)} />
                        </label>
                        <label className={styles.fullWidth}>
                          <span>Resumen para poster</span>
                          <input value={draft.summary} onChange={(event) => updateDraft("summary", event.target.value)} />
                        </label>
                        <label className={styles.fullWidth}>
                          <span>Descripción editorial</span>
                          <textarea rows={4} value={draft.description} onChange={(event) => updateDraft("description", event.target.value)} />
                        </label>
                      </div>
                      <div className={styles.selectionHint}>
                        <strong>Bloques del poster</strong>
                        <p>Haz click para encender o apagar cada bloque. Cuando está activo, ese dato sí puede entrar en el diseño del poster.</p>
                      </div>
                      <div className={styles.fieldToggleGrid}>
                        {posterFieldOptions.map((field) => {
                          const active = visiblePosterFields.includes(field.id);
                          return (
                            <button
                              key={field.id}
                              type="button"
                              className={active ? styles.fieldToggleActive : styles.fieldToggle}
                              onClick={() => togglePosterField(field.id)}
                              aria-pressed={active}
                            >
                              <span className={styles.toggleState}>{active ? "ON" : "OFF"}</span>
                              <strong>{field.label}</strong>
                              <small>{field.hint}</small>
                            </button>
                          );
                        })}
                      </div>
                      <div className={styles.wizardActions}>
                        <button type="button" className={styles.previewLink} disabled>
                          Atrás
                        </button>
                        <button type="button" className={styles.saveButton} onClick={goToNextWizardStep} disabled={!canAdvanceFromStep0}>
                          Siguiente
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {designWizardStep === 1 ? (
                    <div className={styles.wizardSlide}>
                      <div className={styles.sectionHeading}>
                        <span>Pantalla 2</span>
                        <strong>Escoge cómo generar la dirección visual del poster</strong>
                        <small>Local usa el sistema actual y da tres rutas; IA llama al diseñador externo y trae propuestas editoriales.</small>
                      </div>
                      <div className={styles.wizardOverview}>
                        <article>
                          <span>Modo</span>
                          <strong>{designSourceMode === "local" ? "Local" : "IA"}</strong>
                        </article>
                        <article>
                          <span>Ruta base</span>
                          <strong>{selectedPreset.title}</strong>
                        </article>
                        <article>
                          <span>Qué hace esto</span>
                          <strong>Define el lenguaje visual y de dónde salen las propuestas</strong>
                        </article>
                      </div>
                      <div className={styles.wizardPrompt}>
                        <strong>Pregunta guía</strong>
                        <p>¿Qué tipo de historia debería contar este poster y quién la va a producir?</p>
                      </div>
                      <div className={styles.sourceModeSwitch}>
                        <button type="button" className={designSourceMode === "local" ? styles.sourceModeActive : styles.sourceModeButton} onClick={() => setDesignSourceMode("local")}>
                          <span>Local</span>
                          <strong>3 opciones del sistema actual</strong>
                        </button>
                        <button type="button" className={designSourceMode === "ai" ? styles.sourceModeActive : styles.sourceModeButton} onClick={() => setDesignSourceMode("ai")}>
                          <span>IA</span>
                          <strong>Consulta al diseñador externo</strong>
                        </button>
                      </div>
                      <div className={styles.selectionHint}>
                        <strong>Idea general</strong>
                        <p>Selecciona una ruta estética. Esto sí cambia la variante base, el tono del poster y las opciones que luego podrás renderizar.</p>
                      </div>

                      <div className={styles.styleSelectorGrid}>
                        {posterIdeaPresets.map((preset) => {
                          const active = preset.id === selectedIdeaPreset;
                          return (
                            <button
                              key={preset.id}
                              type="button"
                              className={active ? styles.styleCardActive : styles.styleCard}
                              onClick={() => applyIdeaPreset(preset.id)}
                              aria-pressed={active}
                            >
                              <div>
                                <span className={styles.toggleState}>{active ? "ACTIVA" : "DISPONIBLE"}</span>
                                <strong>{preset.title}</strong>
                                <p>{preset.prompt}</p>
                                <small>{getEventInviteStyle(preset.localVariant).tone}</small>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      <div className={styles.formGrid}>
                        <label className={styles.fullWidth}>
                          <span>Brief creativo para el diseñador</span>
                          <textarea rows={4} value={draft.posterArtDirection ?? ""} onChange={(event) => updateDraft("posterArtDirection", event.target.value)} />
                        </label>
                      </div>

                      {designSourceMode === "local" ? (
                        <div className={styles.generatedBody}>
                          <p>El sistema local usa la variante elegida y te ofrece tres opciones listas para el renderer actual.</p>
                          <div className={styles.optionGrid}>
                            {designOptions.map((option) => {
                              const active = option.templateId === generatedDesign.templateId;
                              return (
                                <button
                                  key={option.templateId}
                                  type="button"
                                  className={active ? styles.optionCardActive : styles.optionCard}
                                  onClick={() => updateDraft("designTemplateId", option.templateId)}
                                >
                                  <strong>{templateLabelMap[option.templateId]}</strong>
                                  <span>{option.rendererId}</span>
                                  <small>{option.handoff.usesPhotography ? "Photo-enabled" : "Graphic-only"}</small>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className={styles.generatedBody}>
                          <div className={styles.formGrid}>
                            <label>
                              <span>Asset mode</span>
                              <select value={draft.posterAssetMode ?? "graphic-only"} onChange={(event) => updateDraft("posterAssetMode", event.target.value as VenueEventRecord["posterAssetMode"])}>
                                {assetModeOptions.map((option) => (
                                  <option key={option.id} value={option.id}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <label className={styles.fullWidth}>
                              <span>Referencias / URLs base (una por línea)</span>
                              <textarea rows={3} value={(draft.posterReferenceUrls ?? []).join("\n")} onChange={(event) => updateDraft("posterReferenceUrls", splitCommaList(event.target.value))} />
                            </label>
                          </div>
                          <div className={styles.wizardActions}>
                            <button type="button" className={styles.saveButton} onClick={generateAiPosterDirections} disabled={aiStatus.loading}>
                              {aiStatus.loading ? "Generando..." : "Generar propuestas IA"}
                            </button>
                          </div>
                          {aiStatus.loading ? (
                            <div className={styles.progressCard}>
                              <div className={styles.progressBarTrack}>
                                <div className={styles.progressBarFill} />
                              </div>
                              <small>Consultando al diseñador IA y construyendo propuestas editoriales...</small>
                            </div>
                          ) : null}
                          {aiStatus.error ? <p>{aiStatus.error}</p> : null}
                          {aiProposals.length > 0 ? (
                            <div className={styles.aiProposalGrid}>
                              {aiProposals.map((proposal) => (
                                <button
                                  key={proposal.proposal_id}
                                  type="button"
                                  className={styles.aiProposalCard}
                                  onClick={() => {
                                    updateDraft("posterArtDirection", proposal.design_storytelling);
                                    updateDraft("posterReferenceUrls", [proposal.poster_url]);
                                    updateDraft("posterAssetMode", "banana-pro");
                                  }}
                                >
                                  <strong>{proposal.style_title}</strong>
                                  <small>{proposal.design_storytelling}</small>
                                  <span>{proposal.poster_url}</span>
                                </button>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      )}

                      <div className={styles.wizardActions}>
                        <button type="button" className={styles.previewLink} onClick={goToPreviousWizardStep}>
                          Atrás
                        </button>
                        <button type="button" className={styles.saveButton} onClick={goToNextWizardStep} disabled={!canAdvanceFromStep1}>
                          Siguiente
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {designWizardStep === 2 ? (
                    <div className={styles.wizardSlide}>
                      <div className={styles.sectionHeading}>
                        <span>Pantalla 3</span>
                        <strong>Revisa el resultado y afina detalles visuales</strong>
                        <small>Compara el poster en desktop, tablet y mobile; luego termina de elegir detalles para publicación.</small>
                      </div>
                      <div className={styles.wizardOverview}>
                        <article>
                          <span>Template</span>
                          <strong>{templateLabelMap[generatedDesign.templateId]}</strong>
                        </article>
                        <article>
                          <span>Renderer</span>
                          <strong>{generatedDesign.rendererId}</strong>
                        </article>
                        <article>
                          <span>Viewports</span>
                          <strong>Desktop, tablet y mobile</strong>
                        </article>
                      </div>
                      <div className={styles.selectionHint}>
                        <strong>Motifs y detalles</strong>
                        <p>Estos acentos empujan el look final del poster, pero no cambian el contenido. Actívalos para sumar textura visual.</p>
                      </div>
                      <div className={styles.motifGrid}>
                        {eventVisualMotifs.map((motif) => {
                          const active = (draft.designMotifs ?? []).includes(motif.id);
                          return (
                            <label key={motif.id} className={active ? styles.motifToggleActive : styles.motifToggle}>
                              <input type="checkbox" checked={active} onChange={() => toggleMotif(motif.id)} />
                              <div>
                                <strong>{motif.label}</strong>
                                <p>{motif.description}</p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                      <div className={styles.generatedBody}>
                        <p>Si el poster todavía se siente saturado o pierde legibilidad en mobile, vuelve al paso anterior y cambia ruta, brief o asset mode antes de publicar.</p>
                      </div>
                      <div className={styles.wizardActions}>
                        <button type="button" className={styles.previewLink} onClick={goToPreviousWizardStep}>
                          Atrás
                        </button>
                        <button type="button" className={styles.saveButton} onClick={() => setPreviewScreen("preview")}>
                          Ver preview final
                        </button>
                      </div>
                    </div>
                  ) : null}
                </details>

                <details className={styles.formSection}>
                  <summary>
                    <span className={styles.summaryLabel}>
                      <span className={styles.summaryIcon} aria-hidden="true">⬒</span>
                      <span>Assets y handoff</span>
                    </span>
                  </summary>
                  <div className={styles.formGrid}>
                    <label>
                      <span>Template</span>
                      <select name="designTemplateId" value={draft.designTemplateId ?? ""} onChange={(event) => updateDraft("designTemplateId", (event.target.value || undefined) as PosterTemplateId | undefined)}>
                        <option value="">Auto</option>
                        {templateOptions.map((templateId) => (
                          <option key={templateId} value={templateId}>
                            {templateLabelMap[templateId]}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <span>Asset mode</span>
                      <select value={draft.posterAssetMode ?? "graphic-only"} onChange={(event) => updateDraft("posterAssetMode", event.target.value as VenueEventRecord["posterAssetMode"])}>
                        {assetModeOptions.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className={styles.fullWidth}>
                      <span>Hero image</span>
                      <input type="file" name="heroImageFile" accept="image/*" onChange={handleHeroFileChange} />
                    </label>
                  </div>
                  <div className={styles.assetStatusRow}>
                    <article>
                      <span>Actual</span>
                      <strong>{draft.heroImage.split("/").pop()?.split("?")[0] ?? "Sin imagen"}</strong>
                    </article>
                    <article>
                      <span>Pendiente</span>
                      <strong>{pendingHeroFileName || "Ningún archivo nuevo"}</strong>
                    </article>
                    <article>
                      <span>Asset mode</span>
                      <strong>{assetModeOptions.find((option) => option.id === (draft.posterAssetMode ?? "graphic-only"))?.label}</strong>
                    </article>
                  </div>
                  <div className={styles.motifGrid}>
                    {generatedDesign.handoff.developerNotes.map((note) => (
                      <article key={note} className={styles.motifToggleActive}>
                        <div>
                          <strong>{generatedDesign.rendererId}</strong>
                          <p>{note}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                </details>
              </div>

              <div className={styles.editorFooter}>
                <div>
                  <strong>
                    {saveState.message ||
                      deleteState.message ||
                      (hasUnsavedChanges
                        ? "Tienes cambios sin guardar en contenido, arte o asset sourcing."
                        : "Todo esta sincronizado con el último estado guardado.")}
                  </strong>
                </div>
                <div className={styles.editorActions}>
                  {draft.id ? (
                    <button
                      type="button"
                      className={styles.deleteButton}
                      onClick={requestDeleteEvent}
                      disabled={isDeleting || isSaving}
                    >
                      {isDeleting ? "Borrando..." : "Borrar evento"}
                    </button>
                  ) : null}
                  <button type="button" className={styles.previewLink} onClick={resetDraftToSavedState} disabled={!hasUnsavedChanges}>
                    Revertir cambios
                  </button>
                  {publicHref && draft.isPublished ? (
                    <Link href={publicHref} className={styles.previewLink}>
                      Ver sitio publicado
                    </Link>
                  ) : null}
                  <button type="submit" className={styles.saveButton} disabled={isSaving}>
                    {isSaving ? "Guardando..." : draft.isPublished ? "Guardar y publicar" : "Guardar draft"}
                  </button>
                </div>
                {draft.id && deleteState.ok === false && deleteState.message ? (
                  <small className={styles.deleteHint}>{deleteState.message}</small>
                ) : null}
              </div>
            </form>
            {draft.id ? (
              <form id={deleteFormId} action={deleteAction} className={styles.hiddenDeleteForm}>
                <input type="hidden" name="id" value={draft.id} />
                <input type="hidden" name="slug" value={draft.slug} />
                <input type="hidden" name="title" value={draft.title} />
                <input type="hidden" name="deleteConfirmation" value={deleteConfirmation} />
              </form>
            ) : null}

            <section className={styles.previewPanel}>
              <div className={styles.panelHeader}>
                <p>Preview</p>
                <h2>Preview lateral fijo del flujo y del poster</h2>
              </div>

              <div className={styles.previewToolbar}>
                <div className={styles.previewSwitch}>
                  <button type="button" className={previewScreen === "preview" ? styles.previewTabActive : styles.previewTab} onClick={() => setPreviewScreen("preview")}>
                    Preview
                  </button>
                  <button
                    type="button"
                    className={previewScreen === "story" ? styles.previewTabActive : styles.previewTab}
                    onClick={() => setPreviewScreen("story")}
                    disabled={!canOpenReviewTabs}
                  >
                    Story
                  </button>
                  <button
                    type="button"
                    className={previewScreen === "ticket" ? styles.previewTabActive : styles.previewTab}
                    onClick={() => setPreviewScreen("ticket")}
                    disabled={!canOpenReviewTabs}
                  >
                    Ticket
                  </button>
                </div>
              </div>

              <div className={styles.previewBody}>
                {previewScreen === "preview" ? (
                  designWizardStep === 0 ? (
                    <div className={styles.previewPlaceholder}>
                      <strong>El poster se desbloquea en el paso de dirección.</strong>
                      <p>Primero define el contenido del evento. Cuando avances al paso 2, aquí aparecerán las opciones del poster local o las propuestas generadas por IA.</p>
                    </div>
                  ) : designSourceMode === "ai" ? (
                    aiStatus.loading ? (
                      <div className={styles.previewPlaceholder}>
                        <strong>Generando propuestas IA...</strong>
                        <p>El diseñador externo está construyendo opciones editoriales. Cuando termine, verás aquí las 3 propuestas para compararlas y elegir una.</p>
                        <div className={styles.progressBarTrack}>
                          <div className={styles.progressBarFill} />
                        </div>
                      </div>
                    ) : visibleAiProposals.length === 0 ? (
                      <div className={styles.previewPlaceholder}>
                        <strong>Aún no hay posters IA cargados.</strong>
                        <p>Configura el brief y usa “Generar propuestas IA”. Después podrás alternar entre las 3 propuestas y decidir cuál aplicar.</p>
                      </div>
                    ) : (
                      <div className={styles.aiPreviewStage}>
                        <div className={styles.aiProposalSwitch}>
                          {visibleAiProposals.map((proposal, index) => {
                            const active = proposal.proposal_id === selectedAiProposal?.proposal_id;
                            return (
                              <button
                                key={proposal.proposal_id}
                                type="button"
                                className={active ? styles.previewTabActive : styles.previewTab}
                                onClick={() => setSelectedAiProposalId(proposal.proposal_id)}
                              >
                                Opción {index + 1}
                              </button>
                            );
                          })}
                        </div>
                        {selectedAiProposal ? (
                          <>
                            <div className={styles.aiPosterFrame}>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={selectedAiProposal.poster_url}
                                alt={selectedAiProposal.style_title}
                                className={styles.aiPosterImage}
                              />
                            </div>
                            <div className={styles.generatedBody}>
                              <strong>{selectedAiProposal.style_title}</strong>
                              <p>{selectedAiProposal.design_storytelling}</p>
                            </div>
                            <div className={styles.wizardActions}>
                              <button type="button" className={styles.saveButton} onClick={applySelectedAiProposal}>
                                Usar esta propuesta
                              </button>
                            </div>
                          </>
                        ) : null}
                      </div>
                    )
                  ) : (
                    <div className={styles.viewportPreviewGrid}>
                      {[
                        { label: "Desktop", width: "1120px", height: "720px", scale: 0.24 },
                        { label: "Tablet", width: "820px", height: "1024px", scale: 0.22 },
                        { label: "Mobile", width: "420px", height: "860px", scale: 0.32 },
                      ].map((viewport) => (
                        <article key={viewport.label} className={styles.viewportCard}>
                          <div className={styles.viewportCardHeader}>
                            <span>{viewport.label}</span>
                            <strong>
                              {viewport.width.replace("px", "")} × {viewport.height.replace("px", "")}
                            </strong>
                          </div>
                          <div
                            className={styles.viewportStage}
                            style={
                              {
                                "--preview-width": viewport.width,
                                "--preview-height": viewport.height,
                                "--preview-scale": String(viewport.scale),
                              } as CSSProperties
                            }
                          >
                            <div className={styles.viewportFrame}>
                              <div className={styles.livePosterCanvasViewport}>
                                {renderPosterPage(previewDraft, generatedDesign, previewRelatedEvents)}
                              </div>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  )
                ) : null}

                {previewScreen === "story" ? (
                  <>
                    <div className={styles.generatedMeta}>
                      <article>
                        <span>Variante</span>
                        <strong>{selectedStyle.label}</strong>
                      </article>
                      <article>
                        <span>Template</span>
                        <strong>{generatedDesign.templateId}</strong>
                      </article>
                      <article>
                        <span>Slug</span>
                        <strong>{resolvedSlug || "(se genera al guardar)"}</strong>
                      </article>
                      <article>
                        <span>Renderer</span>
                        <strong>{generatedDesign.rendererId}</strong>
                      </article>
                    </div>
                    <div className={styles.generatedBody}>
                      <p>{generatedDesign.narrative.manifesto}</p>
                      <div className={styles.generatedTags}>
                        {generatedDesign.motifs.map((motifId) => {
                          const motif = eventVisualMotifs.find((item) => item.id === motifId);
                          return <span key={motifId}>{motif?.label ?? motifId}</span>;
                        })}
                      </div>
                      <div className={styles.generatedTags}>
                        {generatedDesign.handoff.assetPlan.map((asset) => (
                          <span key={`${asset.sourceId}-${asset.role}`}>{asset.sourceId}: {asset.role}</span>
                        ))}
                      </div>
                      {aiProposals.length > 0 ? (
                        <div className={styles.aiPreviewLinks}>
                          {aiProposals.map((proposal) => (
                            <a key={proposal.proposal_id} href={proposal.poster_url} target="_blank" rel="noreferrer">
                              {proposal.style_title}
                            </a>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </>
                ) : null}

                {previewScreen === "ticket" ? (
                  <div className={styles.financePreview}>
                    <article>
                      <span>Info visible</span>
                      <strong>{visiblePosterFields.map((field) => posterFieldOptions.find((item) => item.id === field)?.label).filter(Boolean).join(", ")}</strong>
                    </article>
                    <article>
                      <span>Gross cobrado</span>
                      <strong>{formatMoney(financialModel.soldGross)}</strong>
                    </article>
                    <article>
                      <span>Fee plataforma</span>
                      <strong>{formatMoney(financialModel.platformFees)}</strong>
                    </article>
                    <article>
                      <span>Neto artista</span>
                      <strong>{formatMoney(financialModel.artistNet)}</strong>
                    </article>
                    <article>
                      <span>Neto venue</span>
                      <strong>{formatMoney(financialModel.venueNetBeforeProcessor)}</strong>
                    </article>
                  </div>
                ) : null}
              </div>
            </section>
          </div>
        </section>
      </section>
    </main>
  );
}
