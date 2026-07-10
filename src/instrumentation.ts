export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    try {
      const { Agent, setGlobalDispatcher } = await import("undici");
      setGlobalDispatcher(new Agent({ connect: { family: 4 } }));
    } catch {
      const dns = await import("dns");
      if (typeof dns.setDefaultResultOrder === "function") {
        dns.setDefaultResultOrder("ipv4first");
      }
    }
  }
}
