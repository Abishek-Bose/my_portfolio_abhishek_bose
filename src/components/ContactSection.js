"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import SectionReveal from "./SectionReveal";
import { useCursorHover, useMagnetic } from "@/lib/CursorContext";

const countryCodes = [
  { code: "+91", country: "IN", flag: "\u{1F1EE}\u{1F1F3}" },
  { code: "+1", country: "US", flag: "\u{1F1FA}\u{1F1F8}" },
  { code: "+44", country: "UK", flag: "\u{1F1EC}\u{1F1E7}" },
  { code: "+61", country: "AU", flag: "\u{1F1E6}\u{1F1FA}" },
  { code: "+49", country: "DE", flag: "\u{1F1E9}\u{1F1EA}" },
  { code: "+81", country: "JP", flag: "\u{1F1EF}\u{1F1F5}" },
  { code: "+86", country: "CN", flag: "\u{1F1E8}\u{1F1F3}" },
  { code: "+33", country: "FR", flag: "\u{1F1EB}\u{1F1F7}" },
  { code: "+971", country: "AE", flag: "\u{1F1E6}\u{1F1EA}" },
  { code: "+65", country: "SG", flag: "\u{1F1F8}\u{1F1EC}" },
  { code: "+55", country: "BR", flag: "\u{1F1E7}\u{1F1F7}" },
  { code: "+7", country: "RU", flag: "\u{1F1F7}\u{1F1FA}" },
  { code: "+82", country: "KR", flag: "\u{1F1F0}\u{1F1F7}" },
  { code: "+39", country: "IT", flag: "\u{1F1EE}\u{1F1F9}" },
  { code: "+34", country: "ES", flag: "\u{1F1EA}\u{1F1F8}" },
  { code: "+31", country: "NL", flag: "\u{1F1F3}\u{1F1F1}" },
  { code: "+46", country: "SE", flag: "\u{1F1F8}\u{1F1EA}" },
  { code: "+47", country: "NO", flag: "\u{1F1F3}\u{1F1F4}" },
  { code: "+45", country: "DK", flag: "\u{1F1E9}\u{1F1F0}" },
  { code: "+358", country: "FI", flag: "\u{1F1EB}\u{1F1EE}" },
  { code: "+48", country: "PL", flag: "\u{1F1F5}\u{1F1F1}" },
  { code: "+43", country: "AT", flag: "\u{1F1E6}\u{1F1F9}" },
  { code: "+41", country: "CH", flag: "\u{1F1E8}\u{1F1ED}" },
  { code: "+32", country: "BE", flag: "\u{1F1E7}\u{1F1EA}" },
  { code: "+351", country: "PT", flag: "\u{1F1F5}\u{1F1F9}" },
  { code: "+353", country: "IE", flag: "\u{1F1EE}\u{1F1EA}" },
  { code: "+30", country: "GR", flag: "\u{1F1EC}\u{1F1F7}" },
  { code: "+420", country: "CZ", flag: "\u{1F1E8}\u{1F1FF}" },
  { code: "+36", country: "HU", flag: "\u{1F1ED}\u{1F1FA}" },
  { code: "+40", country: "RO", flag: "\u{1F1F7}\u{1F1F4}" },
  { code: "+380", country: "UA", flag: "\u{1F1FA}\u{1F1E6}" },
  { code: "+90", country: "TR", flag: "\u{1F1F9}\u{1F1F7}" },
  { code: "+972", country: "IL", flag: "\u{1F1EE}\u{1F1F1}" },
  { code: "+966", country: "SA", flag: "\u{1F1F8}\u{1F1E6}" },
  { code: "+974", country: "QA", flag: "\u{1F1F6}\u{1F1E6}" },
  { code: "+973", country: "BH", flag: "\u{1F1E7}\u{1F1ED}" },
  { code: "+968", country: "OM", flag: "\u{1F1F4}\u{1F1F2}" },
  { code: "+965", country: "KW", flag: "\u{1F1F0}\u{1F1FC}" },
  { code: "+20", country: "EG", flag: "\u{1F1EA}\u{1F1EC}" },
  { code: "+27", country: "ZA", flag: "\u{1F1FF}\u{1F1E6}" },
  { code: "+234", country: "NG", flag: "\u{1F1F3}\u{1F1EC}" },
  { code: "+254", country: "KE", flag: "\u{1F1F0}\u{1F1EA}" },
  { code: "+255", country: "TZ", flag: "\u{1F1F9}\u{1F1FF}" },
  { code: "+233", country: "GH", flag: "\u{1F1EC}\u{1F1ED}" },
  { code: "+256", country: "UG", flag: "\u{1F1FA}\u{1F1EC}" },
  { code: "+212", country: "MA", flag: "\u{1F1F2}\u{1F1E6}" },
  { code: "+216", country: "TN", flag: "\u{1F1F9}\u{1F1F3}" },
  { code: "+213", country: "DZ", flag: "\u{1F1E9}\u{1F1FF}" },
  { code: "+60", country: "MY", flag: "\u{1F1F2}\u{1F1FE}" },
  { code: "+66", country: "TH", flag: "\u{1F1F9}\u{1F1ED}" },
  { code: "+84", country: "VN", flag: "\u{1F1FB}\u{1F1F3}" },
  { code: "+62", country: "ID", flag: "\u{1F1EE}\u{1F1E9}" },
  { code: "+63", country: "PH", flag: "\u{1F1F5}\u{1F1ED}" },
  { code: "+880", country: "BD", flag: "\u{1F1E7}\u{1F1E9}" },
  { code: "+92", country: "PK", flag: "\u{1F1F5}\u{1F1F0}" },
  { code: "+94", country: "LK", flag: "\u{1F1F1}\u{1F1F0}" },
  { code: "+977", country: "NP", flag: "\u{1F1F3}\u{1F1F5}" },
  { code: "+95", country: "MM", flag: "\u{1F1F2}\u{1F1F2}" },
  { code: "+852", country: "HK", flag: "\u{1F1ED}\u{1F1F0}" },
  { code: "+853", country: "MO", flag: "\u{1F1F2}\u{1F1F4}" },
  { code: "+886", country: "TW", flag: "\u{1F1F9}\u{1F1FC}" },
  { code: "+64", country: "NZ", flag: "\u{1F1F3}\u{1F1FF}" },
  { code: "+679", country: "FJ", flag: "\u{1F1EB}\u{1F1EF}" },
  { code: "+52", country: "MX", flag: "\u{1F1F2}\u{1F1FD}" },
  { code: "+57", country: "CO", flag: "\u{1F1E8}\u{1F1F4}" },
  { code: "+56", country: "CL", flag: "\u{1F1E8}\u{1F1F1}" },
  { code: "+54", country: "AR", flag: "\u{1F1E6}\u{1F1F7}" },
  { code: "+51", country: "PE", flag: "\u{1F1F5}\u{1F1EA}" },
  { code: "+58", country: "VE", flag: "\u{1F1FB}\u{1F1EA}" },
  { code: "+593", country: "EC", flag: "\u{1F1EA}\u{1F1E8}" },
  { code: "+591", country: "BO", flag: "\u{1F1E7}\u{1F1F4}" },
  { code: "+595", country: "PY", flag: "\u{1F1F5}\u{1F1FE}" },
  { code: "+598", country: "UY", flag: "\u{1F1FA}\u{1F1FE}" },
  { code: "+507", country: "PA", flag: "\u{1F1F5}\u{1F1E6}" },
  { code: "+506", country: "CR", flag: "\u{1F1E8}\u{1F1F7}" },
  { code: "+503", country: "SV", flag: "\u{1F1F8}\u{1F1FB}" },
  { code: "+502", country: "GT", flag: "\u{1F1EC}\u{1F1F9}" },
  { code: "+1-876", country: "JM", flag: "\u{1F1EF}\u{1F1F2}" },
  { code: "+1-868", country: "TT", flag: "\u{1F1F9}\u{1F1F9}" },
  { code: "+354", country: "IS", flag: "\u{1F1EE}\u{1F1F8}" },
  { code: "+352", country: "LU", flag: "\u{1F1F1}\u{1F1FA}" },
  { code: "+356", country: "MT", flag: "\u{1F1F2}\u{1F1F9}" },
  { code: "+357", country: "CY", flag: "\u{1F1E8}\u{1F1FE}" },
  { code: "+370", country: "LT", flag: "\u{1F1F1}\u{1F1F9}" },
  { code: "+371", country: "LV", flag: "\u{1F1F1}\u{1F1FB}" },
  { code: "+372", country: "EE", flag: "\u{1F1EA}\u{1F1EA}" },
];

