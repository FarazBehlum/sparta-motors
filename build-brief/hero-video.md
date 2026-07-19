# Integration — Scroll-Driven Hero Video

The signature feature of the home page. As the user scrolls through the hero section, a truck disassembles piece by piece — box container floats up, cab lifts, wheels visible. Every text phase transitions in and out with the scroll.

**Mockup reference:** `/mockups/sparta-scroll-hero-v2.html`

## Design intent

The hero communicates Sparta's brand thesis as an interaction: *"We show you what's inside every truck before you buy."* The disassembly is literal — the user watches the truck come apart, revealing its components, in the same way Sparta reveals a truck's condition through honest specs and photos.

Not a marketing gimmick. Not a parallax stunt. A functional interaction that delivers the brand promise in the first few seconds of the page.

## Technical approach — the pipeline

### Step 1: Source assets

We need a 240-frame sequence showing the truck disassembling. Options:

**Option A: Blender render.** A truck 3D model rendered from a fixed camera position through 240 frames, with each frame showing progressive disassembly. Highest quality. Requires 3D modeling work.

**Option B: Rotoscoped animation.** Start with a real truck photo, use After Effects or similar to composite the disassembly. Medium quality. Requires video editing work.

**Option C: Photo sequence.** Photograph a truck at incremental stages of a physical disassembly. Not realistic for actual disassembly, but a "posed" sequence with digital parts moving. Lower cost.

**Recommendation:** Option A (Blender) — highest quality and most controllable, and there's no ongoing production cost after the initial render. The project manager will need to source or commission this asset. Style should match the "workhorse industrial" brand direction (neutral background, front-3/4 truck view, matte look — not glossy showroom render).

If the render doesn't exist yet at build time, the placeholder can be a static truck photo with a simulated disassembly using CSS/JS transforms on layered elements. Not as polished but functional.

### Step 2: Optimize the frame sequence

240 PNG frames at ~1600×1000px each = ~150-200MB uncompressed. Way too big for web delivery.

Convert the PNG sequence to a WebM video using ffmpeg:

```bash
ffmpeg -framerate 30 -i frame_%04d.png -c:v libvpx-vp9 -b:v 0 -crf 30 -pix_fmt yuv420p -an sparta-hero.webm
```

Target output: 500KB-1MB WebM file. Adjust `-crf` (quality) to hit the target size while maintaining visual clarity.

**Why WebM instead of MP4 or GIF:**
- WebM (VP9 codec) has excellent compression for hero-style videos
- Supported in all modern browsers (Chrome, Firefox, Safari 14+, Edge)
- Better compression than MP4 for the kind of content we have (mostly solid color backgrounds)
- GIF would be 20-50MB — not viable

Also generate an MP4 fallback for older Safari and edge cases:

```bash
ffmpeg -framerate 30 -i frame_%04d.png -c:v libx264 -crf 23 -pix_fmt yuv420p -an sparta-hero.mp4
```

### Step 3: Poster frame

Generate a single JPG of the first frame at ~50KB. Shown before the video loads and while the video buffers. Also shown to users with `prefers-reduced-motion`.

```bash
ffmpeg -i sparta-hero.webm -vf "select=eq(n\,0)" -vframes 1 sparta-hero-poster.jpg
```

## Front-end implementation

### Structural HTML

```html
<section class="hero" style="height: 250vh;">
  <div class="hero-sticky" style="position: sticky; top: 0; height: 100vh;">
    <video
      id="hero-video"
      src="/sparta-hero.webm"
      poster="/sparta-hero-poster.jpg"
      muted
      playsinline
      preload="auto"
      style="width: 100%; height: 100%; object-fit: cover;"
    />
    <div class="hero-text-layer">
      <!-- Three text phases, absolutely positioned, opacity-controlled -->
    </div>
  </div>
</section>
```

### Scroll scrubbing logic

Use GSAP + ScrollTrigger, or a lightweight custom hook. Both approaches:

**Option A — GSAP ScrollTrigger:**

```js
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

const video = document.getElementById('hero-video');

video.addEventListener('loadedmetadata', () => {
  gsap.to(video, {
    currentTime: video.duration,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.5,  // slight smoothing
    },
  });
});
```

**Option B — Lightweight custom hook (no GSAP dependency):**

```js
useEffect(() => {
  const video = videoRef.current;
  const section = sectionRef.current;
  if (!video || !section) return;

  const onScroll = () => {
    const rect = section.getBoundingClientRect();
    const scrollProgress = Math.max(0, Math.min(1, -rect.top / (rect.height - window.innerHeight)));
    if (video.duration) {
      video.currentTime = scrollProgress * video.duration;
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  return () => window.removeEventListener('scroll', onScroll);
}, []);
```

