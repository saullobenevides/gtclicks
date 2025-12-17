import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function FeaturesGrid({ highlights = [] }) {
  if (!highlights || highlights.length === 0) return null;

  return (
    <section className="container-wide">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {highlights.map((item, index) => (
          <Card key={index} className="glass-panel p-8 transition-all hover:bg-white/5">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-2xl font-bold text-white">{item.title}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <p className="text-gray-400 leading-relaxed">{item.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
