const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PLACEHOLDER_HELP = "I need help with*";

export function shouldDropAsSpam(honeypot) {
  return Boolean(honeypot && honeypot.trim());
}

export function validateContact(data) {
  const errors = {};
  if (!data.firstName?.trim()) errors.firstName = "Required";
  if (!data.lastName?.trim()) errors.lastName = "Required";
  if (!EMAIL.test(data.email || "")) errors.email = "Enter a valid email";
  if (!data.company?.trim()) errors.company = "Required";
  if (!data.helpWith || data.helpWith === PLACEHOLDER_HELP) {
    errors.helpWith = "Required";
  }
  return { ok: Object.keys(errors).length === 0, errors };
}

export async function submitContact(payload, fetchFn = fetch) {
  const res = await fetchFn("https://api.web3forms.com/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("form api");
  return res.json();
}

export function initForm() {
  const form = document.querySelector("#contact-form");
  if (!form) return;
  const status = form.querySelector("[data-form-status]");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    if (shouldDropAsSpam(data.website)) return;
    const result = validateContact(data);
    form.querySelectorAll("[data-error]").forEach((el) => {
      el.textContent = result.errors[el.getAttribute("data-error")] || "";
    });
    if (!result.ok) return;
    const { WEB3FORMS_KEY } = await import("./config.js");
    if (!WEB3FORMS_KEY) {
      status.textContent =
        "Something went wrong, please email info@billboardworldwide.com";
      return;
    }
    try {
      await submitContact({
        access_key: WEB3FORMS_KEY,
        subject: `Website contact: ${data.helpWith}`,
        from_name: `${data.firstName} ${data.lastName}`,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        company: data.company,
        phone: data.phone,
        helpWith: data.helpWith,
        message: data.message,
      });
      status.textContent = "Thank you. We will get back to you soon.";
      form.reset();
    } catch {
      status.textContent =
        "Something went wrong, please email info@billboardworldwide.com";
    }
  });
}