export default function ContactSection() {
  const buttonRef = useMagnetic(0.4);
  const buttonHover = useCursorHover("button");
  const textHover = useCursorHover("text");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    countryCode: "+91",
    phone: "",
    additionalInfo: "",
    requestCallback: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    alert("Thanks for reaching out! I'll get back to you soon.");
    setFormData({
      name: "",
      email: "",
      countryCode: "+91",
      phone: "",
      additionalInfo: "",
      requestCallback: false,
    });
  };

  return (
    <section id="contact" className="py-24 md:py-32 px-6 md:px-12">
      <div className="max-w-3xl mx-auto">
        <SectionReveal>
          <h2 className="text-4xl md:text-6xl font-bold mb-4">
            Let&apos;s Talk {"\u2192"}
          </h2>
          <p className="text-accent-muted text-lg mb-12">
            Add your project in mind?
          </p>
        </SectionReveal>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div {...textHover}>
              <label
                htmlFor="name"
                className="text-sm text-accent-muted block mb-2"
              >
                Your name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full bg-transparent border-b border-border py-3 text-white focus:border-accent outline-none transition-colors"
                placeholder="Your name"
              />
            </div>

            <div {...textHover}>
              <label
                htmlFor="email"
                className="text-sm text-accent-muted block mb-2"
              >
                Your email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full bg-transparent border-b border-border py-3 text-white focus:border-accent outline-none transition-colors"
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="phone"
              className="text-sm text-accent-muted block mb-2"
            >
              Phone number
            </label>
            <div className="flex gap-4">
              <select
                name="countryCode"
                value={formData.countryCode}
                onChange={handleChange}
                className="bg-transparent border-b border-border py-3 text-white focus:border-accent outline-none transition-colors w-32"
              >
                {countryCodes.map((c) => (
                  <option key={c.code} value={c.code} className="bg-dark">
                    {c.flag} {c.code}
                  </option>
                ))}
              </select>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="flex-1 bg-transparent border-b border-border py-3 text-white focus:border-accent outline-none transition-colors"
                placeholder="Phone number"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="additionalInfo"
              className="text-sm text-accent-muted block mb-2"
            >
              Additional info you want to tell us
            </label>
            <textarea
              id="additionalInfo"
              name="additionalInfo"
              value={formData.additionalInfo}
              onChange={handleChange}
              rows={4}
              className="w-full bg-transparent border-b border-border py-3 text-white focus:border-accent outline-none transition-colors resize-none"
              placeholder="Anything else you'd like to share..."
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="requestCallback"
              name="requestCallback"
              checked={formData.requestCallback}
              onChange={handleChange}
              className="w-4 h-4 accent-yellow-400 bg-transparent border border-border rounded"
            />
            <label
              htmlFor="requestCallback"
              className="text-sm text-accent-muted"
            >
              Call me back
            </label>
          </div>

          <motion.button
            ref={buttonRef}
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="px-10 py-4 bg-accent text-[#0c0c0c] font-medium rounded-full hover:bg-accent/80 transition-colors text-sm"
            {...buttonHover}
          >
            Call me back
          </motion.button>
        </motion.form>
      </div>
    </section>
  );
}
