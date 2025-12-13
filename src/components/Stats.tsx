import { Users, Hotel, Map, Star } from "lucide-react";

const stats = [
  { icon: Users, value: "50K+", label: "Happy Tourists" },
  { icon: Hotel, value: "300+", label: "Hotels Listed" },
  { icon: Map, value: "25+", label: "Destinations" },
  { icon: Star, value: "4.8", label: "Average Rating" },
];

const Stats = () => {
  return (
    <section className="py-16 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="text-center">
                <Icon className="h-10 w-10 mx-auto mb-3 opacity-90" />
                <div className="text-3xl md:text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-sm md:text-base opacity-90">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Stats;
