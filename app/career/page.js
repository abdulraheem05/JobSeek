"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Globe } from "lucide-react";

import { supabase } from "../../../lib/supabase";
import DesktopMessage from "../components/DesktopMessage/DesktopMessage";
import AppHeader from "../components/AppHeader/AppHeader";

import {
  CACHE_TTL,
  getCareerCache,
  isCacheFresh,
  setCareerCache,
} from "../../lib/cache/appCache";

import styles from "./career.module.css";

const careerPages = {
  Rootcode: "https://rootcode.ai/careers",
  Ascentic: "https://career.ascentic.se",
  "99x": "https://99x.io/careers/open-positions",
  IFS: "https://www.ifs.com/careers",
  WSO2: "https://wso2.com/careers",
  "Sysco LABS": "https://syscolabs.lk/careers",
  LSEG: "https://www.lseg.com/en/careers",
  "Millenium IT": "https://www.mitesp.com/careers/",
  "Dialog Axiata": "https://dialog.lk/careers",

  "Surge Global": "https://surge.global/careers",
  "Creative Software":
    "https://www.creativesoftware.com/careers",
  "Zyner.io": "https://zyner.io/careers",
  "Zegates International Private Limited":
    "https://zegates.com/careers",
  "Flat Rock Technology":
    "https://flatrocktech.com/careers",
  "Hype Invention":
    "https://hypeinvention.com/careers",
  "Atlas Labs":
    "https://atlaslabs.io/careers",
  "Cryptoworth Corporation":
    "https://cryptoworth.com/careers",
  "Twist Digital":
    "https://twistdigital.com/careers",
  "Swivel Group":
    "https://swivelgroup.com/careers",
  Snapdrum:
    "https://snapdrum.com/careers",
  CodeGen:
    "https://www.codegen.co/careers",
  "Zone 24 x 7":
    "https://zone24x7.com/careers",
  Pearson:
    "https://pearson.jobs/",
  Fortude:
    "https://fortude.co/careers",
  ZILLIONe:
    "https://www.zillione.com/careers",
  Octave:
    "https://www.octave.lk/our-careers/",
  PickMe:
    "https://pickme.lk/careers/",
  HCLTech:
    "https://careers.hcltech.com/",
};

export default function CareerPage() {
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Email currently shown in the copy confirmation
  const [copiedEmail, setCopiedEmail] = useState("");

  useEffect(() => {
    let active = true;

    async function loadCompanies() {
      const cached = getCareerCache();

      if (cached) {
        setCompanies(cached.companies || []);
        setLoading(false);

        if (!isCacheFresh(cached, CACHE_TTL.career)) {
          refreshCompanies();
        }

        return;
      }

      await refreshCompanies();
    }

    async function refreshCompanies() {
      const { data, error } = await supabase
        .from("companies")
        .select(
          "id, name, logo_url, career_email"
        )
        .order("name", {
          ascending: true,
        });

      if (!active) return;

      if (error) {
        console.error(
          "Failed to load companies:",
          error
        );

        setLoading(false);
        return;
      }

      const companyData = data || [];

      setCompanies(companyData);
      setCareerCache(companyData);
      setLoading(false);
    }

    loadCompanies();

    return () => {
      active = false;
    };
  }, []);

  const filteredCompanies = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    if (!query) {
      return companies;
    }

    return companies.filter((company) =>
      company.name
        .toLowerCase()
        .includes(query)
    );
  }, [companies, search]);

  function getInitials(name) {
    if (!name) return "?";

    const words = name
      .trim()
      .split(/\s+/);

    if (words.length === 1) {
      return words[0]
        .slice(0, 2)
        .toUpperCase();
    }

    return words
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  }

  function openCareerPage(company) {
    const url =
      careerPages[company.name];

    if (!url) return;

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  }

  async function copyCareerEmail(company) {
    if (!company.career_email) return;

    try {
      await navigator.clipboard.writeText(
        company.career_email
      );

      setCopiedEmail(
        company.career_email
      );

      // Remove the notification after 2.2 seconds.
      setTimeout(() => {
        setCopiedEmail("");
      }, 2200);
    } catch (error) {
      console.error(
        "Failed to copy email:",
        error
      );
    }
  }

  return (
    <main className={styles.page}>
      <AppHeader />

      <div className={styles.app}>
        <section className={styles.content}>

          <header className={styles.header}>
            <h1>Company Directory</h1>

            <p className={styles.description}>
              Explore career opportunities
              directly from companies tracked
              by JobSeek.
            </p>
          </header>

          <div
            className={
              styles.searchWrapper
            }
          >
            <Search
              size={18}
              strokeWidth={2}
              className={
                styles.searchIcon
              }
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search companies"
              aria-label="Search companies"
            />

            {search && (
              <button
                type="button"
                className={
                  styles.clearButton
                }
                onClick={() =>
                  setSearch("")
                }
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          <div
            className={
              styles.companyList
            }
          >
            {loading ? (
              <div
                className={
                  styles.emptyState
                }
              >
                Loading companies...
              </div>
            ) : filteredCompanies.length ===
              0 ? (
              <div
                className={
                  styles.emptyState
                }
              >
                No companies found.
              </div>
            ) : (
              filteredCompanies.map(
                (company) => {
                  const careerUrl =
                    careerPages[
                      company.name
                    ];

                  const hasEmail =
                    Boolean(
                      company.career_email
                    );

                  return (
                    <div
                      key={company.id}
                      className={
                        styles.careerCompany
                      }
                    >
                      {/* Logo */}
                      <div
                        className={
                          styles.careerLogo
                        }
                      >
                        {company.logo_url ? (
                          <img
                            src={
                              company.logo_url
                            }
                            alt=""
                          />
                        ) : (
                          <span>
                            {getInitials(
                              company.name
                            )}
                          </span>
                        )}
                      </div>

                      {/* Company name */}
                      <div
                        className={
                          styles.careerInfo
                        }
                      >
                        <strong>
                          {company.name}
                        </strong>
                      </div>

                      {/* Actions */}
                      <div
                        className={
                          styles.actions
                        }
                      >
                        {/* Career page */}
                        {careerUrl && (
                          <button
                            type="button"
                            className={
                              styles.iconButton
                            }
                            onClick={() =>
                              openCareerPage(
                                company
                              )
                            }
                            aria-label={`Open ${company.name} career page`}
                            title="Career page"
                          >
                            <Globe
                              size={18}
                              strokeWidth={2}
                            />
                          </button>
                        )}

                        {/* Copy career email */}
                        {hasEmail && (
                          <button
                            type="button"
                            className={
                              styles.iconButton
                            }
                            onClick={() =>
                              copyCareerEmail(
                                company
                              )
                            }
                            aria-label={`Copy ${company.name} career email`}
                            title={
                              company.career_email
                            }
                          >
                            <img
                              src="/icons/gmail.png"
                              alt=""
                              className={
                                styles.gmailIcon
                              }
                            />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                }
              )
            )}
          </div>
        </section>
      </div>

      <DesktopMessage />

      {/* =====================================================
          COPY CONFIRMATION
      ===================================================== */}
      {copiedEmail && (
        <div
          className={
            styles.copyToast
          }
          role="status"
          aria-live="polite"
        >
          <span
            className={
              styles.copyToastIcon
            }
          >
            ✓
          </span>

          <span>
            {copiedEmail} copied
          </span>
        </div>
      )}
      
    </main>
  );
}