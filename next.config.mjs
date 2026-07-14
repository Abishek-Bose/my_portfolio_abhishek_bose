/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,

  logging: {
    // Defaults to 'warn', which mirrors browser warnings *and* errors into the
    // dev terminal. The Spline runtime bundles its own three.js, which warns
    // ("Texture marked for update but image is incomplete") on every frame while
    // the scene's texture is still decoding — harmless, self-healing, and not
    // fixable from here since three is inlined into their minified build.
    // 'error' keeps real browser errors in the terminal and leaves warnings in
    // the browser console, rather than silencing the channel entirely (false).
    browserToTerminal: "error",
  },
};

export default nextConfig;
