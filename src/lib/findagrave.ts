import { FindAGraveResult } from "@/types";
import * as cheerio from "cheerio";

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept-Language": "en-US,en;q=0.9",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
};

async function fetchHtml(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { headers: HEADERS, cache: "force-cache" });
    if (!res.ok) return null;
    return res.text();
  } catch {
    return null;
  }
}

export async function searchFindAGrave(
  name: string,
  birthYear: number | null,
  deathYear: number | null
): Promise<FindAGraveResult> {
  const parts = name.trim().split(/\s+/);
  const firstname = encodeURIComponent(parts[0]);
  const lastname = encodeURIComponent(parts[parts.length - 1]);

  let searchUrl = `https://www.findagrave.com/memorial/search?firstname=${firstname}&lastname=${lastname}`;
  if (birthYear) searchUrl += `&birthyear=${birthYear}&birthyearfilter=5`;
  if (deathYear) searchUrl += `&deathyear=${deathYear}&deathyearfilter=5`;

  const searchHtml = await fetchHtml(searchUrl);
  if (!searchHtml) return { cause_of_death: null, resting_place: null, memorial_url: null };

  const $ = cheerio.load(searchHtml);

  // Find first memorial link
  let memorialPath: string | null = null;

  // Try multiple selectors for search results
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") ?? "";
    if (!memorialPath && /^\/memorial\/\d+/.test(href)) {
      memorialPath = href;
    }
  });

  if (!memorialPath) {
    return { cause_of_death: null, resting_place: null, memorial_url: null };
  }

  const memorialUrl = `https://www.findagrave.com${memorialPath}`;
  const memorialHtml = await fetchHtml(memorialUrl);
  if (!memorialHtml) return { cause_of_death: null, resting_place: null, memorial_url: memorialUrl };

  const $m = cheerio.load(memorialHtml);

  // Extract cause of death — look in bio section
  let cause_of_death: string | null = null;
  const bioSelectors = ["#fullBio", "#bio-section", ".memorial-bio", "[id*='bio']"];
  for (const sel of bioSelectors) {
    const text = $m(sel).text().trim();
    if (text) {
      // Try to find "cause of death" pattern
      const match = text.match(/(?:died|death|cause[:\s]+|passed away[^.]*?(?:from|of|due to)[^.]*?)([^.]{5,100})/i);
      if (match) {
        cause_of_death = match[0].trim().slice(0, 200);
      } else if (text.length > 10 && text.length < 500) {
        cause_of_death = text.slice(0, 300);
      }
      break;
    }
  }

  // Extract resting place — cemetery name and location
  let resting_place: string | null = null;
  const cemeterySelectors = [
    "#cemeteryName",
    ".cemetery-name",
    "[itemprop='addressLocality']",
    "a[href*='/cemetery/']",
    "#intermentLocation",
  ];
  for (const sel of cemeterySelectors) {
    const el = $m(sel).first();
    if (el.length) {
      const name = el.text().trim();
      if (name) {
        // Try to get location too
        const locationEl = $m("#cemeteryCity, #cemeteryLocation, .cemetery-location").first();
        const location = locationEl.text().trim();
        resting_place = location ? `${name}, ${location}` : name;
        break;
      }
    }
  }

  // Fallback: look for cemetery in page text
  if (!resting_place) {
    const pageText = $m("body").text();
    const cemeteryMatch = pageText.match(/(?:buried|interred|resting)(?:\s+at|\s+in)?\s+([A-Z][^,\n]{3,60}(?:Cemetery|Memorial|Graveyard|Mausoleum)[^,\n]{0,60})/i);
    if (cemeteryMatch) {
      resting_place = cemeteryMatch[1].trim().slice(0, 150);
    }
  }

  return {
    cause_of_death,
    resting_place,
    memorial_url: memorialUrl,
  };
}