**Tradeoff:** GSAP adds ~30KB but has smoother scrubbing on Safari (which has known quirks with programmatic video.currentTime scrubbing). Custom hook is ~1KB but may have jittery scrubbing on some devices.

**Recommendation:** Start with the custom hook. If Safari testing shows jitter, add GSAP.

### Text phase overlays

Three text phases positioned absolutely inside `.hero-text-layer`. Opacity animated based on the same scroll progress used for the video.

Scroll progress ranges:
- **Phase 1 (0.00 - 0.35):** Opacity 1 (0-0.25), fading out to 0 (0.25-0.35)
- **Phase 2 (0.35 - 0.70):** Fade in 0 → 1 (0.35-0.45), full opacity (0.45-0.60), fade out 1 → 0 (0.60-0.70)
- **Phase 3 (0.70 - 1.00):** Fade in 0 → 1 (0.70-0.80), full opacity (0.80-1.00)

Each phase contains: header (`◆ 01 · THE TRUCK`), display headline, lead text, and (for phase 3) CTA buttons.

Content editable via Payload (`Pages.home` blocks) so the copy can be updated without a code change.

### Phase indicator dots

Top-right corner of the hero. Three small circles.

- Default: `background-color: rgba(0,0,0,0.15)`, `1px solid rgba(0,0,0,0.3)`
- Active phase: `background-color: #F26B0F`

Active state changes based on `scrollProgress` value — same math as text overlays.

### Bottom fade overlay

Gradient overlay at the bottom of the sticky container:

```css
.hero-fade {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 200px;
  background: linear-gradient(to bottom, transparent, #EFEEEA);
  pointer-events: none;
}
```

Ensures text at the bottom of the hero remains legible over the truck.

### Scroll indicator

Bottom-right corner. "SCROLL" text with a small down-arrow. Fades out after user starts scrolling.

## Mobile adaptation

Scroll-scrubbed video on mobile is a known-difficult UX pattern. The approach:

- **Modern mobile (iOS 14+, Android with Chrome 90+):** Full scroll-scrubbing works. Same behavior as desktop.
- **Older / low-end devices:** Fall back to a simpler pattern:
  - Video autoplays at slow speed (`playbackRate: 0.5`) with `muted` + `playsinline`
  - Text phases still fade in/out based on scroll position (this part is cheap)
  - The truck disassembles at its own pace regardless of scroll

Detect via feature detection (check for `IntersectionObserver`, video codec support, and device pixel ratio) plus a simple performance heuristic.

**Very small screens (`<380px`):** Simplify further — show just the first frame as a static image, and rely on the text phase transitions for the storytelling.

## Reduced motion

Users with `prefers-reduced-motion: reduce`:

- Video is paused, showing the poster/first frame
- Text phases still transition, but with instant swaps (no fade), triggered by scroll thresholds
- No scrubbing, no video playback

Detection:

```js
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
```

## Performance targets

- **Total added weight:** WebM (500KB-1MB) + poster (50KB) + JS (~1KB custom or ~30KB with GSAP)
- **First paint of poster:** under 1.5s
- **Video ready to scrub:** under 3s on 4G
- **Scroll FPS:** 60fps on iPhone 12+, 30fps minimum on iPhone SE and mid-tier Android
- **CPU usage during scroll:** should not spike above 30% on any target device

## Debugging tips

- Chrome DevTools > Performance panel to profile scroll frame rate
- Safari's Web Inspector has better tools for iOS video debugging
- Test on real devices, not just DevTools mobile emulation — mobile video scrubbing behavior is genuinely different

## Fallback / degradation strategy

If any of the following happen, fall back gracefully:

- **Video fails to load:** Show static poster frame, transition text phases based on scroll only
- **Browser doesn't support WebM:** Fall back to MP4
- **Video codec unsupported entirely:** Show poster, use CSS transforms on layered elements to simulate disassembly (crude but functional)
- **JS disabled:** Static poster shown, text phases visible with only Phase 3 (final headline) as the default

## What good implementation looks like

- The scroll feels connected to the truck disassembly — scrubbing is smooth, not jumpy
- Text phase transitions time perfectly with the visual moments in the video
- On iPhone 12 the whole experience runs at 60fps with no dropped frames
- Reduced-motion users still get the storytelling through text transitions
- The video loads and starts working within 3 seconds on 4G
- The poster frame is compelling enough that even non-scrolling users see a great first impression
- Total page weight added for this feature stays under 1.5MB
