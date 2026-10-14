import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <div className="container prose">
      <p className="micro">Legal</p>
      <h1 className="h1">Privacy Policy</h1>
      <p>This is a demo storefront. It stores your shopping cart in your browser&apos;s local storage only and does not collect, transmit or sell personal data.</p>
      <p>Forms such as checkout, newsletter and sign-in are UI demonstrations and do not send information to any server.</p>
    </div>
  );
}

