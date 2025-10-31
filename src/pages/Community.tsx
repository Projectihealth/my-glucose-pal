import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sparkles, Users } from "lucide-react";

const FEED_ITEMS = [
  {
    name: "Riley P.",
    initials: "RP",
    headline: "Shifted dinner to 6pm and added a 15-minute walk",
    details:
      "My overnight highs flattened out after I prepped lighter meals and scheduled a post-dinner walk. My coach suggested it, but hearing others doing it helped me commit.",
    tags: ["Overnight highs", "Movement", "Meal timing"],
  },
  {
    name: "Maribel L.",
    initials: "ML",
    headline: "Fiber-first breakfast changed my mornings",
    details:
      "I now eat chia pudding before coffee. Olivia surfaced 3 similar wins from the community and it convinced me to try it. My morning spikes are down by 35 mg/dL.",
    tags: ["Morning spike", "Nutrition", "Olivia tip"],
  },
  {
    name: "Jordan K.",
    initials: "JK",
    headline: "Challenge accepted: 3-day hydration streak",
    details:
      "Joined the hydration challenge last week. Logging water kept me mindful and surprisingly cut my afternoon crashes. Celebrating with everyone kept me going!",
    tags: ["Challenge", "Hydration", "Afternoon crash"],
  },
];

const Community = () => (
  <section className="px-6 py-8 space-y-6">
    <header className="space-y-3 text-center">
      <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-primary">
        <Users className="h-4 w-4" />
        <span className="text-xs font-medium tracking-wide uppercase">Community</span>
      </div>
      <h1 className="text-3xl font-semibold">Connect. Share. Celebrate.</h1>
      <p className="text-sm text-muted-foreground">
        Step into a peer-powered space where people living with diabetes share anonymized patterns, wins, and real-life tricks that helped them stay in range.
      </p>
    </header>

    <Card className="rounded-3xl border-border/60 p-5 bg-gradient-to-br from-primary/5 via-background to-background">
      <div className="flex flex-col gap-3 text-sm">
        <div className="flex items-center gap-2 text-primary">
          <Sparkles className="h-4 w-4" />
          <span className="font-medium">Olivia curates for you</span>
        </div>
        <p className="text-muted-foreground">
          The AI butler listens for the patterns you&apos;re navigating and surfaces relevant peer experiences—so you see what worked for others before you spend weeks experimenting.
        </p>
        <ul className="grid gap-2 text-muted-foreground/90 text-xs sm:grid-cols-2">
          <li>• Suggests stories that match your CGM trends</li>
          <li>• Flags friendly challenges aligned with your current goals</li>
          <li>• Highlights verified tips endorsed by clinical coaches</li>
          <li>• Keeps sharing anonymous and privacy-forward</li>
        </ul>
      </div>
    </Card>

    <section aria-label="Community feed" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Community feed</h2>
        <p className="text-xs text-muted-foreground">Real wins from people just like you</p>
      </div>

      <div className="space-y-4">
        {FEED_ITEMS.map((item) => (
          <Card key={item.headline} className="rounded-3xl border-border/60 p-5 space-y-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback>{item.initials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold">{item.name}</p>
                <p className="text-xs text-muted-foreground">Shared a lifestyle shift</p>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium">{item.headline}</h3>
              <p className="text-sm text-muted-foreground">{item.details}</p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-primary">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-primary/10 px-3 py-1 font-medium uppercase tracking-wide"
                >
                  {tag}
                </span>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </section>
  </section>
);

export default Community;
