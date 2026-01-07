import { Helmet } from 'react-helmet-async';

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
      </Helmet>

      <div className="max-w-4xl mx-auto mt-20 px-6 lg:px-8 pb-16">
        <div className="border-t border-slate-200 pt-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">{data.heading}</h2>

          <div className="grid md:grid-cols-2 gap-x-12 gap-y-10">
            {data.content.map((block, index) => (
              <div key={index} className="prose prose-slate max-w-none">
                <h3 className="text-xl font-bold text-slate-800 mb-3">{block.title}</h3>
                
                {block.type === 'steps' && block.items && (
                  <ol className="list-decimal pl-5 space-y-2 text-slate-600">
                    {block.items.map((item, i) => <li key={i}>{item}</li>)}
                  </ol>
                )}

                {block.type === 'features' && block.items && (
                  <ul className="list-disc pl-5 space-y-2 text-slate-600">
                    {block.items.map((item, i) => (
                      <li key={i} dangerouslySetInnerHTML={{ 
                        __html: item.replace(/\*\*(.*?)\*\*/g, '<span class="font-bold text-slate-800">$1</span>') 
                      }} />
                    ))}
                  </ul>
                )}

                {block.type === 'text' && block.text && (
                  <p className="text-slate-600 leading-relaxed">{block.text}</p>
                )}

                {block.type === 'faq' && block.items && (
                  <div className="space-y-4 mt-4">
                    {block.items.map((faq, i) => (
                      <div key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <p className="font-bold text-slate-800 mb-2 text-sm">❓ {faq.q}</p>
                        <p className="text-slate-600 text-sm">✅ {faq.a}</p>
                      </div>
                    ))}
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
