"use client";

import { useEffect, useState } from "react";
import {
  ArrowUp,
  ArrowDown,
  ArrowUpRight,
  Bell,
  Check,
  Copy,
  ChevronDown,
  Download,
  Globe2,
  Layers3,
  Search,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";

import styles from "./overview.module.css";

/*
 * =========================================================
 * COMPANY LOGOS
 * =========================================================
 */

const companies = [
  {
    name: "Rootcode",
    logo: "/company-logos/rootcode.png",
  },
  {
    name: "Ascentic",
    logo: "/company-logos/ascentic.png",
  },
  {
    name: "99x",
    logo: "/company-logos/99x.png",
  },
  {
    name: "IFS",
    logo: "/company-logos/ifs.png",
  },
  {
    name: "WSO2",
    logo: "/company-logos/wso2.png",
  },
  {
    name: "Sysco LABS",
    logo: "/company-logos/sysco-labs.png",
  },
  {
    name: "LSEG",
    logo: "/company-logos/lseg.png",
  },
  {
    name: "Millennium IT",
    logo: "/company-logos/millennium-it.png",
  },
  {
    name: "Dialog Axiata",
    logo: "/company-logos/dialog.png",
  },
  {
    name: "PickMe",
    logo: "/company-logos/pickme.png",
  },
  {
    name: "Surge Global",
    logo: "/company-logos/surge-global.png",
  },
  {
    name: "Creative Software",
    logo: "/company-logos/creative-software.png",
  },
  {
    name: "Zyner.io",
    logo: "/company-logos/zyner.png",
  },
  {
    name: "Zegates",
    logo: "/company-logos/zegates.png",
  },
  {
    name: "Flat Rock Technology",
    logo: "/company-logos/flat-rock.png",
  },
  {
    name: "Hype Invention",
    logo: "/company-logos/hype-invention.png",
  },
  {
    name: "Atlas Labs",
    logo: "/company-logos/atlas-labs.png",
  },
  {
    name: "Cryptoworth",
    logo: "/company-logos/cryptoworth.png",
  },
  {
    name: "Zone24x7",
    logo: "/company-logos/zone24x7.png",
  },
  {
    name: "Twist Digital",
    logo: "/company-logos/twist-digital.png",
  },
  {
    name: "Swivel Group",
    logo: "/company-logos/swivel-group.png",
  },
  {
    name: "Snapdrum",
    logo: "/company-logos/snapdrum.png",
  },
  {
    name: "CodeGen",
    logo: "/company-logos/codegen.png",
  },
  {
    name: "Pearson",
    logo: "/company-logos/pearson.png",
  },
  {
    name: "Fortude",
    logo: "/company-logos/fortude.png",
  },
  {
    name: "ZILLIONe",
    logo: "/company-logos/zillione.png",
  },
  {
    name: "Octave",
    logo: "/company-logos/octave.png",
  },
  
  {
    name: "HCLTech",
    logo: "/company-logos/hcltech.png",
  },
];

/*
 * =========================================================
 * JOB FIELDS
 * =========================================================
 */

const fields = [
  {
    number: "01",
    title: "Software Engineering",
    description:
      "Software development, web, mobile, backend, frontend and full-stack opportunities.",
    icon: Globe2,
  },
  {
    number: "02",
    title: "Data & AI / ML",
    description:
      "Data science, machine learning, artificial intelligence, analytics and related roles.",
    icon: Sparkles,
  },
  {
    number: "03",
    title: "Cloud & DevOps",
    description:
      "Cloud infrastructure, DevOps, SRE, platform engineering and automation roles.",
    icon: Layers3,
  },
  {
    number: "04",
    title: "Cybersecurity",
    description:
      "Security engineering, information security, SOC, penetration testing and related roles.",
    icon: Target,
  },
  {
    number: "05",
    title: "QA & Testing",
    description:
      "Quality assurance, automation testing, software testing and quality engineering roles.",
    icon: Check,
  },
  {
    number: "06",
    title: "UI/UX & Design",
    description:
      "UI design, UX design, product design, interaction design and research opportunities.",
    icon: Zap,
  },
  {
    number: "07",
    title: "Digital & Graphics",
    description:
      "Graphic design, video, digital content, creative and visual communication roles.",
    icon: Sparkles,
  },
  {
    number: "08",
    title: "Human Resource",
    description:
      "HR, recruitment, talent acquisition, people operations and related opportunities.",
    icon: Target,
  },
  {
    number: "09",
    title: "Product, Project & Business",
    description:
      "Product management, project management, business analysis and related roles.",
    icon: Layers3,
  },
];

/*
 * =========================================================
 * MAIN PAGE
 * =========================================================
 */

export default function OverviewPage() {
  const [installPrompt, setInstallPrompt] =
    useState(null);

  const [isMobile, setIsMobile] =
    useState(false);

  const [isInstalled, setIsInstalled] =
    useState(false);

  const [showIOSInstructions, setShowIOSInstructions] =
  useState(false);

const [showInstallUnavailable, setShowInstallUnavailable] =
  useState(false);

const [showDesktopInstall, setShowDesktopInstall] =
  useState(false);

const [copied, setCopied] =
  useState(false);

  const [showDesktopInstallMessage, setShowDesktopInstallMessage] =
  useState(false);

  const [linkCopied, setLinkCopied] =
    useState(false);

  useEffect(() => {
    /*
     * ---------------------------------------------------------
     * DETECT MOBILE DEVICE
     * ---------------------------------------------------------
     */

    const mobile =
      /Android|iPhone|iPad|iPod|Mobile/i.test(
        navigator.userAgent
      ) ||
      navigator.maxTouchPoints > 1;

    setIsMobile(mobile);

    /*
     * ---------------------------------------------------------
     * DETECT IF RUNNING AS AN INSTALLED APP
     * ---------------------------------------------------------
     */

    const checkInstalled = () => {
      const standalone =
        window.matchMedia(
          "(display-mode: standalone)"
        ).matches ||
        window.matchMedia(
          "(display-mode: fullscreen)"
        ).matches ||
        window.navigator.standalone === true;

      setIsInstalled(standalone);
    };

    checkInstalled();

    /*
     * ---------------------------------------------------------
     * CAPTURE NATIVE INSTALL PROMPT
     * ---------------------------------------------------------
     */

    function handleBeforeInstallPrompt(event) {
      console.log(
        "✅ beforeinstallprompt received"
      );

      /*
       * Prevent Chrome from showing the prompt
       * automatically.
       *
       * We will show it when the user clicks
       * our Install JobSeek button.
       */

      event.preventDefault();

      setInstallPrompt(event);

      setShowInstallUnavailable(false);
    }

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt
    );

    /*
     * ---------------------------------------------------------
     * DETECT SUCCESSFUL INSTALLATION
     * ---------------------------------------------------------
     */

    function handleAppInstalled() {
      console.log(
        "✅ JobSeek installed"
      );

      setIsInstalled(true);

      setInstallPrompt(null);

      setShowInstallUnavailable(false);
    }

    window.addEventListener(
      "appinstalled",
      handleAppInstalled
    );

    /*
     * ---------------------------------------------------------
     * CLEANUP
     * ---------------------------------------------------------
     */

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );

      window.removeEventListener(
        "appinstalled",
        handleAppInstalled
      );
    };
  }, []);

  /*
   * =========================================================
   * INSTALL JOBSEEK
   * =========================================================
   */

  async function handleInstall() {

      /*
    * ---------------------------------------------------------
    * DESKTOP
    * ---------------------------------------------------------
    */

    if (!isMobile) {
      setShowDesktopInstall(true);
      return;
    }
    
    /*
     * ---------------------------------------------------------
     * ALREADY INSTALLED
     * ---------------------------------------------------------
     */

    if (isInstalled) {
      return;
    }

    /*
     * ---------------------------------------------------------
     * iOS
     * ---------------------------------------------------------
     */

    const isIOS =
      /iPhone|iPad|iPod/i.test(
        navigator.userAgent
      );

    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }

    /*
     * ---------------------------------------------------------
     * ANDROID / CHROMIUM
     * ---------------------------------------------------------
     */

    if (installPrompt) {
      try {
        console.log(
          "📲 Opening native install prompt..."
        );

        installPrompt.prompt();

        const result =
          await installPrompt.userChoice;

        console.log(
          `📲 Install result: ${result.outcome}`
        );

        if (
          result.outcome === "accepted"
        ) {
          setIsInstalled(true);
        }

        /*
         * beforeinstallprompt can only be
         * used once.
         */

        setInstallPrompt(null);

        return;
      } catch (error) {
        console.error(
          "❌ Failed to open install prompt:",
          error
        );
      }
    }

    /*
     * ---------------------------------------------------------
     * INSTALL PROMPT NOT AVAILABLE
     * ---------------------------------------------------------
     */

    console.log(
      "⚠️ Native install prompt is not currently available."
    );

    setShowInstallUnavailable(true);
  }

  async function copyInstallUrl() {
      const url =
        "https://job-seek-henna.vercel.app/overview";

      try {
        await navigator.clipboard.writeText(url);

        setCopied(true);

        setTimeout(() => {
          setCopied(false);
        }, 2000);

      } catch (error) {
        console.error(
          "❌ Failed to copy URL:",
          error
        );
      }
    }

  /*
   * =========================================================
   * SCROLL
   * =========================================================
   */

  function scrollToSection(id) {
    const element =
      document.getElementById(id);

    if (!element) return;

    element.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <main className={styles.page}>

      {/* =====================================================
          NAVBAR
      ====================================================== */}

      <nav className={styles.navbar}>

        <button
          className={styles.brand}
          type="button"
          onClick={() =>
            scrollToSection("top")
          }
        >
          <img
            src="/JobSeek Black straight overview.png"
            alt="JobSeek"
          />
        </button>

        <div className={styles.navLinks}>

          <button
            onClick={() =>
              scrollToSection("how-it-works")
            }
          >
            How it works
          </button>

          <button
            onClick={() =>
              scrollToSection("fields")
            }
          >
            Fields
          </button>

          <button
            onClick={() =>
              scrollToSection("features")
            }
          >
            Features
          </button>

          <button
            onClick={() =>
              scrollToSection("companies")
            }
          >
            Companies
          </button>

        </div>

        
      </nav>


      {/* =====================================================
          HERO
      ====================================================== */}

      <section
        id="top"
        className={styles.hero}
      >

        <div className={styles.heroLogo}>
          <img
            src="/JobSeek Logo only - Black.png"
            alt="JobSeek"
          />
        </div>

        <h1 className={styles.heroTitle}>
          Your career search,
          <br />

          <span className={styles.highlightText}>
            simplified.
          </span>
        </h1>

        <p className={styles.heroDescription}>
          JobSeek brings relevant opportunities from
          companies across <br />Sri Lanka into one
          personalized place.
        </p>

        <div className={styles.heroActions}>

          <button
            className={`${styles.primaryButton} ${
              isInstalled
                ? styles.installInstalled
                : ""
            }`}
            onClick={handleInstall}
            disabled={isInstalled}
          >

            {isInstalled ? (
              <Check size={16} />
            ) : (
              <Download size={16} />
            )}

            {isInstalled
              ? "JobSeek Installed"
              : "Install JobSeek"}

          </button>

        </div>

        <div className={styles.heroCard}>

          <div className={styles.heroCardTop}>

            <div>
              <span className={styles.cardMiniLabel}>
                JOB ALERT
              </span>

              <h3>
                Machine Learning
                Intern
              </h3>
            </div>

            <span className={styles.liveDot} />

          </div>

          <div className={styles.heroCardCompany}>

            <div className={styles.miniLogo}>
              AI
            </div>

            <div>
              <strong>
                A company you follow
              </strong>

              <span>
                Colombo · Internship
              </span>
            </div>

          </div>

          <div className={styles.heroCardFooter}>

            <span>
              Matches your interests
            </span>

            <Check size={14} />

          </div>

        </div>

      </section>


      {/* =====================================================
          PROBLEM / SOLUTION
      ====================================================== */}

      <section className={styles.problemSection}>

        {/* =================================================
            THE PROBLEM
        ================================================== */}

        <div className={styles.problemCard}>

          <span className={styles.sectionTag}>
            THE PROBLEM
          </span>

          <h2>
            Keeping track on dozens of{" "}
            <span className={styles.highlight}>
              career pages
            </span>
          </h2>

          <p>
            Students and early-career professionals
            often have to check multiple company
            career pages every day just to keep up
            with new openings. A relevant opportunity
            can appear and disappear from your radar
            before you even know it exists.
          </p>

        </div>


        {/* =================================================
            THE SOLUTION
        ================================================== */}

        <div className={styles.solutionCard}>

          <span className={styles.sectionTag}>
            THE SOLUTION
          </span>

          <h2>
            Be the first to get notified{" "}

            <span className={styles.highlightPurple}>
              when opportunities open.
            </span>
          </h2>

          <p>
            JobSeek brings open vacancies from company
            career pages into one place. When a new job
            matches the fields you care about, JobSeek
            detects it and sends you an alert — so you
            can discover it as soon as it appears.
          </p>

        </div>

      </section>


      {/* =====================================================
          HOW IT WORKS
      ====================================================== */}

      <section
        id="how-it-works"
        className={styles.section}
      >

        

        <div className={styles.steps}>

          <Step
            number="01"
            icon={<Search />}
            title="Choose your fields"
            text="Tell JobSeek what areas you're interested in. You can select multiple fields."
          />

          <Step
            number="02"
            icon={<Layers3 />}
            title="We organize opportunities"
            text="Job opportunities are collected and organized into a single, easy-to-use platform."
          />

          <Step
            number="03"
            icon={<Bell />}
            title="Get relevant alerts"
            text="When opportunities match your selected fields, JobSeek brings them to your attention."
          />

          <Step
            number="04"
            icon={<ArrowUpRight />}
            title="Apply directly"
            text="Open the original company listing and apply directly through the company's career process."
          />

        </div>

      </section>


      {/* =====================================================
          FIELDS
      ====================================================== */}

      <section
        id="fields"
        className={styles.section}
      >

        <div className={styles.sectionHeader}>

          <div>


            <h2>
              Nine fields.
              <br />

              <span className={styles.highlight}>
                One JobSeek.
              </span>
            </h2>

          </div>

        </div>

        <div className={styles.fieldGrid}>

          {fields.map((field) => {

            const Icon = field.icon;

            return (
              <div
                key={field.number}
                className={styles.fieldCard}
              >

                <div className={styles.fieldTop}>

                  <span>
                    {field.number}
                  </span>

                </div>

                <h3>
                  {field.title}
                </h3>

                <p>
                  {field.description}
                </p>

                <span className={styles.fieldArrow}>
                  <ArrowUpRight size={15} />
                </span>

              </div>
            );
          })}

        </div>

      </section>


      {/* =====================================================
          COMPANIES
      ====================================================== */}

      <section
        id="companies"
        className={styles.companySection}
      >

        <div className={styles.companyHeader}>

          <div>

            <span className={styles.sectionTag}>
              COMPANY DIRECTORY
            </span>

            <h2>
              Companies we keep{" "}
              <br></br>
              <span className={styles.highlight}>
                track of.
              </span>
            </h2>

          </div>

        </div>

        <div className={styles.companyGrid}>

          {companies.map((company) => (

            <div
              key={company.name}
              className={styles.companyLogoCard}
            >

              <img
                src={company.logo}
                alt={`${company.name} logo`}
                loading="lazy"
              />

              <span>
                {company.name}
              </span>

            </div>

          ))}

        </div>

      </section>


      {/* =====================================================
          FINAL CTA
      ====================================================== */}

      <section className={styles.finalSection}>

        <div className={styles.finalGlow} />

        <h2>
          Let us do the searching.
          <br />

          <span className={styles.finalHighlight}>
            You do the applying.
          </span>
        </h2>

        <p>
          Personalize your fields. Discover relevant
          opportunities. Apply when you're ready.
        </p>

        {isMobile && (
          <button
            className={`${styles.finalButton} ${
              isInstalled
                ? styles.installInstalled
                : ""
            }`}
            onClick={handleInstall}
            disabled={isInstalled}
          >
            {isInstalled ? (
              <Check size={17} />
            ) : (
              <Download size={17} />
            )}

            {isInstalled
              ? "JobSeek Installed"
              : "Install JobSeek"}
          </button>
        )}

      </section>


      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer className={styles.footer}>

        <button
          onClick={() =>
            scrollToSection("top")
          }
        >
          <ArrowUp size={15} />
          Back to top
        </button>

      </footer>


      {/* =====================================================
          INSTALL UNAVAILABLE
      ====================================================== */}

      {showInstallUnavailable && (

        <div className={styles.installUnavailable}>

          <div
            className={
              styles.installUnavailableContent
            }
          >

            <button
              className={
                styles.installUnavailableClose
              }
              onClick={() =>
                setShowInstallUnavailable(false)
              }
              aria-label="Close"
            >
              ×
            </button>

            <div
              className={
                styles.installUnavailableIcon
              }
            >
              <Download size={20} />
            </div>

            <h3>
              Install JobSeek
            </h3>

            <p>
              JobSeek cannot open the native install
              prompt right now.
            </p>

            <p>
              Please refresh the page and try again.
            </p>

          </div>

        </div>
      )}

      {/* =====================================================
              DESKTOP INSTALL MODAL
          ====================================================== */}

          {showDesktopInstall && (

            <div
              className={styles.modalBackdrop}
              onClick={() =>
                setShowDesktopInstall(false)
              }
            >

              <div
                className={styles.desktopInstallModal}
                onClick={(event) =>
                  event.stopPropagation()
                }
              >

                <button
                  className={styles.modalClose}
                  onClick={() =>
                    setShowDesktopInstall(false)
                  }
                  aria-label="Close"
                >
                  ×
                </button>

                <div className={styles.desktopInstallIcon}>
                  <Download size={20} />
                </div>

                <span className={styles.desktopInstallTag}>
                  MOBILE ONLY
                </span>

                <h3>
                  JobSeek is designed for mobile.
                </h3>

                <p>
                  Open this page on your phone to
                  install JobSeek and get your
                  personalized job alerts now.
                </p>

                <div className={styles.mobileUrlBox}>

                  <span>
                    https://job-seek-henna.vercel.app/overview
                  </span>

                  <button
                    type="button"
                    onClick={copyInstallUrl}
                    aria-label="Copy JobSeek URL"
                    className={
                      styles.copyUrlButton
                    }
                  >

                    {copied ? (
                      <Check size={17} />
                    ) : (
                      <Copy size={17} />
                    )}

                  </button>

                </div>

                <span
                  className={`${styles.copyStatus} ${
                    copied
                      ? styles.copyStatusVisible
                      : ""
                  }`}
                >
                  {copied
                    ? "Link copied"
                    : "Open this link on your phone"}
                </span>

              </div>

            </div>

          )}


      {/* =====================================================
          IOS INSTALL MODAL
      ====================================================== */}

      {showIOSInstructions && (

        <div
          className={styles.modalBackdrop}
          onClick={() =>
            setShowIOSInstructions(false)
          }
        >

          <div
            className={styles.installModal}
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <button
              className={styles.modalClose}
              onClick={() =>
                setShowIOSInstructions(false)
              }
              aria-label="Close"
            >
              ×
            </button>

            <div className={styles.modalIcon}>
              <Download size={20} />
            </div>

            <h3>
              Install JobSeek
            </h3>

            <p>
              Add JobSeek to your Home Screen
              for quick access.
            </p>

            <div className={styles.iosSteps}>

              <div>
                <span>1</span>

                <p>
                  Tap the{" "}
                  <strong>Share</strong>{" "}
                  button in Safari.
                </p>
              </div>

              <div>
                <span>2</span>

                <p>
                  Select{" "}
                  <strong>
                    Add to Home Screen
                  </strong>.
                </p>
              </div>

              <div>
                <span>3</span>

                <p>
                  Tap <strong>Add</strong>.
                </p>
              </div>

            </div>

          </div>

        </div>
      )}

    </main>
  );
}


/*
 * =========================================================
 * STEP COMPONENT
 * =========================================================
 */

function Step({
  number,
  icon,
  title,
  text,
}) {
  return (
    <div className={styles.step}>

      <div className={styles.stepTop}>

        <span className={styles.stepNumber}>
          {number}
        </span>

        <div className={styles.stepIcon}>
          {icon}
        </div>

      </div>

      <h3>
        {title}
      </h3>

      <p>
        {text}
      </p>

    </div>
  );
}


/*
 * =========================================================
 * FEATURE CARD
 * =========================================================
 */

function FeatureCard({
  number,
  icon,
  title,
  text,
  large,
}) {
  return (
    <div
      className={`${styles.featureCard} ${
        large
          ? styles.featureCardLarge
          : ""
      }`}
    >

      <div className={styles.featureTop}>

        <span>
          {number}
        </span>

        <div className={styles.featureIcon}>
          {icon}
        </div>

      </div>

      <div className={styles.featureContent}>

        <h3>
          {title}
        </h3>

        <p>
          {text}
        </p>

      </div>

      <ArrowUpRight
        className={styles.featureArrow}
        size={17}
      />

    </div>
  );
}