import { useState } from "react";
import { ChevronDown, BookOpen, Clock } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { LEARN_TOPICS } from "@/lib/learnContent";
import { cn } from "@/lib/utils";

export default function Learn() {
  const [openId, setOpenId] = useState<string | null>(LEARN_TOPICS[0].id);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container py-8 md:py-12 max-w-4xl">
        <div className="mb-10 animate-fade-in">
          <p className="text-xs font-semibold uppercase tracking-wider text-accent mb-2">
            Learn · Personal finance fundamentals
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            The basics, done right
          </h1>
          <p className="mt-2 text-muted-foreground max-w-2xl">
            Eight short lessons covering the principles behind every recommendation in this app.
            Read one a day for a week and you'll know more than 90% of people.
          </p>
        </div>

        <div className="space-y-3">
          {LEARN_TOPICS.map((topic) => {
            const isOpen = openId === topic.id;
            return (
              <div
                key={topic.id}
                className={cn(
                  "rounded-xl border bg-card transition-all overflow-hidden",
                  isOpen ? "border-accent/40 shadow-sm-soft" : "border-border",
                )}
              >
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : topic.id)}
                  className="w-full flex items-center gap-4 p-5 text-left hover:bg-secondary/40 transition-smooth"
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                      isOpen ? "bg-accent text-accent-foreground" : "bg-secondary text-primary",
                    )}
                  >
                    <topic.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-foreground">{topic.title}</h2>
                    <p className="text-sm text-muted-foreground truncate">{topic.description}</p>
                  </div>
                  <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                    <Clock className="h-3 w-3" />
                    <span>{topic.readMinutes} min</span>
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 text-muted-foreground transition-transform shrink-0",
                      isOpen && "rotate-180",
                    )}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-6 pt-2 border-t border-border animate-fade-in">
                    {topic.lessons.map((lesson) => (
                      <div key={lesson.id} className="space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground mb-1">
                            {lesson.title}
                          </h3>
                          <p className="text-sm text-muted-foreground italic">{lesson.summary}</p>
                        </div>

                        <div className="space-y-3">
                          {lesson.body.map((p, i) => (
                            <p key={i} className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
                              {p}
                            </p>
                          ))}
                        </div>

                        <div className="rounded-lg border border-accent/20 bg-accent-soft p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <BookOpen className="h-3.5 w-3.5 text-accent" />
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-accent">
                              Key takeaways
                            </p>
                          </div>
                          <ul className="space-y-1.5">
                            {lesson.takeaways.map((t, i) => (
                              <li key={i} className="flex gap-2 text-sm text-foreground/80">
                                <span className="text-accent mt-0.5">→</span>
                                <span>{t}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-12">
          Educational content, not personalized financial advice. Consult a fiduciary advisor for your specific situation.
        </p>
      </main>
    </div>
  );
}
