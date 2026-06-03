export type Category =
  | "storage"
  | "messaging"
  | "compute"
  | "networking"
  | "coordination"
  | "observability";

export interface ComponentMeta {
  title: string;
  slug: string;
  category: Category;
  summary: string;
  /** slugs of systems that use this component */
  usedIn: string[];
  /** slugs of alternative components for comparison */
  alternatives: string[];
  externalLinks: ExternalLink[];
  /** structured comparison fields */
  strengths?: string[];
  weaknesses?: string[];
  bestFor?: string[];
  notFor?: string[];
}

export interface SystemMeta {
  title: string;
  slug: string;
  category: Category;
  summary: string;
  /** slugs of components used by this system */
  components: string[];
  externalLinks: ExternalLink[];
}

export interface ExternalLink {
  label: string;
  url: string;
}

export interface ContentItem<T> {
  meta: T;
  /** raw MDX string — passed to next-mdx-remote for rendering */
  content: string;
}
