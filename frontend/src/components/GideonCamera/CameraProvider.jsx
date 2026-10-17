// Disabled - requires MediaPipe
export function CameraProvider({ children, onFrame }) {
  return <div>Camera disabled - MediaPipe not installed</div>;
}

export function useCamera() {
  return { videoRef: { current: null } };
}
