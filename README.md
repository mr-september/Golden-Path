# GoldenPath

![Version](https://img.shields.io/badge/version-1.0.0-amber)
![License](https://img.shields.io/badge/license-MIT-zinc)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-emerald)
![Built with](https://img.shields.io/badge/built%20with-React%2019-61dafb)

**A high-precision engine for the iterative distillation of technical context from large-scale chat logs and meeting transcripts.**

GoldenPath addresses the "context window noise" problem by processing extensive, iterative technical logs in discrete batches, synthesizing a cumulative state of verified knowledge. It is designed for researchers and engineers who require a clean, actionable record from messy, exploratory sessions.

## Core Capabilities

- **Iterative State Compression**: Systematically processes long-form data turn-by-turn, utilizing the synthesized output of previous batches as the context for subsequent iterations.
- **Resilient API Coordination**: Implements exponential backoff and adaptive cooling protocols to manage rate limits (e.g., Gemini API 429 errors) and ensure processing continuity.
- **Sliding Window Validation**: Overlaps batches to maintain context across boundaries, preventing the loss of information that frequently occurs at arbitrary chunk splits.
- **Recursive Reasoning**: Instructs the underlying model to re-evaluate the cumulative summary if late-log information contradicts or matures earlier findings.
- **Encrypted Local Persistence**: Ensures session state, configuration, and sensitive credentials remain on the client-side using industry-standard AES-GCM encryption.

## Technical Architecture

1. **Ingestion**: Accepts unstructured `.txt`, `.log`, and `.md` formats.
2. **Segmentation**: Decomposes content into logical turns based on configurable token ceilings and turn-markers.
3. **Distillation Loop**:
   - Compares the current batch against the existing summary state.
   - Discards exploratory "noise," failed attempts, and redundant queries.
   - Merges verified fixes and successful implementations into the "Golden Path."
4. **Output Generation**: Produces a structured technical specification or "How-To" guide representing the final, stable state of the project logic.

## Deployment & Integration

GoldenPath is optimized for static hosting environments and GitHub Pages.

### Local Development

1. **Clone Repository**:
   ```bash
   git clone https://github.com/mr-september/Golden-Path.git
   ```
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Execution**:
   ```bash
   npm run dev
   ```

### Production Build

To generate a production bundle optimized for cross-browser performance:
```bash
npm run build
```

The resulting artifacts are located in the `dist/` directory, ready for deployment to any static web server.

## Security & Privacy Model

- **Zero Data Leakage**: All processing is handled client-side. No data is transmitted to third-party servers except for direct, encrypted requests to the specified LLM provider API.
- **Key Security**: API credentials are obfuscated via the Web Crypto API (AES-GCM). The master encryption key is generated at runtime and stored exclusively in the browser's secure `localStorage`.

## 💖 Support FOSS Projects

My work developing, contributing to, and maintaining open-source software is made possible solely by your donations. Your support is vital to the ongoing development of FOSS solutions.

- **PayPal**: [Donate via PayPal](https://www.paypal.com/donate/?hosted_button_id=WFXL2T42BBCRN)
- **Ko-fi**: [Support on Ko-fi](https://ko-fi.com/Q5Q11I49GI)
- **Liberapay**: [Donate via Liberapay](https://liberapay.com/mr-september)
- **Crypto**: [Donate via NowPayments](https://nowpayments.io/donation?api_key=5b5fabd5-2c33-4525-99a3-bf27f587780c)

## 🌟 Other Ways to Help

- **Star the Repository**: Show your support by starring GoldenPath on GitHub.
- **Share the Project**: [Share on X/Twitter](https://twitter.com/intent/tweet?text=Synthesize%20massive%20technical%20logs%20into%20clean%20knowledge%20with%20GoldenPath.%20Check%20it%20out:%20https://github.com/mr-september/Golden-Path)
- **Provide Feedback**: Open an issue or start a discussion for feature requests.

## License

MIT License.

