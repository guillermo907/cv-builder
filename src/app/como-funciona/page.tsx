import type { Metadata } from "next";
import Link from "next/link";
import styles from "./page.module.scss";

export const metadata: Metadata = {
  title: "Cómo funciona | Foro GDL",
  description:
    "Explicación completa del flujo de operación, ticketing, pagos, liquidaciones y roles dentro de Foro GDL."
};

const stages = [
  {
    step: "1",
    title: "El venue configura el show",
    body:
      "El operador define nombre del evento, fecha, doors, soundcheck, capacidad total, precio base y porcentaje de payout para la banda.",
    bullets: ["Branding del venue", "Timeline operativo", "Capacidad e inventario"]
  },
  {
    step: "2",
    title: "Se publica una landing transaccional",
    body:
      "El sistema genera una página pública optimizada para móvil, con SEO, Open Graph y un checkout ligero para redes inestables.",
    bullets: ["Landing pública", "Cache local", "Google Event indexing"]
  },
  {
    step: "3",
    title: "El fan compra y recibe ticket seguro",
    body:
      "Cada compra añade el cargo fijo de $15 MXN, valida idempotencia para evitar doble cobro y genera ticket con hash para QR.",
    bullets: ["Idempotency key", "Protección anti doble cargo", "QR seguro"]
  },
  {
    step: "4",
    title: "El sistema liquida y documenta",
    body:
      "Después del cobro, el ledger guarda bruto pagado, fee de plataforma, fee del procesador, neto del venue y neto del artista.",
    bullets: ["Split payouts", "Ledger inmutable", "Trazabilidad por evento"]
  }
];

const roles = [
  {
    title: "Admin / Venue",
    description:
      "Controla analytics, programación, precios, aforo, branding, estados del evento y la lógica de settlement."
  },
  {
    title: "Artist",
    description:
      "Carga rider técnico, ve su payout estimado, confirma datos bancarios y recibe contexto del show sin entrar al panel completo."
  },
  {
    title: "Customer",
    description:
      "Navega una vista móvil muy ligera, compra rápido, recibe ticket con QR y puede abrir la landing incluso con señal limitada."
  }
];

const safeguards = [
  "Atomicidad en checkout para no vender boletos por encima del inventario.",
  "Idempotency key persistida para evitar doble cargo en conexiones lentas.",
  "Split transaction con fee al consumidor y fee automatizado de payout al artista.",
  "Sincronización opcional con Google Calendar para fechas confirmadas."
];

export default function HowItWorksPage() {
  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <header className={styles.hero}>
          <p>Cómo funciona</p>
          <h1>Foro GDL no es solo una landing: es una cadena operativa completa.</h1>
          <span>
            Desde la creación del evento hasta la liquidación final, el sistema conecta venue, artista,
            audiencia y contabilidad en un solo flujo.
          </span>
          <div className={styles.actions}>
            <Link href="/venue" className={styles.primary}>
              Abrir consola del venue
            </Link>
            <Link href="/" className={styles.secondary}>
              Volver al overview
            </Link>
          </div>
        </header>

        <section className={styles.section}>
          <div className={styles.sectionHeading}>
            <p>Flujo principal</p>
            <h2>Lo que hace el sistema paso por paso</h2>
          </div>
          <div className={styles.stageGrid}>
            {stages.map((stage) => (
              <article key={stage.step} className={styles.stageCard}>
                <span>{stage.step}</span>
                <h3>{stage.title}</h3>
                <p>{stage.body}</p>
                <ul>
                  {stage.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.dualGrid}>
          <article className={styles.card}>
            <p>Roles</p>
            <h2>Interfaz distinta según quién entra</h2>
            <div className={styles.roleStack}>
              {roles.map((role) => (
                <div key={role.title} className={styles.roleItem}>
                  <strong>{role.title}</strong>
                  <span>{role.description}</span>
                </div>
              ))}
            </div>
          </article>

          <article className={styles.card}>
            <p>Monetización</p>
            <h2>Cómo gana dinero la plataforma</h2>
            <div className={styles.moneyBox}>
              <div>
                <span>Al público</span>
                <strong>$15 MXN por boleto</strong>
              </div>
              <div>
                <span>Al payout automatizado</span>
                <strong>1.5% sobre neto de artista</strong>
              </div>
              <div>
                <span>Al venue</span>
                <strong>Sin suscripción base</strong>
              </div>
            </div>
          </article>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeading}>
            <p>Seguridad operativa</p>
            <h2>Protecciones clave que sostienen el sistema</h2>
          </div>
          <div className={styles.safeguardList}>
            {safeguards.map((item) => (
              <article key={item} className={styles.safeguardCard}>
                {item}
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
