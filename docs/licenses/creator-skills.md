# Creator toolkit Skill packages

The site owner's four explicitly selected skills are offered as complete ZIP folders at `/skills/creator/`. The original files, copyright notices and license text are retained in each package. IAVSE's descriptions, examples and recommendation notes are independently authored. The general Skill directory continues to link to upstream projects.

| Skill | Upstream author and repository | Packaged revision | Main license |
| --- | --- | --- | --- |
| Hallmark | Hassan El Mghari / Together AI, [Nutlope/hallmark](https://github.com/Nutlope/hallmark) | `04977e15f3dfd6ee4b74c887dac3eb52665d6c92` | MIT |
| Stageshow | Benji Taylor, [benjitaylor/skills](https://github.com/benjitaylor/skills) | `299140fafd08df55a9c234e610c3f64af3f45531` | MIT |
| Dimensional Drawing | Enes Ozturk, [enesozturk/dimensional-drawing](https://github.com/enesozturk/dimensional-drawing) | `5c457437c8c83524308aad3b7443e81adcc13153` | MIT |
| Brand Identity | Fatih Aydost, [fatihaydost/brand-identity-skill](https://github.com/fatihaydost/brand-identity-skill) | `af7ba40fe067b8b4aaeb2af90ed6c8996d014791` | MIT |

Brand Identity's third-party notices and all bundled font notices remain in its ZIP. Fonts, photographs, logos, trademarks, external services and runtime libraries retain their own terms; the skill's main license does not replace them. External photographs listed in Hallmark's catalog are not downloaded into these packages.

`public/skills/creator/manifest.json` records the revision, size and SHA-256 of each package. Rebuild from the pinned public sources with `node scripts/package-creator-skills.mjs`. The optional `--local-root <directory>` packages already installed copies; it still fetches the authoritative license from the recorded upstream revision. The script excludes environment files, dependencies, Git metadata and Python caches, and rejects symbolic links.
