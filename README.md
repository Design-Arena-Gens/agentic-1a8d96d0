## AI Video Script Architect

Generate production-ready video scripts from AI explainers. This Next.js application transforms narrative inputs into scene-by-scene plans, complete with voiceover beats, visual direction, on-screen overlays, and shareable project links.

### Features
- Guided form for topic, narrative, mood, aspect ratio, keywords, and language.
- Automated storyboard builder driven by the narrative beats you provide.
- Scene cards with voiceover copy, motion design cues, graphic overlays, and supporting asset ideas.
- Dynamic metadata section summarizing pacing, audio bed, color palette, and narration tone.
- Shareable link that encodes the current configuration for quick collaboration.

### Getting Started
```bash
npm install
npm run dev
```
Visit `http://localhost:3000` to open the storyboard studio.

### Available Scripts
- `npm run dev` – start the local development server.
- `npm run lint` – run ESLint over the project.
- `npm run build` – generate the production build.

### Deployment
The project is ready for Vercel. Once you've run `npm run build` to verify the bundle, deploy with:
```bash
vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-1a8d96d0
```
Replace `$VERCEL_TOKEN` if you are using a different token in your environment.
