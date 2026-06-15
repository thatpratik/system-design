import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypePrettyCode from "rehype-pretty-code";
import type { ComponentProps } from "react";

type MdxContentProps = {
  source: string;
  components?: Record<string, React.ComponentType>;
};

const mdxComponents = {
  table: (props: ComponentProps<"table">) => (
    <div className="overflow-x-auto my-6">
      <table {...props} />
    </div>
  ),
};

export function MdxContent({ source, components }: MdxContentProps) {
  return (
    <div className="prose prose-slate max-w-none prose-headings:font-semibold prose-a:text-primary prose-code:before:content-none prose-code:after:content-none prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:rounded-none [&_pre_code]:text-[length:inherit] [&_pre_code]:leading-relaxed">
      <MDXRemote
        source={source}
        components={{ ...mdxComponents, ...components }}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [[rehypePrettyCode, { theme: "one-dark-pro" }]] as never,
          },
        }}
      />
    </div>
  );
}
