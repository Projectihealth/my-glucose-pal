import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

const ARTICLES = [
  {
    id: "olivia-overview",
    title: "Meet Your CGM Coach, Olivia",
    summary: "Discover how Olivia weaves CGM trends, coaching insights, and community support into your daily routine.",
    readTime: "8 min read",
    to: "/learn-more/olivia",
  },
  {
    id: "cgm-basics",
    title: "CGM Foundations",
    summary: "Understand how sensors track glucose, what key metrics mean, and how to respond in real time.",
    readTime: "6 min read",
    to: "/learn-more/cgm-foundations",
  },
  {
    id: "nutrition-playbook",
    title: "Nutrition Playbook for Steady Glucose",
    summary: "Build meals that balance macros, reduce spikes, and still feel satisfying.",
    readTime: "7 min read",
    to: "/learn-more/nutrition-playbook",
  },
];

const PODCASTS = [
  {
    title: "Training with CGM: Coach Olivia Answers FAQs",
    duration: "24 min",
    description: "A guided conversation on pre-workout fueling, insulin adjustments, and staying confident mid-session.",
    category: "Podcast",
  },
  {
    title: "The Psychology of Staying in Range",
    duration: "31 min",
    description: "Behavioral scientist Dr. Hall shares strategies to avoid burnout and build supportive habits.",
    category: "Podcast",
  },
];

const VIDEOS = [
  {
    title: "5 CGM Patterns You Should Know",
    duration: "12 min",
    description: "Visual breakdown of dawn phenomenon, dual peaks, and how Olivia flags them early.",
    category: "Video",
  },
  {
    title: "Meal Stacking for Smooth Evenings",
    duration: "9 min",
    description: "Dietitian-led walkthrough pairing dinner choices with real CGM traces.",
    category: "Video",
  },
];

const LearnMore = () => (
  <div className="min-h-full bg-muted/30">
    <section className="px-6 pt-16 pb-12 bg-white">
      <div className="space-y-4 max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary/70">Resource Library</p>
        <h1 className="text-3xl font-bold leading-tight">Learn, listen, and watch to master your CGM</h1>
        <p className="text-sm text-muted-foreground">
          Articles, podcasts, and videos curated by Olivia. Drop back anytime you need a quick refresher or a deep dive before chatting with your care team.
        </p>
      </div>
    </section>

    <section className="px-6 py-10 space-y-6">
      <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Articles</h2>
          <p className="text-sm text-muted-foreground">
            Tap an article to dive deeper. Olivia personalizes highlights based on your current CGM patterns.
          </p>
          <div className="space-y-3">
            {ARTICLES.map((article) => (
              <Link
                key={article.id}
                to={article.to}
                className="block w-full rounded-2xl border border-border/70 bg-white px-4 py-4 transition hover:border-primary/40 hover:bg-primary/5"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold leading-snug">{article.title}</p>
                  <ArrowUpRight className="h-4 w-4 flex-shrink-0 text-primary" />
                </div>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{article.summary}</p>
                <p className="mt-3 text-xs font-medium text-muted-foreground">{article.readTime}</p>
              </Link>
            ))}
          </div>
        </div>

        <Card className="rounded-3xl border-border/60 p-6 bg-white space-y-3">
          <h3 className="text-lg font-semibold">Why the library matters</h3>
          <p className="text-sm text-muted-foreground">
            Olivia curates education based on the patterns she detects. Bite-size refreshers sit next to deep dives so you can tailor conversations with your care team.
          </p>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>• Articles: in-depth guides and feature explainers.</li>
            <li>• Podcasts: expert voices sharing practical advice.</li>
            <li>• Videos: step-by-step walkthroughs with real CGM traces.</li>
          </ul>
        </Card>
      </div>
    </section>

    <section className="px-6 pb-10 space-y-4">
      <h2 className="text-lg font-semibold">Podcasts</h2>
      <div className="grid gap-4 lg:grid-cols-2">
        {PODCASTS.map((podcast) => (
          <Card key={podcast.title} className="rounded-3xl border-border/60 p-5 bg-white space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary/70">{podcast.category}</p>
            <h3 className="text-base font-semibold">{podcast.title}</h3>
            <p className="text-sm text-muted-foreground">{podcast.description}</p>
            <p className="text-xs font-medium text-muted-foreground">{podcast.duration}</p>
          </Card>
        ))}
      </div>
    </section>

    <section className="px-6 pb-16 space-y-4">
      <h2 className="text-lg font-semibold">Videos</h2>
      <div className="grid gap-4 lg:grid-cols-2">
        {VIDEOS.map((video) => (
          <Card key={video.title} className="rounded-3xl border-border/60 p-5 bg-white space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary/70">{video.category}</p>
            <h3 className="text-base font-semibold">{video.title}</h3>
            <p className="text-sm text-muted-foreground">{video.description}</p>
            <p className="text-xs font-medium text-muted-foreground">{video.duration}</p>
          </Card>
        ))}
      </div>
    </section>
  </div>
);

export default LearnMore;
