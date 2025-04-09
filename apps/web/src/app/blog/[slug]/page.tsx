import { notFound } from "next/navigation";
import type { PortableTextBlock } from "next-sanity";

import { RichText } from "@/components/richtext";
import { SanityImage } from "@/components/sanity-image";
import { TableOfContent } from "@/components/table-of-content";
import { getUserId } from "@/lib/ld/cookie";
import { getVariation } from "@/lib/ld/server";
import { client } from "@/lib/sanity/client";
import { sanityFetch } from "@/lib/sanity/live";
import { queryBlogPaths, queryBlogSlugPageData } from "@/lib/sanity/query";
import { getMetaData } from "@/lib/seo";

async function fetchBlogSlugPageData(params: {
  slug: string;
  imageFlag: string;
  nameFlag: string;
  imageVariation: string;
  nameVariation: boolean;
}) {
  return await sanityFetch({
    query: queryBlogSlugPageData,
    params,
  });
}

async function fetchBlogPaths() {
  const slugs = await client.fetch(queryBlogPaths);
  const paths: { slug: string }[] = [];
  for (const slug of slugs) {
    if (!slug) continue;
    const [, , path] = slug.split("/");
    if (path) paths.push({ slug: path });
  }
  return paths;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const imageFlag = "image";
  const nameFlag = "name";
  const imageVariation = "control";
  const nameVariation = false;
  const queryParams = {
    slug: `/blog/${slug}`,
    imageFlag,
    nameFlag,
    imageVariation,
    nameVariation,
  };
  const { data } = await fetchBlogSlugPageData(queryParams);
  if (!data) return getMetaData({});
  return getMetaData(data);
}

export async function generateStaticParams() {
  return await fetchBlogPaths();
}

export default async function BlogSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const userId = await getUserId();

  const context = {
    kind: "user",
    key: userId,
  };
  const imageFlag = "image";
  const nameFlag = "name";
  const imageVariation = (await getVariation(
    imageFlag,
    context,
    "control",
  )) as string;
  const nameVariation = (await getVariation(
    nameFlag,
    context,
    false,
  )) as boolean;

  const queryParams = {
    slug: `/blog/${slug}`,
    imageFlag,
    nameFlag,
    imageVariation,
    nameVariation,
  };
  const { data } = await fetchBlogSlugPageData(queryParams);
  if (!data) return notFound();
  const { title, description, image, richText } = data ?? {};

  // Cast richText to RichText type
  const typedRichText: PortableTextBlock[] | undefined = richText as
    | PortableTextBlock[]
    | undefined;


  return (
    <div className="container my-16 mx-auto px-4 md:px-6">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_300px]">
        <main>
          <header className="mb-8">
            <h1 className="mt-2 text-4xl font-bold">{title}</h1>
            <p className="mt-4 text-lg text-muted-foreground">{description}</p>
          </header>
          {image && (
            <div className="mb-12">
              <SanityImage
                asset={image}
                alt={title}
                width={1600}
                loading="eager"
                priority
                height={900}
                className="rounded-lg h-auto w-full"
              />
            </div>
          )}
          <RichText richText={richText ?? []} />
        </main>

        <aside className="hidden lg:block">
          <div>
            <h3 className="mt-2 text-xl font-bold">{data.authors.name}</h3>
            <SanityImage
              asset={data.authors.image}
              alt={title}
              width={300}
              height={250}
              loading="eager"
              priority
              className="flex-none rounded-full bg-gray-50"
            />
          </div>
          <div className="sticky top-4 rounded-lg ">
            <TableOfContent richText={typedRichText} />
          </div>
        </aside>
      </div>
    </div>
  );
}
