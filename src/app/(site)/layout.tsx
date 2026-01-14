import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "LASE | Digital Architect",
	description: "Portfolio site for LASE — Digital Architect & Brand Identity",
};

export default function SiteLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}
