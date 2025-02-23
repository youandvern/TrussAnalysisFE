let mathjaxPromise = Promise.resolve();

// Configure MathJax globally
(window as any).MathJax = {
  // Lazy loading makes printing take a long long time, UX not greatly improved
  // https://docs.mathjax.org/en/latest/output/lazy.html?highlight=lazy%20loading
  // loader: { load: ["ui/lazy"] },
  // options: {
  //   enableExplorer: true, // set to false to disable the explorer
  //   a11y: {
  //     speech: false, // switch on speech output
  //     braille: false, // switch on Braille output
  //     subtitles: false, // show speech as a subtitle
  //     viewBraille: false, // display Braille output as subtitles
  //   },
  // },
  output: {
    displayOverflow: "scale",
    linebreaks: {
      // options for when overflow is linebreak
      inline: true, // true for browser-based breaking of inline equations
      width: "100%", // a fixed size or a percentage of the container width
      lineleading: 0.2, // the default lineleading in em units
      LinebreakVisitor: null, // The LinebreakVisitor to use
    },
  },
};

// Function to dynamically load MathJax script
const loadMathJax = () => {
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/mathjax@4.0.0-alpha.1/es5/tex-mml-chtml.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load MathJax script"));
    document.head.appendChild(script);
  });
};

// Function to update MathJax rendering
export const updateMathJax = () => {
  const typeset = (window as any).MathJax?.typesetPromise;
  if (typeof typeset === "function") {
    mathjaxPromise = mathjaxPromise
      .then(() => typeset())
      .catch((err) => console.error("MathJax typesetting failed:", err.message));
  }
  return mathjaxPromise;
};

// Initialize MathJax before the app starts
export const initializeMathJax = async () => {
  await loadMathJax();
};
