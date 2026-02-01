import { Helmet } from 'react-helmet-async';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface SeoBlock {
  title: string;
  type: 'steps' | 'features' | 'text' | 'faq';
  items?: any[];
  text?: string;
}

interface SeoData {
  title: string;
  description: string;
  keywords: string;
  heading: string;
  content: SeoBlock[];
}

interface SeoContentProps {
  data?: SeoData;
}

export const SeoContent = ({ data }: SeoContentProps) => {
  if (!data) return null;

  // Helper to generate FAQ schema
  const generateFaqSchema = () => {
    const faqBlock = data.content.find(b => b.type === 'faq');
    if (!faqBlock || !faqBlock.items) return null;

    const targetQs = [
      "Can I combine multiple JPGs?",
      "Is it safe?",
      "Does the quality decrease?"
    ];

    const itemsFiltered = faqBlock.items.filter((it: any) => targetQs.includes(it.q));
    const itemsForSchema = itemsFiltered.length > 0 ? itemsFiltered : faqBlock.items;
    
    const schema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": itemsForSchema.map((item: any) => ({
        "@type": "Question",
        "name": item.q,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": item.a
        }
      }))
    };
    
    return JSON.stringify(schema);
  };

  const faqSchema = generateFaqSchema();

  return (
    <>
      <Helmet>
        <title>{data.title}</title>
        <meta name="description" content={data.description} />
        <meta name="keywords" content={data.keywords} />
        <link rel="canonical" href={window.location.href} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={data.title} />
        <meta property="og:description" content={data.description} />
        <meta property="og:image" content="https://pixelpress.replit.app/social-preview.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={data.title} />
        <meta name="twitter:description" content={data.description} />
        <meta name="twitter:image" content="https://pixelpress.replit.app/social-preview.jpg" />
        {faqSchema && (
          <script type="application/ld+json">
            {faqSchema}
          </script>
        )}
      </Helmet>

      <div className="max-w-4xl mx-auto mt-20 px-6 lg:px-8 pb-16">
        <div className="border-t border-slate-200 pt-16">
          {(() => {
            const headingLower = (data.heading || '').toLowerCase();
            const isJpgToPdfHeading = headingLower.includes('convert jpg images to pdf for free');
            return isJpgToPdfHeading ? (
              <h1 className="text-3xl md:text-4xl font-extrabold text-[#333333] mb-8 text-center">{data.heading}</h1>
            ) : (
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#333333] mb-8 text-center">{data.heading}</h2>
            );
          })()}

          <div className="grid md:grid-cols-2 gap-x-12 gap-y-10 items-start content-start">
            {data.content.map((block, index) => (
              <div key={index} className="max-w-none">
                <h2 className="text-2xl font-bold text-[#333333] mb-4">{block.title}</h2>
                
                {block.type === 'steps' && block.items && (
                  <ol className="list-decimal pl-5 space-y-2 text-[#333333]">
                    {block.items.map((item, i) => <li key={i}>{item}</li>)}
                  </ol>
                )}

                {block.type === 'features' && block.items && (
                  <ul className="list-disc pl-5 space-y-2 text-[#333333]">
                    {block.items.map((item, i) => (
                      <li key={i} dangerouslySetInnerHTML={{ 
                        __html: item.replace(/\*\*(.*?)\*\*/g, '<span class="font-bold text-[#333333]">$1</span>') 
                      }} />
                    ))}
                  </ul>
                )}

                {block.type === 'text' && block.text && (
                  <p className="text-[#333333] leading-relaxed">{block.text}</p>
                )}

                {block.type === 'faq' && block.items && (
                  <div className="mt-2">
                    <Accordion type="single" collapsible className="w-full">
                      {block.items.map((faq, i) => (
                        <AccordionItem key={i} value={`item-${i}`}>
                          <AccordionTrigger className="text-left text-base font-semibold text-[#333333]">
                            {faq.q}
                          </AccordionTrigger>
                          <AccordionContent className="text-sm text-[#333333] leading-relaxed">
                            {faq.a}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
