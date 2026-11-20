// Preloaded before setup.ts. @rn-primitives (React Native Reusables' primitives) publishes JSX
// in plain .js files, which Metro accepts but Bun parses as JS. Load those files as JSX.
import { plugin } from "bun";

plugin({
  name: "rn-primitives-jsx",
  setup(build) {
    build.onLoad({ filter: /node_modules\/@rn-primitives\/.+\.m?js$/ }, async ({ path }) => ({
      contents: await Bun.file(path).text(),
      loader: "jsx",
    }));
  },
});
