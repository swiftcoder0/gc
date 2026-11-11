# Audio Assets Directory (`public/assets/audio`)

Place all sound effects, ambient soundtracks, voiceover notes, or background audio files here.

## Supported Formats
- MP3 (`.mp3`)
- WAV (`.wav`)
- OGG (`.ogg`)
- AAC / M4A (`.m4a`, `.aac`)

## How to Reference in Code
Any file placed here is directly served at `/assets/audio/<filename>`:

### In React Components:
```jsx
// Example 1: HTML5 Audio Element
<audio controls className="w-full">
  <source src="/assets/audio/ambient-ambience.mp3" type="audio/mpeg" />
  Your browser does not support the audio element.
</audio>

// Example 2: Interactive Sound Effect on Click
const playClickSound = () => {
  const audio = new Audio('/assets/audio/click.mp3');
  audio.volume = 0.5;
  audio.play().catch(console.warn);
};

<button onClick={playClickSound}>Click Me</button>
```
