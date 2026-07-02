// supabase-js queries/auth calls can hang indefinitely (rather than reject)
// against an unreachable host, which would otherwise strand the UI on a
// loading spinner forever if Supabase is misconfigured or down. Race every
// call against a hard timeout so the app always settles into an error state.
export function withTimeout(promise, ms = 10000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error("Timed out talking to Supabase. Check your connection or Supabase configuration.")),
      ms,
    );
    promise.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      },
    );
  });
}
