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
  if (!searchHtml) return { cause_of_death: null, resting_place: null, bio: null, memorial_url: null };

  const $ = cheerio.load(searchHtml);

  // Find first memorial link
  let memorialPath: string | null = null;

  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") ?? "";
    if (!memorialPath && /^\/memorial\/\d+/.test(href)) {
      memorialPath = href;
    }
  });

  if (!memorialPath) {
    return { cause_of_death: null, resting_place: null, bio: null, memorial_url: null };
  }

  const memorialUrl = `https://www.findagrave.com${memorialPath}`;
  const memorialHtml = await fetchHtml(memorialUrl);
  if (!memorialHtml) return { cause_of_death: null, resting_place: null, bio: null, memorial_url: memorialUrl };

  const $m = cheerio.load(memorialHtml);

  // Extract full bio text
  let bio: string | null = null;
  const bioSelectors = ["#fullBio", "#bio-section", ".memorial-bio", "[id*='bio']"];
  for (const sel of bioSelectors) {
    const text = $m(sel).text().trim();
    if (text && text.length > 10) {
      bio = text.slice(0, 1000);
      break;
    }
  }

  // Extract cause of death from bio
  let cause_of_death: string | null = null;
  if (bio) {
    const match = bio.match(/(?:died|death|cause[:\s]+|passed away[^.]*?(?:from|of|due to)[^.]*?)([^.]{5,100})/i);
    if (match) {
      cause_of_death = match[0].trim().slice(0, 200);
    } else if (bio.length > 10 && bio.length < 500) {
      cause_of_death = bio.slice(0, 300);
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
      const cName = el.text().trim();
      if (cName) {
        const locationEl = $m("#cemeteryCity, #cemeteryLocation, .cemetery-location").first();
        const location = locationEl.text().trim();
        resting_place = location ? `${cName}, ${location}` : cName;
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
    bio,
    memorial_url: memorialUrl,
  };
}
