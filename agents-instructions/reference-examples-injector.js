// Reference Examples Injector (Function node)
// Add this before the Agent to provide high-quality exemplar trends.

console.log('📚 Injecting upgraded reference trend examples for agent guidance');

const referenceExamples = {
  generatedAt: "2025-08-16T09:40:00Z",
  trends: [
    {
      title: "Stores Become Programmable Media: Episodic Retail Replaces Static Merchandising",
      summary:
        "Driver: Retail media networks and game‑native shoppers normalise interactive spaces.\n" +
        "Tension: People want reasons to visit IRL, but gimmicky tech feels noisy without utility or story.\n" +
        "Behaviour: Shoppers treat stores like seasonal ‘content drops’—quests, unlocks, and watchable shopping.\n" +
        "Signal: (Westfield AR quests and rotating artist takeovers, Jun 2025)",
      category: "Creativity",
      tags: ["retail media", "AR quests", "programmable spaces", "episodic merchandising", "watchable shopping"],
      scores: { novelty: 72, velocity: 63, relevance: 84, confidence: 68, total: 72 },
      whyItMatters:
        "People now expect places to update like apps—fresh stories, unlockable perks, and social proof. ‘Going to the shops’ becomes a media habit, not just a purchase errand.",
      brandAngles: [
        "Season‑pass retail: quarterly ‘content seasons’ with unlockable perks tied to store missions.",
        "Questable shelves: product bays that trigger micro‑challenges for loyalty boosts.",
        "Watch‑to‑shop: scheduled live mini‑shows in‑store that also stream to remote audiences."
      ],
      exampleUseCases: [
        "A beauty chain runs a 6‑week ‘Skin Quest’; scanning endcaps unlocks routine badges and samples, with finishers earning a service credit at checkout.",
        "A sports retailer syncs drops to local match days; AR goal challenges in‑store unlock limited kits the same evening.",
        "A mall app hosts monthly ‘creator routes’—walk a path, watch three short demos, and auto‑load a curated cart for same‑day pickup."
      ],
      creative: {
        shortCardCopy: "Make stores bingeable: seasonal quests, unlocks, and watchable shopping.",
        imagePrompt:
          "3D wireframe island of a mall‑as‑platform: modular bays reconfigure like code blocks; floating AR markers, path glyphs, and a small stage. Thin glowing edges, geometric facets. Use your Creativity category colour. Subtle quest icons pulse along pathways.",
        altText: "Wireframe mall island with modular bays, AR markers, and quest paths indicating episodic retail.",
        podcastSnippet: "If stores are content, merch is a level and footfall is a fandom—how retail becomes programmable."
      },
      viz: { size: 15, intensity: 1.8, colorHint: "#FF4500" }
    },
    {
      title: "From Green Talk to Use‑Phase Value: Repair, Refill, Resale Become the Default",
      summary:
        "Driver: Cost‑of‑living and regulation push durability and transparency.\n" +
        "Tension: People want ‘better’ but can’t afford premiums; green without payback feels like a tax.\n" +
        "Behaviour: Consumers adopt repair credits, refills, and official resale as routine to extract more value from purchases.\n" +
        "Signal: (Multiple retailers expand product passports and take‑back programmes, Jul 2025)",
      category: "Sustainability",
      tags: ["repair economy", "refill", "brand resale", "product passports", "durability dividend"],
      scores: { novelty: 58, velocity: 69, relevance: 90, confidence: 78, total: 74 },
      whyItMatters:
        "Sustainability shifts from moral stance to money logic: people choose brands that make ownership cheaper, simpler, and longer‑lasting in daily life.",
      brandAngles: [
        "Durability dividend: show total‑cost‑of‑ownership and reward longer use with service credits.",
        "Official resale rails: brand‑run resale with instant authentication and carry‑over warranties.",
        "Repair‑as‑membership: tiered repair/refresh plans bundled at checkout."
      ],
      exampleUseCases: [
        "A furniture brand includes a 24‑month repair credit; customers book fixes in‑app and see parts availability tied to the item’s passport.",
        "A trainer label auto‑lists verified pairs to its own resale hub upon trade‑in; buyers inherit remaining care credits.",
        "A grocery chain’s refill aisle ties to loyalty: repeat refills unlock ‘ad‑light’ app mode and monthly staples discounts."
      ],
      creative: {
        shortCardCopy: "Value beats virtue: repair, refill, resale as everyday defaults.",
        imagePrompt:
          "3D wireframe island of a circular hub: three loops—repair benches, refill kiosks, authenticated resale nodes—connected by provenance lines. Use your Sustainability category colour; add subtle passport/QR glyphs.",
        altText: "Wireframe circular hub showing connected repair, refill, and resale nodes with provenance lines.",
        podcastSnippet: "When ‘green’ pays back in cash—why durability and resale are the new loyalty."
      },
      viz: { size: 18, intensity: 1.6, colorHint: "#228B22" }
    }
  ]
};

// Merge into the incoming JSON so prompts can read {{ $json.referenceExamples }}
const enrichedData = {
  ...$json,
  referenceExamples,
  recentTrends
};

console.log('✅ Reference examples injected successfully');
console.log('📊 Example trends available:', referenceExamples.trends.length);

return [{ json: enrichedData }];