import { Link, useNavigate } from "react-router-dom";
import "./PaperChooser.css";

export interface PaperCard {
  id: string;
  title: string;
  subtitle: string;
  summary: string;
  /** In-app route (uses <Link>) or external/static href (uses <a>). */
  to: string;
  external?: boolean;
  accent: "k1" | "k2" | "k3" | "k4";
}

interface PaperChooserProps {
  title: string;
  intro: string;
  papers: PaperCard[];
  backTo?: string;
  backLabel?: string;
}

export default function PaperChooser({
  title,
  intro,
  papers,
  backTo = "/",
  backLabel = "board",
}: PaperChooserProps) {
  const navigate = useNavigate();

  return (
    <div className="chooser-root">
      <button className="chooser-home-btn" onClick={() => navigate(backTo)}>
        ← {backLabel}
      </button>

      <header className="chooser-header">
        <h1>{title}</h1>
        <p className="chooser-sub">{intro}</p>
      </header>

      <div className="chooser-cards">
        {papers.map((p) =>
          p.external ? (
            <a key={p.id} className="chooser-card" href={p.to} data-accent={p.accent}>
              <h2>{p.title}</h2>
              <p className="chooser-card-subtitle">{p.subtitle}</p>
              <p className="chooser-card-summary">{p.summary}</p>
              <span className="chooser-card-link">Open →</span>
            </a>
          ) : (
            <Link key={p.id} className="chooser-card" to={p.to} data-accent={p.accent}>
              <h2>{p.title}</h2>
              <p className="chooser-card-subtitle">{p.subtitle}</p>
              <p className="chooser-card-summary">{p.summary}</p>
              <span className="chooser-card-link">Open →</span>
            </Link>
          )
        )}
      </div>
    </div>
  );
}
