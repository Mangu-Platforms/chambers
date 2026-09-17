export function raceAi<T>(
  promise: Promise<T>,
  ms = 12000,
): Promise<T | null> {
  return Promise.race([
    promise.then((v) => v).catch(() => null),
    new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), ms);
    }),
  ]);
}
