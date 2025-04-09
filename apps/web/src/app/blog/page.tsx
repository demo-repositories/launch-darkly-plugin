import { notFound } from "next/navigation";

import type { Blog } from "@/components/blog-card";
import { BlogCard, BlogHeader, FeaturedBlogCard } from "@/components/blog-card";
import { PageBuilder } from "@/components/pagebuilder";
import { getUserId } from "@/lib/ld/cookie";
import { getVariation } from "@/lib/ld/server";
import { sanityFetch } from "@/lib/sanity/live";
import { queryBlogIndexPageData } from "@/lib/sanity/query";
import { getMetaData } from "@/lib/seo";
import { handleErrors } from "@/utils";

async function fetchBlogPosts(params: {
  imageFlag: string;
  nameFlag: string;
  imageVariation: string;
  nameVariation: string;
}) {
  return await handleErrors(
    sanityFetch({ query: queryBlogIndexPageData, params }),
  );
}

export async function generateMetadata(params: {
  imageFlag: string;
  nameFlag: string;
  imageVariation: string;
  nameVariation: string;
}) {
  const imageFlag = "image";
  const nameFlag = "name";
  const imageVariation = "control";
  const nameVariation = false;

  const queryParams = {
    imageFlag,
    nameFlag,
    imageVariation,
    nameVariation,
  };
  const result = await sanityFetch({
    query: queryBlogIndexPageData,
    params: queryParams,
  });
  if (!result?.data) return getMetaData({});
  return getMetaData(result.data);
}

export default async function BlogIndexPage() {
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
    "long",
  )) as string;

  console.log({ nameVariation });

  const queryParams = await {
    imageFlag,
    nameFlag,
    imageVariation,
    nameVariation,
  };
  const [res, err] = await fetchBlogPosts(queryParams);
  if (err || !res?.data) notFound();

  const {
    blogs = [],
    title,
    description,
    pageBuilder = [],
    _id,
    _type,
    displayFeaturedBlogs,
    featuredBlogsCount,
  } = res.data;

  const validFeaturedBlogsCount = featuredBlogsCount
    ? Number.parseInt(featuredBlogsCount)
    : 0;

  if (!blogs.length) {
    return (
      <main className="container my-16 mx-auto px-4 md:px-6">
        <BlogHeader title={title} description={description} />
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No blog posts available at the moment.
          </p>
        </div>
        {pageBuilder && pageBuilder.length > 0 && (
          <PageBuilder pageBuilder={pageBuilder} id={_id} type={_type} />
        )}
      </main>
    );
  }

  const shouldDisplayFeaturedBlogs =
    displayFeaturedBlogs && validFeaturedBlogsCount > 0;

  const featuredBlogs = shouldDisplayFeaturedBlogs
    ? blogs.slice(0, validFeaturedBlogsCount)
    : [];
  const remainingBlogs = shouldDisplayFeaturedBlogs
    ? blogs.slice(validFeaturedBlogsCount)
    : blogs;

  return (
    <main className="bg-background">
      <div className="container my-16 mx-auto px-4 md:px-6">
        <BlogHeader title={title} description={description} />

        {featuredBlogs.length > 0 && (
          <div className="mx-auto mt-8 sm:mt-12 md:mt-16 mb-12 lg:mb-20 grid grid-cols-1 gap-8 md:gap-12">
            {featuredBlogs.map((blog: Blog) => (
              <FeaturedBlogCard key={blog._id} blog={blog} />
            ))}
          </div>
        )}

        {remainingBlogs.length > 0 && (
          <div className="grid grid-cols-1 gap-8 md:gap-12 lg:grid-cols-2 mt-8">
            {remainingBlogs.map((blog: Blog) => (
              <BlogCard key={blog._id} blog={blog} />
            ))}
          </div>
        )}
      </div>

      {pageBuilder && pageBuilder.length > 0 && (
        <PageBuilder pageBuilder={pageBuilder} id={_id} type={_type} />
      )}
    </main>
  );
}
