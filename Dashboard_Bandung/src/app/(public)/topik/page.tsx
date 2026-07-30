import { Suspense } from "react";
import { TopikContent } from "./TopikContent";

export default function TopikPage() {
  return (
    <Suspense fallback={null}>
      <TopikContent />
    </Suspense>
  );
}
