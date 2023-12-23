const verifyEndpoint =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const secret = "0x4AAAAAAANib6B4NtPZ-AKqpxLVB6Ovj1c";

export async function POST(request: Request) {
  const { token } = await request.json();

  const res = await fetch(verifyEndpoint, {
    method: "POST",
    body: `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(
      token,
    )}`,
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
  });

  const data = await res.json();

  return new Response(JSON.stringify(data), {
    status: data.success ? 200 : 400,
    headers: {
      "content-type": "application/json",
    },
  });
}
