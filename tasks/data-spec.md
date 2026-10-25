# Data spec for the redesign (author: manager / Opus)

Types: `client/src/data/types.ts` (do not change without asking). Taxonomy: `client/src/data/taxonomy.ts`.

## A. Images
1. `git rm -r -q client/public/images/Project-backup`. It is 752 MB, unreferenced, and backed up in `C:\Users\sajja\Backups\sajjad-portfolio\2026-10-25\`.
2. Copy every `00A-0{173,179,182,189,190,191,195,196,198,200,201,204}-*.webp` file, thumbs included, from the ingest output into `client/public/images/Project/`. The ingest output is `C:\Users\sajja\AppData\Local\Temp\claude\C--Users-sajja-Downloads-sajjad-portfolio\b750f3da-4f7a-43a7-ad54-f2de01c5afb4\scratchpad\ingest_out\`.
3. Copy all of `...\scratchpad\concept3\img\*.webp` into `client/public/images/showcase/`.

## B. projectsData.ts
- Import `Project` and `ProjectSection` from `./types` and remove the local interface duplicates. Keep `export const projectsData: Project[]`.
- **Sector for the existing 52 projects.** Use `tasks/category-mapping-vision.json` `visualSector` where it is present, else `tasks/category-mapping.json` `proposedSector`. Map the names as follows:
  - residential-villa → villa
  - residential-complex → complex
  - apartments → apartments
  - commercial-retail → retail
  - hospitality-restaurants → dining
  - medical → medical
  - education → education
  - fuel-infrastructure → fuel
  - interior → interior
  - office-administrative → civic
  - religious-cultural → civic
  - other → other
- **Interior spaces.** Set `interiorSpaces` from `tasks/interior-spaces.json` byProject. For a project whose primary sector is not `interior` but has spaces greater than 0, add `"interior"` to `alsoIn`.
- **Titles.** For the 16 records whose `title` equals their id, replace `title`/`titleAr` with `suggestedTitle`/`suggestedTitleAr` from `category-mapping-vision.json`. Also fix 00A-0115: it is "Restaurant & Café — Corner Building" / "مطعم ومقهى — بناية زاوية", sector `dining`.
- **Slug.** Give every project a `slug` built from the English title: lowercase ASCII, hyphens, plus the 4-digit code suffix, e.g. `restaurant-cafe-corner-building-0115`.
- **Thumb.** Set `thumb` to the `-thumb.webp` variant of `image` when that file exists in `client/public/images/Project/`.
- Keep `category` equal to `sector`. It is a legacy field.
- Do not delete existing fields, images, sections or coordinates.

## C. The 12 new projects
Use the copy below exactly. Build `image` from the first render, `thumb` from it, and `allImages` from all of the code's gallery webp files except thumbs, with renders first. Use `imagePath()`. Set `featured: true` only where marked ★.

| id | title / titleAr | sector, alsoIn | role (en / ar) | collaborator | location (en / ar) | description (en / ar) |
|---|---|---|---|---|---|---|
| 00A-0173 | Residential Complex — A+ House Type / مجمع سكني — بيت فئة A+ | complex | A+ house design, facades & visualization / تصميم بيت الفئة A+ وواجهاته والإظهار | Al-Qaws | — | A residential complex with several house types. We designed the A+ house type in full, including its exterior and the complex visualization. / مجمع سكني بعدة نماذج بيوت. صممنا بيت الفئة A+ بالكامل مع واجهاته الخارجية وإظهار المجمع. |
| 00A-0179 ★ | Residence in Kinda District / منزل في حي كندة | villa, [interior] | Facade & interior design / تصميم الواجهة والتصميم الداخلي | — | Kinda, Najaf / حي كندة، النجف | A private residence with a contemporary facade and fully designed interiors. / منزل خاص بواجهة معاصرة وتصميم داخلي متكامل. |
| 00A-0182 ★ | Al-Jinsiya Fuel Station / محطة وقود الجنسية | fuel | Architectural visualization / إظهار معماري | Al-Qaws | — | Photorealistic visualization of a fuel station, prepared from the consultant's drawings. / إظهار واقعي لمحطة وقود انطلاقاً من مخططات الجهة الاستشارية. |
| 00A-0189 ★ | Ya Ali Road Fuel Station / محطة وقود طريق يا علي | fuel | 3D design & visualization / تصميم ثلاثي الأبعاد وإظهار | Al-Qaws | Najaf / النجف | Fuel station with service buildings and retail frontage. Floor plans by the consultant; we completed the 3D design and visualization. / محطة وقود مع مبانٍ خدمية وواجهات تجارية. المخططات من الجهة الاستشارية، وأكملنا التصميم ثلاثي الأبعاد والإظهار. |
| 00A-0190 ★ | Women's Fashion Store — Al-Furat Mall / متجر أزياء نسائية — مول الفرات | retail, [interior] | Interior design / تصميم داخلي | — | Al-Furat Mall / مول الفرات | Store interior with display walls, shopfront and cash desk, documented in plans and elevations. / تصميم داخلي لمتجر بجدران عرض وواجهة وكاونتر، موثق بالمخططات والمقاطع. |
| 00A-0191 | Home Appliance Showroom / معرض أجهزة منزلية | retail, [interior] | Showroom interior design / تصميم داخلي للمعرض | — | Atiya Jabouri St. / شارع عطية الجبوري | Showroom layout and display joinery modeled in BIM. / تخطيط المعرض وتفاصيل وحدات العرض بنموذج BIM. |
| 00A-0195 ★ | Kindergarten / روضة أطفال | education | Full design + BIM / تصميم كامل + BIM | Al-Qaws | Najaf / النجف | A kindergarten designed from plans to every deliverable. / روضة أطفال صُممت من المخططات حتى كل المخرجات. |
| 00A-0196 ★ | Kindergarten 50×25 m / روضة أطفال 50×25 م | education | Full design + BIM / تصميم كامل + BIM | Al-Qaws | Najaf / النجف | A 50×25 m kindergarten with two exterior design options: yellow brick with ceramic ornament, and a white, colourful scheme. / روضة أطفال بأبعاد 50×25 م بخيارين للتصميم الخارجي: طابوق أصفر بزخارف خزفية، وتصميم أبيض بألوان مرحة. |
| 00A-0198 ★ | Fuel Station — Baghdad / محطة وقود — بغداد | fuel | 3D design & visualization / تصميم ثلاثي الأبعاد وإظهار | Al-Qaws | Baghdad / بغداد | Canopy, forecourt and service building designed in 3D and visualized. / تصميم ثلاثي الأبعاد وإظهار للمظلة والساحة ومبنى الخدمات. |
| 00A-0200 | House 13×20 m / منزل 13×20 م | villa, [interior] | Facade & interior design / تصميم الواجهة والتصميم الداخلي | — | Najaf / النجف | A 13×20 m house with brick-and-white facade and designed living spaces. / منزل بمساحة 13×20 م بواجهة من الطابوق والأبيض وتصميم داخلي للصالات. |
| 00A-0201 | House Renovation — Al-Jamia District / ترميم منزل — حي الجامعة | villa, [interior] | Renovation, facade & interior / ترميم وواجهة وتصميم داخلي | — | Al-Jamia, Najaf / حي الجامعة، النجف | Full renovation of an existing house: new facade options and redesigned bedrooms and lounges. / ترميم كامل لمنزل قائم: خيارات جديدة للواجهة وإعادة تصميم غرف النوم والصالات. |
| 00A-0204 ★ | Doctors' House — Interiors / بيت الأطباء — تصميم داخلي | interior | Interior design / تصميم داخلي | — | Najaf / النجف | Guest lounges and living rooms with ceiling, lighting and electrical plans. / صالات ضيوف وجلوس مع مخططات السقف والإضاءة والكهرباء. |

- Collaborator "Al-Qaws" means `{ en: "Al-Qaws Engineering Consultancy", ar: "شركة القوس للاستشارات الهندسية" }`.
- Never include private client names (doctor, engineer, contractor) anywhere.
- 00A-0196 `options`:
  - `[{label:{ar:"واجهة أ",en:"Option A"}, images:[yellow-brick renders]}, {label:{ar:"واجهة ب",en:"Option B"}, images:[white/colourful renders]}]`.
  - Decide which output files belong to each option by viewing them. Convert a few to JPG with Pillow if the Read tool can't open webp.
- **Services.** Set `services` for the new projects:
  - Full design: `["architecture","visualization","bim"]`
  - Visualization only: `["visualization"]`
  - 3D design & visualization: `["visualization","bim"]`
  - Interior: `["interior","visualization"]`
- **Existing projects marked featured:** 00A-0085 (sector civic, role `Design + BIM drawings / تصميم + مخططات BIM`, location Najaf / النجف), 00A-0094, 00A-0115 and 00A-0156. Give these the same role as 0085.

## D. Verify
- Run `pnpm check`. It must pass.
- Print the counts per sector, the interior-space total, the featured count (expected 12), and the `client/public` size.
