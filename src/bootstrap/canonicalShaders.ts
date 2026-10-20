/** Original canonicalization increases reuse of otherwise identical GPU programs. */
const shaderIdentifier = /\b(NodeBuffer_|nodeVar|nodeConst)(\d+)/g;
export function canonicalizeShaderIdentifiers(shader?: string): string | undefined {
  if (!shader) return shader;
  const names = new Map<string, string>();
  const counts = new Map<string, number>();
  return shader.replace(shaderIdentifier, (_match, prefix: string, suffix: string) => {
    const key = prefix + suffix;
    let name = names.get(key);
    if (name === undefined) {
      const count = counts.get(prefix) ?? 0;
      counts.set(prefix, count + 1);
      name = prefix + count;
      names.set(key, name);
    }
    return name;
  });
}
interface ShaderBuilderState {
  vertexShader?: string;
  fragmentShader?: string;
  computeShader?: string;
}
interface ShaderRenderer {
  _nodes?: {
    _createNodeBuilderState?: (state: ShaderBuilderState) => unknown;
  };
}
export function installCanonicalShaderNames(renderer?: ShaderRenderer): boolean {
  const nodes = renderer?._nodes;
  const createState = nodes?._createNodeBuilderState;
  if (!nodes || !createState) return false;
  nodes._createNodeBuilderState = function (state) {
    state.vertexShader = canonicalizeShaderIdentifiers(state.vertexShader);
    state.fragmentShader = canonicalizeShaderIdentifiers(state.fragmentShader);
    state.computeShader = canonicalizeShaderIdentifiers(state.computeShader);
    return createState.call(this, state);
  };
  return true;
}
