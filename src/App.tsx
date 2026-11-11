import { useCallback, useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { siteContent, type Memory, type Stage } from "./content";
import { Icon } from "./components/Icons";
import { HeartArtwork, HeartConfetti, NightSky, Reveal } from "./components/Decorations";
import { Lightbox } from "./components/Lightbox";
import { isSpecialDate, normalizeDate } from "./utils/date";

const content = siteContent;

function MemoryCard({
  photo,
  index,
  onOpen,
}: {
  photo: Memory;
  index: number;
  onOpen: (photo: Memory) => void;
}) {
  const [failed, setFailed] = useState(false);
  const hasPhoto = Boolean(photo.src) && !failed;
  const text = content.momentsScreen;

  const inner = (
    <>
      <div className="photo-window">
        {hasPhoto ? (
          <img
            src={photo.src}
            alt={photo.alt}
            loading="lazy"
            decoding="async"
            onError={() => setFailed(true)}
          />
        ) : (
          <div className="empty-photo">
            <span className="empty-photo-icon">
              <Icon name="image" size={32} />
            </span>
            <span className="empty-photo-title">
              {failed ? text.imageLoadError : text.emptyTitle}
            </span>
            <span className="empty-photo-description">
              {text.emptyDescription}
            </span>
            <span className="empty-photo-star">✧</span>
          </div>
        )}

        {hasPhoto && (
          <span className="photo-zoom-hint">
            <Icon name="image" size={17} />
          </span>
        )}
      </div>

      <div className="polaroid-caption">
        {photo.caption ? (
          <span>{photo.caption}</span>
        ) : !hasPhoto ? (
          <>
            <Icon name="heart" size={12} />
            <span>{text.emptyCaption}</span>
          </>
        ) : (
          <span>{photo.title}</span>
        )}
      </div>
    </>
  );

  const className = `polaroid ${hasPhoto ? "polaroid--filled" : "polaroid--empty"}`;

  return (
    <Reveal className="polaroid-reveal" delay={index * 90}>
      {hasPhoto ? (
        <button
          type="button"
          className={className}
          onClick={() => onOpen(photo)}
          aria-label={`${text.zoomLabel}: ${photo.title}`}
          style={
            {
              "--tilt": `${[-2, 1.5, 1.5, -1.5][index % 4]}deg`,
            } as CSSProperties
          }
        >
          {inner}
        </button>
      ) : (
        <article
          className={className}
          aria-label={photo.alt}
          style={
            {
              "--tilt": `${[-2, 1.5, 1.5, -1.5][index % 4]}deg`,
            } as CSSProperties
          }
        >
          {inner}
        </article>
      )}
    </Reveal>
  );
}

export default function App() {
  const [stage, setStage] = useState<Stage>("date");
  const [answer, setAnswer] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState("");
  const [shakeCount, setShakeCount] = useState(0);
  const [selectedPhoto, setSelectedPhoto] = useState<Memory | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const hasNavigated = useRef(false);

  const closeLightbox = useCallback(() => setSelectedPhoto(null), []);
  const openLightbox = useCallback((photo: Memory) => setSelectedPhoto(photo), []);

  const storyVisible = stage === "memories" || stage === "letter";

  useEffect(() => {
    if (!hasNavigated.current) return;

    const frame = requestAnimationFrame(() => {
      mainRef.current
        ?.querySelector<HTMLElement>("[data-screen-heading]")
        ?.focus({ preventScroll: true });
    });

    return () => cancelAnimationFrame(frame);
  }, [stage]);

  const scrollToTop = () =>
    window.scrollTo({ top: 0, behavior: "instant" });

  const resetStory = () => {
    hasNavigated.current = true;
    setStage("date");
    setAnswer("");
    setAttempts(0);
    setError("");
    setShakeCount(0);
    setSelectedPhoto(null);
    scrollToTop();
  };

  const showMemories = () => {
    if (stage === "date") return;

    hasNavigated.current = true;
    setStage("memories");
    setSelectedPhoto(null);
    scrollToTop();
  };

  const showLetter = () => {
    if (stage === "date" || stage === "heart") return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    document
      .getElementById("happy-message")
      ?.scrollIntoView({
        behavior: reduced ? "instant" : "smooth",
        block: "start",
      });
  };

  const submitDate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalized = normalizeDate(answer);

    if (!normalized) {
      setError(content.errors.empty);
      setShakeCount((count) => count + 1);
      inputRef.current?.focus();
      return;
    }

    if (!isSpecialDate(normalized, content.specialDate)) {
      const nextAttempt = attempts + 1;
      setAttempts(nextAttempt);
      setError(
        nextAttempt === 1
          ? content.errors.firstWrong
          : content.errors.secondWrong
      );
      setShakeCount((count) => count + 1);
      inputRef.current?.focus();
      return;
    }

    hasNavigated.current = true;
    setError("");
    setAnswer("");
    setStage("heart");
    scrollToTop();
  };

  return (
    <div className="luna-app" dir="rtl">
      <NightSky />

      <a className="skip-link" href="#main-content">
        انتقال للحكاية
      </a>

      <main
        id="main-content"
        ref={mainRef}
        tabIndex={-1}
        className="page-shell main-content"
        key={
          stage === "date"
            ? "date"
            : stage === "heart"
              ? "heart"
              : "story"
        }
      >
        {stage === "date" && (
          <div className="date-stage page-enter">
            <section className="date-copy" aria-labelledby="date-title">
              <div className="eyebrow">
                <Icon name="sparkles" size={15} />
                <span>{content.dateScreen.eyebrow}</span>
              </div>

              <h1
                id="date-title"
                data-screen-heading
                tabIndex={-1}
                className="date-title"
                aria-label={`${content.dateScreen.titleFirstLine} ${content.dateScreen.titleSecondLine}`}
              >
                <span>{content.dateScreen.titleFirstLine}</span>
                <span className="gradient-text">
                  {content.dateScreen.titleSecondLine}
                </span>
              </h1>

              <p className="hero-description">
                {content.dateScreen.description}
              </p>

              <form className="date-form" onSubmit={submitDate} noValidate>
                <div className="field-label-row">
                  <label htmlFor="special-date">
                    {content.dateScreen.label}
                  </label>
                  <span className="format-hint">
                    {content.dateScreen.formatHint}
                  </span>
                </div>

                <div
                  className={`date-input-wrap ${
                    shakeCount
                      ? shakeCount % 2
                        ? "shake-a"
                        : "shake-b"
                      : ""
                  }`}
                >
                  <Icon
                    name="calendar"
                    size={21}
                    className="input-icon"
                  />
                  <input
                    ref={inputRef}
                    id="special-date"
                    name="date"
                    type="text"
                    inputMode="text"
                    enterKeyHint="go"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    maxLength={80}
                    dir="auto"
                    placeholder={content.dateScreen.placeholder}
                    value={answer}
                    onChange={(event) => {
                      setAnswer(event.target.value);
                      if (error) setError("");
                    }}
                    aria-invalid={Boolean(error)}
                    aria-describedby="date-hints date-feedback"
                  />
                </div>

                <div className="input-hints" id="date-hints">
                  <span>{content.dateScreen.yearHint}</span>
                  <span dir="ltr">DD / MM</span>
                </div>

                <button className="primary-button" type="submit">
                  <span>{content.dateScreen.button}</span>
                  <Icon name="sparkles" size={20} />
                </button>

                <div
                  className="form-feedback"
                  id="date-feedback"
                  role="status"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {error ? (
                    <span className="error-message">{error}</span>
                  ) : (
                    <span className="reassurance">
                      {content.dateScreen.reassurance}
                    </span>
                  )}
                </div>
              </form>

              <p className="date-privacy">
                <Icon name="lock" size={12} />
                <span>{content.dateScreen.privacy}</span>
              </p>
            </section>
          </div>
        )}

        {stage === "heart" && (
          <section className="heart-stage page-enter" aria-labelledby="heart-title">
            <HeartConfetti />

            <div className="heart-visual">
              <HeartArtwork />
            </div>

            <div className="eyebrow">
              <Icon name="sparkles" size={15} />
              <span>{content.heartScreen.eyebrow}</span>
            </div>

            <h1 id="heart-title" data-screen-heading tabIndex={-1}>
              {content.heartScreen.title}
            </h1>

            <p className="heart-description">
              {content.heartScreen.description}
            </p>

            <div className="welcome-card">
              <span className="welcome-heart">
                <Icon name="heart" size={18} />
              </span>

              <p className="welcome-message">{content.firstMessage}</p>

              <button
                type="button"
                className="primary-button"
                onClick={showMemories}
              >
                <span>{content.heartScreen.button}</span>
                <Icon name="heart" size={19} />
              </button>
            </div>

            <p className="heart-quote">
              <span>✧</span>
              {content.heartScreen.quote}
              <span>✧</span>
            </p>
          </section>
        )}

        {storyVisible && (
          <div className="story-page page-enter">
            <h1 className="sr-only">حكاية ليكي</h1>

            <section
              id="our-moments"
              className="moments-section"
              aria-labelledby="moments-title"
            >
              <Reveal className="section-heading">
                <div className="eyebrow">
                  <Icon name="sparkles" size={15} />
                  <span>{content.momentsScreen.eyebrow}</span>
                </div>

                <h2 id="moments-title" data-screen-heading tabIndex={-1}>
                  {content.momentsScreen.title}
                  <span className="heading-emoji">📸</span>
                </h2>

                <p>{content.momentsScreen.description}</p>
              </Reveal>

              <div className="memory-grid">
                {content.photos.map((photo, index) => (
                  <MemoryCard
                    key={`${index}-${photo.src}`}
                    photo={photo}
                    index={index}
                    onOpen={openLightbox}
                  />
                ))}
              </div>

              <Reveal className="story-transition">
                <p>{content.momentsScreen.transitionNote}</p>
                <button
                  type="button"
                  className="text-button"
                  onClick={showLetter}
                >
                  {content.momentsScreen.continueLabel}
                  <Icon name="arrow-down" size={17} />
                </button>
              </Reveal>
            </section>

            <section
              id="happy-message"
              className="letter-section"
              aria-labelledby="letter-title"
            >
              <Reveal className="section-heading">
                <div className="eyebrow">
                  <Icon name="heart" size={14} />
                  <span>{content.letterScreen.eyebrow}</span>
                </div>

                <h2 id="letter-title">
                  <span className="english-title" dir="ltr">
                    {content.letterScreen.title}
                  </span>
                  <span className="heading-emoji">💌</span>
                </h2>

                <p>{content.letterScreen.description}</p>
              </Reveal>

              <Reveal className="letter-reveal" delay={100}>
                <div className="letter-card">
                  <svg
                    className="envelope-lines"
                    viewBox="0 0 720 180"
                    preserveAspectRatio="none"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path d="M0 0 360 180 720 0" />
                    <path
                      d="M0 0 360 155 720 0"
                      strokeOpacity=".35"
                    />
                  </svg>

                  <span className="letter-corner letter-corner--moon">
                    <Icon name="moon" size={95} />
                  </span>

                  <span className="letter-corner letter-corner--heart">
                    <Icon name="heart" size={65} />
                  </span>

                  <div className="letter-content">
                    <span className="letter-stamp">
                      <Icon name="moon" size={24} />
                      <span>✦</span>
                    </span>

                    <p className="letter-greeting">
                      {content.letterScreen.greeting}
                    </p>

                    <p className="happy-message">
                      {content.happyMessage}
                    </p>

                    <p className="letter-signature">
                      {content.letterScreen.signature}
                      <Icon name="heart" size={15} />
                    </p>
                  </div>
                </div>
              </Reveal>

              <Reveal className="letter-end">
                <p className="letter-postscript">
                  {content.letterScreen.postscript}
                </p>

                <button
                  type="button"
                  className="return-button"
                  onClick={resetStory}
                >
                  <span>{content.letterScreen.returnButton}</span>
                  <Icon name="arrow-left" size={17} />
                </button>
              </Reveal>
            </section>
          </div>
        )}
      </main>

      <footer className="site-footer page-shell">
        <p className="footer-love">
          <Icon name="heart" size={13} />
          <span>{content.footer.madeWithLove}</span>
        </p>

        <p className="footer-note">
          <span>✧</span>
          {content.footer.note}
          <span>✧</span>
        </p>

        <p className="footer-privacy">{content.footer.privacy}</p>
      </footer>

      {selectedPhoto && (
        <Lightbox
          key={selectedPhoto.src}
          photo={selectedPhoto}
          onClose={closeLightbox}
        />
      )}
    </div>
  );
}