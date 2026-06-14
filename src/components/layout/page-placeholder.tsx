type PagePlaceholderProps = {
  title: string;
  description: string;
  cardText: string;
};

export function PagePlaceholder({
  title,
  description,
  cardText,
}: PagePlaceholderProps) {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-stone-950 dark:text-stone-50">
          {title}
        </h1>
        <p className="max-w-3xl text-base leading-7 text-stone-600 dark:text-stone-300">
          {description}
        </p>
      </div>

      <section className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
        <p className="text-sm font-medium text-stone-700 dark:text-stone-200">
          {cardText}
        </p>
      </section>
    </div>
  );
}
