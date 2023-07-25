---
"@answerai/daisy-github-action": patch
"@answerai/daisy-core": patch
"@answerai/daisy": patch
---

bug fixes for core: skip completion on files larger than 16k, use cheaper model for smaller files, skip memorization if completions were skipped by cli.
