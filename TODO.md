# TODO

## 1. Preserve the core library and contribution experience
- [x] Preserve the existing resource library and contribution experience, including resource listings and filters for semesters 1–10, resource types (Textbooks, PYQs, Notes), and subjects.

## 2. Improve loading states and resource-count behavior
- [x] Replace the “Mapping Database...” state with animated resource-card skeletons.
- [x] Hide or animate the resource count until loading completes so “0 RESOURCES” does not flash.

## 3. Add sticky autocomplete search
- [x] Add a sticky resource search bar with autocomplete suggestions spanning subjects, book titles, and PYQ years.

## 4. Add persistent theme switching
- [x] Provide a persistent dark-mode/light-mode toggle that works across the library interface.

## 5. Add dynamically ranked discovery sections
- [ ] Show dynamically ranked discovery sections such as “Most Accessed PYQs this week” and semester-specific highlights such as “Trending Notes for Sem 4.”
- The preview ranks a student's own recent opens locally on their device. A genuinely shared campus-wide weekly ranking is not wired to a shared analytics endpoint yet.

## 6. Add personalized semester dashboard
- [x] Let students save their current semester through a lightweight profile or local storage and open directly to a personalized semester dashboard.

## 7. Add resource requests
- [x] Add a “Request a Resource” form for missing textbooks, PYQs, notes, or other academic materials.

## 8. Add contributor recognition
- [ ] Add a Top Contributors leaderboard with recognition badges such as “Note Ninja” and “Comrade of the Month.”
- The preview keeps contribution attempts and badges only in the current browser. A shared leaderboard needs a central contribution service and moderation/verification rules.

## 9. Keep student community accessible
- [x] Provide a floating WhatsApp or Telegram link that keeps the existing student community easy to reach.

## 10. Add peer feedback on resources
- [ ] Add resource ratings and comments for peer feedback, with quick options to report missing pages or identify especially useful material.
- The preview supports local usefulness votes and comments, including a missing-page/resource-correction request. They are not shared between students without a shared feedback service.
