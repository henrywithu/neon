import { BoxGeometry, CanvasTexture, Color, DoubleSide, Group, Mesh, MeshBasicMaterial, PlaneGeometry, SRGBColorSpace, type Scene } from 'three/webgpu';
type Progress = { isMissionDone(id: string): boolean; subscribe(listener: () => void): () => void };
/** An original three-pane motif on the shoulder of the existing First Fare road. */
export function createGlassTurn({ scene, destination, groundY, progress, layer = 0 }: { scene: Scene; destination: { x: number; z: number; width?: number }; groundY: number; progress: Progress; layer?: number }) {
  const group = new Group(); group.name = 'Trapnest Glass Turn';
  group.position.set(destination.x + (destination.width || 12) / 2 + 2, groundY, destination.z);
  const poleMaterial = new MeshBasicMaterial({ color: '#111a26' });
  const pole = new Mesh(new BoxGeometry(.18, 5, .18), poleMaterial); pole.position.y = 2.5; group.add(pole);
  const panes = Array.from({ length: 3 }, (_, index) => {
    const material = new MeshBasicMaterial({ color: '#ffd166', toneMapped: false });
    const pane = new Mesh(new BoxGeometry(.16, 1.6 + index * .3, .16), material);
    pane.position.set((index - 1) * .6, 4.2, 0); group.add(pane); return pane;
  });
  const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 192;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#111a26'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#edf3f8'; ctx.font = '600 44px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('GLASS TURN', 256, 84); ctx.fillStyle = '#6de6ff'; ctx.font = '24px sans-serif'; ctx.fillText('LEAVE A LIGHT ON', 256, 133);
  const texture = new CanvasTexture(canvas); texture.colorSpace = SRGBColorSpace;
  const sign = new Mesh(new PlaneGeometry(4, 1.5), new MeshBasicMaterial({ map: texture, side: DoubleSide, toneMapped: false }));
  sign.position.y = 2.8; group.add(sign);
  group.traverse(node => { node.layers.enable(layer); }); scene.add(group);
  const update = () => {
    const lit = progress.isMissionDone('first-fare');
    for (const pane of panes) pane.material.color.copy(new Color(lit ? '#6de6ff' : '#665433'));
  };
  const unsubscribe = progress.subscribe(update); update();
  return {
    group,
    marker() { return { kind: 'landmark', name: 'Glass Turn', x: destination.x, z: destination.z, done: progress.isMissionDone('first-fare'), color: '#6de6ff' }; },
    proximity(pose: { x: number; z: number }) { return Math.max(0, 1 - Math.hypot(pose.x - destination.x, pose.z - destination.z) / 140); },
    dispose() { unsubscribe(); group.removeFromParent(); group.traverse(node => { if (node instanceof Mesh) { node.geometry.dispose(); if (!Array.isArray(node.material)) node.material.dispose(); } }); texture.dispose(); }
  };
}
