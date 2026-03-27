interface WikiResult {
  cause_of_death: string | null;
  resting_place: string | null;
  wikipedia_url: string | null;
}

const API = "https://en.wikipedia.org/w/api.php";

function cleanWikitext(raw: string): string {
  // Remove [[ ]] links, keeping display text
  let s = raw.replace(/\[\[(?:[^\]|]*\|)?([^\]]*)\]\]/g, "$1");
  // Remove {{ }} templates except simple ones
  s = s.replace(/\{\{[^}]*\}\}/g, "");
  // Remove HTML tags
  s = s.replace(/<[^>]+>/g, "");
  // Remove refs
  s = s.replace(/\{\{refn[^}]*\}\}/gi, "");
  // Collapse whitespace
  s = s.replace(/\s+/g, " ").trim();
  return s;
}

function extractInfoboxField(wikitext: string, ...fieldNames: string[]): string | null {
  for (const name of fieldNames) {
    // Match | field_name = value (possibly multi-line until next | or }})
    const pattern = new RegExp(
      `\\|\\s*${name}\\s*=\\s*([^|}{\\n][^|}{]*?)(?=\\n\\s*\\||\\n\\s*\\}\\}|$)`,
      "im"
    );
    const match = wikitext.match(pattern);
    if (match) {
      const cleaned = cleanWikitext(match[1]).trim();
      if (cleaned.length > 0) return cleaned;
    }
  }
  return null;
}

function extractFromLeadText(text: string): {
  cause: string | null;
  resting: string | null;
} {
  let cause: string | null = null;
  let resting: string | null = null;

  // Cause of death patterns
  const causePatterns = [
    /died (?:of|from) ([^.]{3,120})/i,
    /cause of death (?:was|:)\s*([^.]{3,120})/i,
    /passed away (?:from|due to|of) ([^.]{3,120})/i,
    /(?:succumbed|succumbing) to ([^.]{3,100})/i,
    /death was (?:caused|attributed|due) (?:by|to) ([^.]{3,120})/i,
  ];
  for (const p of causePatterns) {
    const m = text.match(p);
    if (m) {
      cause = m[1].trim().replace(/\.$/, "");
      break;
    }
  }

  // Resting place patterns
  const restingPatterns = [
    /(?:buried|interred|entombed|laid to rest) (?:at|in) ([A-Z][^.]{3,100})/i,
    /(?:remains|ashes) (?:were|are) (?:buried|interred|scattered) (?:at|in) ([A-Z][^.]{3,100})/i,
  ];
  for (const p of restingPatterns) {
    const m = text.match(p);
    if (m) {
      resting = m[1].trim().replace(/\.$/, "");
      break;
    }
  }

  return { cause, resting };
}

export async function searchWikipedia(name: string): Promise<WikiResult> {
  const empty: WikiResult = { cause_of_death: null, resting_place: null, wikipedia_url: null };

  try {
    // Step 1: Search for the person
    const searchUrl = `${API}?action=query&list=search&srsearch=${encodeURIComponent(
      name + " actor"
    )}&srlimit=3&format=json&origin=*`;
    const searchRes = await fetch(searchUrl, { next: { revalidate: 86400 } });
    if (!searchRes.ok) return empty;
    const searchData = await searchRes.json();
    const results = searchData?.query?.search;
    if (!results || results.length === 0) return empty;

    // Find best match — prefer exact name match in title
    const nameLower = name.toLowerCase();
    const best =
      results.find((r: { title: string }) => r.title.toLowerCase() === nameLower) ??
      results.find((r: { title: string }) => r.title.toLowerCase().includes(nameLower)) ??
      results[0];

    const pageId = best.pageid;
    const pageTitle = best.title;
    const wikipedia_url = `https://en.wikipedia.org/wiki/${encodeURIComponent(pageTitle.replace(/ /g, "_"))}`;

    // Step 2: Get wikitext to parse infobox
    const parseUrl = `${API}?action=parse&pageid=${pageId}&prop=wikitext&format=json&origin=*`;
    const parseRes = await fetch(parseUrl, { next: { revalidate: 86400 } });
    if (!parseRes.ok) return { ...empty, wikipedia_url };
    const parseData = await parseRes.json();
    const wikitext: string = parseData?.parse?.wikitext?.["*"] ?? "";

    // Extract from infobox
    let cause_of_death = extractInfoboxField(
      wikitext,
      "death_cause",
      "cause_of_death",
      "deathcause"
    );
    let resting_place = extractInfoboxField(
      wikitext,
      "resting_place",
      "restingplace",
      "burial_place",
      "resting place",
      "burialplace"
    );

    // Step 3: If infobox didn't have it, try extracting from lead text
    if (!cause_of_death || !resting_place) {
      // Get plain text extract
      const extractUrl = `${API}?action=query&pageids=${pageId}&prop=extracts&exintro=true&explaintext=true&format=json&origin=*`;
      const extractRes = await fetch(extractUrl, { next: { revalidate: 86400 } });
      if (extractRes.ok) {
        const extractData = await extractRes.json();
        const pages = extractData?.query?.pages;
        const text = pages?.[String(pageId)]?.extract ?? "";
        const fromText = extractFromLeadText(text);
        if (!cause_of_death) cause_of_death = fromText.cause;
        if (!resting_place) resting_place = fromText.resting;
      }
    }

    return {
      cause_of_death: cause_of_death?.slice(0, 300) ?? null,
      resting_place: resting_place?.slice(0, 200) ?? null,
      wikipedia_url,
    };
  } catch (err) {
    console.error("Wikipedia lookup error:", err);
    return empty;
  }
}
