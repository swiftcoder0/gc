# GOTHAM COLLAGE: SPEC (v2)
Gotham Collage (GC) is a new student-led venture studio. Website concept: a dark, cinematic, futuristic secret headquarters. Flow: THE PORTAL, then THE GOTHAM ELEVATOR (replaces the menu), then THE STORY, then THE FINAL SCREEN. If any earlier prompt conflicts with this file, this file wins.

LOOK
- Base: black (#0b0b0b), charcoal, white and metallic silver. ONE accent: ice cyan (#8FE8FF) with a soft cyan glow (rgba(143,232,255,0.45)). No other colors, no gradients other than glows, no cards, no crowded layouts.
- Ice cyan is used sparingly (under 10% of any screen) and only for: thin vertical light strips, one arc of the portal rings, button outlines and their glow, small uppercase eyebrow labels, the word "HERE." in the hero headline, the selected floor button, the "Learn More" link, and the light ring around Project 001 and the final cube. Everything else stays white/silver/black.
- Lighting is the star: glowing rings, thin light paths, reflective black floors, soft fog. Match the mood and layout of the mockup in /reference.
- Typography: wide geometric uppercase display font for headings (Unbounded or Syncopate from Google Fonts), clean sans (Inter) for body. Text off-white (#e8e8e6), never pure white on big areas. Small labels are uppercase with letter spacing.
- Logo: the real file in /reference (silver/white G with a smaller G inside). Use as is, never redraw it.

COPY (use exactly)
- Brand spelling: "Gotham Collage" (never "College").
- Top nav: Projects / The Elevator / About / Join Now, plus an outline button "Enter Portal" at the top right (it jumps to the portal fly-through). Nav stays as it is.
- Hero headline: line 1 "Don't wait." (Unbounded weight 200, #bdbdb8, large, letter-spacing 0.04em) and line 2 "BUILD." (Unbounded weight 700, #e8e8e6, same or slightly bigger size, soft gold glow text-shadow rgba(245,184,0,0.45)).
- Hero label: GOTHAM COLLAGE · STUDENT-LED VENTURE STUDIO (Inter 500, uppercase, 11-12px, letter-spacing 0.35em, grey, below the headline).
- Hero button: Enter → (gold outline style and glow, smaller).
- Hero constraints: Max 12 words visible in the hero. Sub line, "WELCOME TO GOTHAM COLLAGE" label, and "Scroll Down" hint removed. Positioned lower-centre over the path leading to the portal, preserving full visibility of portal rings and logo.
- Elevator lobby: eyebrow THE ELEVATOR. Floor panel shows buttons with labels beside them: 04 Vision, 03 Project 001, 02 Method, 01 Who we are. Selected floor highlighted with 1px border and faint tint.
- Floor 01: label WHO WE ARE. Headline: "We're people who build." Lines (one at a time): "Investors kept asking: 'Where's your team?'" / "So we became one." / "Gotham Collage is a student-led venture studio."
- Floor 02: label THE METHOD. Three large words, each with one line: BUILD "Real projects, made together." / IDENTIFY "We spot who's ready to lead." / CREATE "Strong projects become startups, with equity partnerships." Hover or tap highlights one at a time. Closing line: "We don't teach entrepreneurship. We build it."
- Floor 03: label PROJECT ARCHIVE. Headline "PROJECT 001". Pill "STATUS: IN DEVELOPMENT". Line: "Something is being built. You'll see it here first." Link "Learn More →" opens a small panel: "Status: in development. Details will be shared when we launch." Add no other details.
- Floor 04: label OUR VISION. Headline "Students shouldn't have to wait to build." Line: "FROM STUDENTS TO BUILDERS. FROM BUILDERS TO FOUNDERS." Button "Join The Movement →".
- Story section: four lines, each on its own full-height screen as you scroll, centred, large:
  1) "We started small."
  2) "A few minds. One rule: build, don't just talk."
  3) "When a project shows promise, we back the people behind it."
  4) "We're not an investment fund or a VC firm. We're builders."
- Final screen: headline "THE FUTURE IS BUILT, NOT WAITED FOR." and button "Join The Movement →".
- Style rules for all content screens: No paragraphs. Tiny uppercase label in accent colour (Inter 500, 11-12px, letter spacing 0.35em), one headline (Unbounded, mixing weight 200 and 700, max 8 words), then short lines. Lines fade in one after another (0.5s each, slight upward move, 0.25s stagger). Highlight the key word with the accent glow only. Respect prefers-reduced-motion. Max 30 words visible on any floor.
- Footer: logo + GOTHAM COLLAGE on the left; centre text: Building Projects. Creating Founders. Launching Startups. Right: social icons.

SOCIAL ICONS
Show an icon only if its URL is set in config. Only LinkedIn has a URL now (https://www.linkedin.com/company/gotham-collage). X, YouTube and Discord stay hidden until I add real URLs. Never link to a fake or placeholder page.

HARD RULES
- Never call GC a VC firm or investment fund. Never promise funding, returns or outcomes.
- No equity percentages anywhere.
- No invented team members, testimonials, user counts, partners, project details or other companies' logos.
- "Join Now" and "Join The Movement" link to the LinkedIn URL in config. Colors, fonts and all URLs live in one config file; do not change them without asking me.
- Respect prefers-reduced-motion. Must work on phones with a lighter effects mode. All text is real HTML.
