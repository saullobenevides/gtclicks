import { SectionHeader } from '@/components/shared/layout';
import { FeatureCard } from '@/components/shared/cards';

export default function FeaturesGrid({ title, description, highlights = [] }) {
  if (!highlights || highlights.length === 0) return null;

  return (
    <section className="container-wide py-16">
      {(title || description) && (
        <SectionHeader 
          title={title}
          description={description}
        />
      )}

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {highlights.map((item, index) => (
          <FeatureCard
            key={index}
            title={item.title}
            description={item.body}
            variant="default"
          />
        ))}
      </div>
    </section>
  );
}

