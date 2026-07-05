export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface CategorySummary extends Category {
  description: string;
  datasetCount: number;
}

export interface Dataset {
  id: number;
  categoryId: number;
  sourceId: string;
  name: string;
  sourceApiUrl: string;
  syncFrequency: "weekly" | "monthly";
  lastSyncedAt: string | null;
}
