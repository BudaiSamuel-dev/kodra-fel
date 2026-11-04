export async function createHandTracker() {
  const { FilesetResolver, HandLandmarker } = await import('@mediapipe/tasks-vision')
  const root = `${import.meta.env.BASE_URL}hand-tracking/`
  const files = await FilesetResolver.forVisionTasks(`${root}wasm`)
  return HandLandmarker.createFromOptions(files, {
    baseOptions: { modelAssetPath: `${root}hand_landmarker.task`, delegate: 'CPU' },
    runningMode: 'VIDEO',
    numHands: 1,
    minHandDetectionConfidence: 0.65,
    minHandPresenceConfidence: 0.65,
    minTrackingConfidence: 0.65
  })
}
