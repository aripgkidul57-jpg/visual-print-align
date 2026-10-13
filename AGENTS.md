<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep Surat Perintah list, form, detail, and print preview as separate routes so each workflow remains focused and directly navigable.
- Use shared CSS subgrid columns for letter labels and punctuation so all body colons align with the longest label without a preceding gap.
- Keep letter typography and physical page geometry in shared print-sheet CSS for identical screen/print layout; use a bundled condensed-font fallback when the document font is unavailable.
- Render the uploaded letter logo through a CDN asset pointer in the shared LetterPreview and position it within the existing title gap so screen and print geometry remain identical.
- Initialize new-letter reusable fields through a shared allowlist helper from the latest accessible created_at record; load before editing to avoid overwriting input and keep existing-letter edits independent.
