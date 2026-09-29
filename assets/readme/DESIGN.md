# README art direction

Audience: DeepSeek Harness users who want to discover and manage agent skills.
One-sentence value: Browse two marketplaces, read skill instructions, and manage local installations in one Harness panel.
Primary proof: An actual Skills Hub catalogue screenshot in the published 0.2.0-rc.2 host.
First successful action: Install the plugin, restart Harness, and open Skills Hub.
Visual theme: SKILL.md documents collected in a cobalt desktop dock.

Palette: #F5F7FB background / #12233D foreground / #4176E6 primary / white material / slate metadata.
Typography: clear sans serif; large product name, one supporting line; body copy remains Markdown.
Shape: folded document corners, softly rounded dock, generous margins.
Motif: skill document → local library.
Composition: calm 3D product illustration; no simulated interface or motion.

## Selection

Three candidates were generated with the built-in image_gen tool (no CLI). Candidate A combined two source stacks with a dock; it was rejected because the extra source marks and arrows were too busy at README width. Candidate B uses three clear modules and was selected for the English README. Candidate C uses the same material language with a Chinese value line and was selected for the default Chinese README. Images are conceptual illustrations, not screenshots.

- hero-zh.png: candidate C, original generated PNG, no visual postprocessing.
- hero-en.png: candidate B, original generated PNG, no visual postprocessing.
- marketplace.png: actual host screenshot, separate from the generated illustrations.

## Prompts

### Candidate A — rejected

Use case: stylized-concept
Asset type: wide GitHub README hero for Skills Hub, a DeepSeek Harness plugin that browses ClawHub and SkillHub, previews SKILL.md, and installs/manages local skills.
Primary request: polished 3D editorial product illustration, landscape banner about 2.4:1.
Scene: seamless soft ivory-white studio backdrop.
Subject: a beautifully crafted cobalt-blue open modular organizer receiving three upright white rounded skill-document cards. One large white card is embossed "SKILL.md" with tiny abstract markdown lines, another card bears a simple code bracket glyph, a third a small check mark. Subtle two incoming card stacks suggest two skill registries converging in one local library. Physical connected product objects, coherent perspective, not a fake app screenshot.
Composition: typography occupies the left 43% with generous breathing room; 3D objects on the right 57%, all objects fully in frame. Main title in large dark navy clean sans serif, exact text "Skills Hub". Small context line exact text "FOR DEEPSEEK HARNESS". Small supporting line exact text "Discover. Preview. Install." No other text.
Materials: matte porcelain white, satin cobalt blue, tiny brushed-aluminum details. Soft contact shadows, gentle realistic ambient occlusion, high-end 3D product render, restrained.
Palette: ivory #F5F7FB, ink #12233D, cobalt #4176E6, subtle ice blue.
Avoid: robots, brains, mascots, neon, glass overload, floating random cubes, excessive decorations, watermarks, illegible tiny lettering. Make the project-specific skill documents the unmistakable centerpiece.

### Candidate B — English

Use case: stylized-concept
Asset type: wide GitHub README hero for Skills Hub, a DeepSeek Harness skill marketplace and local skills manager.
Primary request: premium sculptural 3D illustration, landscape banner about 2.4:1, a different concept based on a skill library.
Scene: calm light blue-white studio cyclorama.
Subject: a compact isometric blue-and-white desktop skill library made of three gently staggered standing document modules on a shallow rounded platform. The foremost large white module has a folded upper corner and exact title "SKILL.md", visibly textured paper-like ceramic; one inset blue module shows code brackets, one a simple check symbol. A single small cobalt download arrow is integrated into the base as a physical embossed feature. Clearly a curated library of installable agent instructions, not a shopping bag or generic cube sculpture.
Composition: hero title on left, sculpture on right, balanced negative space, front three-quarter view, precise editorial product layout. Title exact text "Skills Hub" in large confident dark navy sans serif. Context line exact text "FOR DEEPSEEK HARNESS". Supporting line exact text "Your skills. One place." These are the only words besides "SKILL.md".
Lighting: broad softbox from upper left, clean soft shadows, gentle highlights, no dramatic spotlight.
Materials: soft-touch cobalt aluminum, off-white ceramic-paper documents, subtle machined edges.
Palette: #F5F7FB offwhite, #12233D navy, #4176E6 cobalt. Refined, tactile and useful, not whimsical.
Avoid: fake UI screenshots, glowing networks, robots, brains, random floating shapes, gradients used as decoration, tiny noisy text, watermarks.

### Candidate C — Chinese

Use case: stylized-concept
Asset type: final candidate for a Chinese-default GitHub README hero, Skills Hub plugin for DeepSeek Harness. Wide landscape 2.4:1.
Scene: seamless cool ivory-white studio, refined tactile 3D product rendering.
Subject: on the right, three tall sculptural skill document cards sitting in a compact cobalt blue desk dock: the foremost white folded-corner document labeled exactly "SKILL.md", a blue document embossed with code brackets behind it, and one small white document with an inset blue check circle. Simple integrated down-arrow embossed into dock. Ceramic-paper texture and satin blue metal. Clearly readable silhouette and soft natural contact shadows.
Layout: large typographic title on left 46%, object on right 54%, generous margins, no cropping. Title exact "Skills Hub" in confident dark navy sans-serif. Small context below exact "FOR DEEPSEEK HARNESS". Beneath it, medium-size Chinese sentence exact "发现技能，装进你的工作流。" Render these Chinese characters accurately with a clean modern sans serif. These are the only texts besides SKILL.md. No tiny captions.
Palette: #F5F7FB background, #12233D navy text, #4176E6 cobalt and white.
Style: restrained premium 3D illustration with soft lighting and precise geometry, tangible materials, not cartoon toys, no chrome or neon.
Constraints: no brand logos, no extra source names, no robots, no brain icons, no floating decorations, no UI screenshot, no watermarks. Keep title and Chinese line readable when image is displayed 830px wide.

