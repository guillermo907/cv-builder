"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import styles from "./login-panel.module.scss";

type LoginPanelProps = {
  callbackUrl: string;
  checkEmail: boolean;
  emailLoginEnabled: boolean;
};

export function LoginPanel({ callbackUrl, checkEmail, emailLoginEnabled }: LoginPanelProps) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <main className={styles.shell}>
      <section className={styles.card}>
        <p className={styles.kicker}>Admin access</p>
        <h1>Studio control room</h1>
        <p>
          Sign in with the same clean SSO flow: Google for instant access, or email for a secure
          magic link.
        </p>

        {checkEmail ? <div className={styles.notice}>Check your inbox for the magic link.</div> : null}

        <button
          className={styles.google}
          type="button"
          onClick={() => signIn("google", { callbackUrl })}
        >
          Continue with Google
        </button>

        {emailLoginEnabled ? (
          <>
            <div className={styles.divider}>or</div>

            <form
              className={styles.form}
              onSubmit={async (event) => {
                event.preventDefault();
                setBusy(true);
                await signIn("nodemailer", { email, callbackUrl });
                setBusy(false);
              }}
            >
              <label htmlFor="email">Email magic link</label>
              <input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
              <button type="submit" disabled={busy}>
                {busy ? "Sending..." : "Send login link"}
              </button>
            </form>
          </>
        ) : null}
      </section>
    </main>
  );
}
