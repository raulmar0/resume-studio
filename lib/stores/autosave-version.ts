export function shouldApplyAutosaveResult(
  saveVersion: number,
  latestVersion: number,
) {
  return saveVersion === latestVersion;
}
